from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .models import Product, Color, ProductImage
from .serializers import (
    ProductAdminListSerializer,
    ProductAdminDetailSerializer,
    ProductWriteSerializer,
    ColorWriteSerializer,
    ProductImageUploadSerializer,
)


class AdminProductPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ─── إحصائيات الكروت اللي فوق جدول المنتجات ──────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_product_stats(request):
    qs = Product.objects.all()
    total = qs.count()
    active = qs.filter(is_active=True).count()
    low_stock = qs.filter(stock__gt=0, stock__lte=10).count()
    out_of_stock = qs.filter(stock=0).count()
    now = timezone.now()
    new_this_month = qs.filter(created_at__year=now.year, created_at__month=now.month).count()
    categories = qs.values('product_type').distinct().count()

    return Response({
        'total_products': total,
        'active_products': active,
        'active_percent': round((active / total * 100), 1) if total else 0,
        'low_stock': low_stock,
        'out_of_stock': out_of_stock,
        'out_of_stock_percent': round((out_of_stock / total * 100), 1) if total else 0,
        'new_this_month': new_this_month,
        'categories': categories,
    })


# ─── قائمة المنتجات (مع بحث/فلاتر/ترتيب/صفحات) + إنشاء منتج جديد ─────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_products_list(request):
    if request.method == 'POST':
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(
            ProductAdminDetailSerializer(product, context={'request': request}).data,
            status=201
        )

    products = Product.objects.all().prefetch_related('colors__images')

    search = request.GET.get('search')
    if search:
        products = products.filter(Q(name__icontains=search) | Q(sku__icontains=search))

    category = request.GET.get('category')
    if category:
        products = products.filter(product_type=category)

    gender = request.GET.get('gender')
    if gender:
        products = products.filter(audience=gender)

    status_filter = request.GET.get('status')
    if status_filter == 'active':
        products = products.filter(is_active=True)
    elif status_filter == 'inactive':
        products = products.filter(is_active=False)

    stock_status = request.GET.get('stock_status')
    if stock_status == 'in':
        products = products.filter(stock__gt=10)
    elif stock_status == 'low':
        products = products.filter(stock__gt=0, stock__lte=10)
    elif stock_status == 'out':
        products = products.filter(stock=0)
        
        

    ordering = request.GET.get('ordering', '-created_at')
    allowed = ['price', '-price', 'created_at', '-created_at', 'name', '-name', 'stock', '-stock']
    products = products.order_by(ordering if ordering in allowed else '-created_at')

    paginator = AdminProductPagination()
    page = paginator.paginate_queryset(products, request)
    serializer = ProductAdminListSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


# ─── تفاصيل منتج / تعديل / حذف ──────────────────────────────────────────────
@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == 'GET':
        return Response(ProductAdminDetailSerializer(product, context={'request': request}).data)

    if request.method in ['PATCH', 'PUT']:
        partial = request.method == 'PATCH'
        serializer = ProductWriteSerializer(product, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProductAdminDetailSerializer(product, context={'request': request}).data)

    if request.method == 'DELETE':
        product.delete()
        return Response(status=204)


# ─── تفعيل / إيقاف منتج بضغطة واحدة (الزرار التوجل في الجدول) ────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_product_status(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    product.is_active = not product.is_active
    product.save(update_fields=['is_active'])
    return Response({'id': product.id, 'is_active': product.is_active})


# ─── إدارة الألوان ───────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_add_color(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    data = request.data.copy()
    data['product'] = product.id
    serializer = ColorWriteSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    color = serializer.save()
    return Response(ColorWriteSerializer(color).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_color(request, color_id):
    color = get_object_or_404(Color, id=color_id)
    color.delete()
    return Response(status=204)


# ─── رفع / حذف / تحديد صورة كرئيسية ─────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def admin_upload_image(request, color_id):
    color = get_object_or_404(Color, id=color_id)
    data = request.data.copy()
    data['color'] = color.id
    serializer = ProductImageUploadSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    image = serializer.save()
    return Response(
        ProductImageUploadSerializer(image, context={'request': request}).data,
        status=201
    )


@api_view(['DELETE', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_image_detail(request, image_id):
    image = get_object_or_404(ProductImage, id=image_id)

    if request.method == 'DELETE':
        image.delete()
        return Response(status=204)

    if request.method == 'PATCH':
        image.is_primary = request.data.get('is_primary', image.is_primary)
        image.save()
        return Response(ProductImageUploadSerializer(image, context={'request': request}).data)
    
    
    
    
    
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_update_color(request, color_id):
    color = get_object_or_404(Color, id=color_id)

    serializer = ColorWriteSerializer(
        color,
        data=request.data,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)