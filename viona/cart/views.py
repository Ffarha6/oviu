from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
)
from products.models import Product, Color


def get_or_create_cart(request):
    """
    الحصول على سلة ثابتة للمستخدم أو الزائر.

    Guest:
    يعتمد على X-Cart-Id القادم من الـ Frontend.

    Authenticated User:
    يعتمد على السلة المرتبطة بالمستخدم،
    وينقل إليها محتويات Guest Cart عند وجودها.
    """

    guest_cart_id = request.headers.get("X-Cart-Id")

    # =========================
    # مستخدم مسجل دخوله
    # =========================
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(
            user=request.user
        )

        # لو المستخدم كان Guest قبل تسجيل الدخول
        # ننقل محتويات Guest Cart إلى سلة الحساب.
        if guest_cart_id:
            temp_cart = Cart.objects.filter(
                session_key=guest_cart_id,
                user__isnull=True
            ).exclude(pk=cart.pk).first()

            if temp_cart:
                with transaction.atomic():
                    for item in temp_cart.items.select_related(
                        "product", "color"
                    ).all():

                        cart_item, item_created = CartItem.objects.get_or_create(
                            cart=cart,
                            product=item.product,
                            color=item.color,
                            defaults={
                                "quantity": item.quantity
                            }
                        )

                        if not item_created:
                            # لا نتجاوز المخزون عند دمج السلتين
                            new_quantity = cart_item.quantity + item.quantity

                            cart_item.quantity = min(
                                new_quantity,
                                item.product.stock
                            )

                            cart_item.save(update_fields=["quantity"])

                    temp_cart.delete()

        return cart

    # =========================
    # Guest
    # =========================
    if guest_cart_id:
        cart, _ = Cart.objects.get_or_create(
            session_key=guest_cart_id,
            user__isnull=True
        )

        return cart

    # =========================
    # Fallback
    # لو الطلب لا يحتوي على X-Cart-Id
    # =========================
    session_key = request.session.session_key

    if not session_key:
        request.session.create()
        session_key = request.session.session_key

    cart, _ = Cart.objects.get_or_create(
        session_key=session_key,
        user__isnull=True
    )

    return cart


@api_view(["GET"])
@permission_classes([AllowAny])
def get_cart(request):
    """الحصول على محتويات السلة"""

    cart = get_or_create_cart(request)

    serializer = CartSerializer(
        cart,
        context={"request": request}
    )

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def add_to_cart(request):
    """إضافة منتج إلى السلة"""

    serializer = AddToCartSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    cart = get_or_create_cart(request)

    product_id = serializer.validated_data["product_id"]
    color_id = serializer.validated_data.get("color_id")
    quantity = serializer.validated_data["quantity"]

    color = None

    if color_id:
        product_check = get_object_or_404(
            Product,
            id=product_id,
            is_active=True
        )

        color = get_object_or_404(
            Color,
            id=color_id,
            product=product_check
        )

    with transaction.atomic():

        product = get_object_or_404(
            Product.objects.select_for_update(),
            id=product_id,
            is_active=True
        )

        if product.stock <= 0:
            return Response(
                {
                    "error": "عذرًا، هذا المنتج نفذ من المخزون"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_item = CartItem.objects.filter(
            cart=cart,
            product=product,
            color=color
        ).first()

        already_in_cart = (
            existing_item.quantity
            if existing_item
            else 0
        )

        new_total_quantity = already_in_cart + quantity

        if new_total_quantity > product.stock:
            return Response(
                {
                    "error": (
                        f"الكمية المطلوبة غير متوفرة، "
                        f"متبقي {product.stock} فقط في المخزون"
                        + (
                            f" (لديك بالفعل "
                            f"{already_in_cart} في السلة)"
                            if already_in_cart
                            else ""
                        )
                    ),
                    "available_stock": product.stock,
                    "already_in_cart": already_in_cart,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if existing_item:
            existing_item.quantity = new_total_quantity
            existing_item.save(update_fields=["quantity"])

        else:
            CartItem.objects.create(
                cart=cart,
                product=product,
                color=color,
                quantity=quantity
            )

    cart_serializer = CartSerializer(
        cart,
        context={"request": request}
    )

    return Response(
        cart_serializer.data,
        status=status.HTTP_200_OK
    )


@api_view(["PUT", "PATCH"])
@permission_classes([AllowAny])
def update_cart_item(request, item_id):
    """تحديث كمية منتج في السلة"""

    cart = get_or_create_cart(request)

    cart_item = get_object_or_404(
        CartItem,
        id=item_id,
        cart=cart
    )

    serializer = UpdateCartItemSerializer(
        data=request.data
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    quantity = serializer.validated_data["quantity"]

    if quantity == 0:
        cart_item.delete()

    else:
        with transaction.atomic():

            product = Product.objects.select_for_update().get(
                id=cart_item.product_id
            )

            if quantity > product.stock:
                return Response(
                    {
                        "error": (
                            f"الكمية المطلوبة غير متوفرة، "
                            f"متبقي {product.stock} فقط في المخزون"
                        ),
                        "available_stock": product.stock,
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = quantity
            cart_item.save(update_fields=["quantity"])

    cart_serializer = CartSerializer(
        cart,
        context={"request": request}
    )

    return Response(cart_serializer.data)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def remove_from_cart(request, item_id):
    """حذف منتج من السلة"""

    cart = get_or_create_cart(request)

    cart_item = get_object_or_404(
        CartItem,
        id=item_id,
        cart=cart
    )

    cart_item.delete()

    cart_serializer = CartSerializer(
        cart,
        context={"request": request}
    )

    return Response(cart_serializer.data)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def clear_cart(request):
    """تفريغ السلة بالكامل"""

    cart = get_or_create_cart(request)

    cart.clear()

    return Response({
        "message": "تم تفريغ السلة بنجاح"
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def cart_summary(request):
    """ملخص السلة للـ Checkout"""

    cart = get_or_create_cart(request)

    data = {
        "total_price": float(cart.get_total_price()),
        "total_items": cart.get_total_items(),
        "items_count": cart.items.count(),
    }

    return Response(data)