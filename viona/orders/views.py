from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer
from products.models import Product


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """إنشاء طلب جديد"""
    serializer = CreateOrderSerializer(data=request.data, context={'request': request})

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            items_data = serializer.validated_data['items']
            
            # ✅ جمع كل المنتجات المطلوبة لقفلها
            product_ids = [item['product'].id for item in items_data]
            products = Product.objects.select_for_update().filter(id__in=product_ids)
            products_dict = {p.id: p for p in products}
            
            # ✅ حساب total_price و price_at_time بعد القفل
            total_price = 0
            order_items_to_create = []
            
            for item_data in items_data:
                product = products_dict.get(item_data['product'].id)
                if not product:
                    raise ValueError(f"المنتج {item_data['product'].id} غير موجود")
                
                quantity = item_data['quantity']
                
                # التحقق من المخزون مرة أخرى بعد القفل
                if product.stock < quantity:
                    raise ValueError(f"المنتج {product.name} غير متوفر بالكمية المطلوبة. المتاح: {product.stock}")
                
                # ✅ حساب السعر الحالي بعد القفل
                price_at_time = float(product.get_current_price())
                
                total_price += price_at_time * quantity
                
                order_items_to_create.append({
                    'product': product,
                    'color': item_data.get('color'),
                    'quantity': quantity,
                    'price_at_time': price_at_time
                })
            
            # إنشاء الطلب
            order = Order.objects.create(
                user=request.user,
                total_price=total_price,
                phone=serializer.validated_data['phone'],
                address=serializer.validated_data['address'],
                payment_method=serializer.validated_data.get('payment_method', 'cash'),
                notes=serializer.validated_data.get('notes', ''),
                status='pending'
            )
            
            # إنشاء OrderItems وتحديث المخزون
            for item_data in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    color=item_data['color'],
                    quantity=item_data['quantity'],
                    price_at_time=item_data['price_at_time']
                )
                # تحديث المخزون
                item_data['product'].stock -= item_data['quantity']
                item_data['product'].save()
            
            # ✅ FIX: ضفنا context={'request': request} عشان product_image يرجع
            # رابط كامل (http://...) بدل مسار نسبي بس
            order_serializer = OrderSerializer(order, context={'request': request})
            return Response(order_serializer.data, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """جلب كل أوردرات المستخدم الحالي"""
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    # ✅ FIX: نفس الحكاية - كان مفيش context، فصور المنتجات هنا كانت بترجع
    # مسار نسبي بس (ده اللي كان بيسبب نفس مشكلة الصور في تاب "طلباتي" بالبروفايل)
    serializer = OrderSerializer(orders, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    """جلب تفاصيل أوردر معين"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    # ✅ FIX: ده أهم مكان - صفحة تأكيد الطلب بتنادي الـ endpoint ده بالظبط
    serializer = OrderSerializer(order, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_order_status(request, order_id):
    """تحديث حالة الأوردر (لأدمن فقط)"""
    order = get_object_or_404(Order, id=order_id)
    serializer = UpdateOrderStatusSerializer(order, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_status = serializer.validated_data['status']
    
    # ✅ التحقق من صحة انتقال الحالات
    valid_transitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': [],
        'cancelled': []
    }
    
    if new_status not in valid_transitions.get(order.status, []):
        return Response(
            {"error": f"لا يمكن تغيير الحالة من {order.get_status_display()} إلى {dict(Order.STATUS_CHOICES).get(new_status, new_status)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_status == 'shipped' and not order.shipped_date:
        order.shipped_date = timezone.now()
    elif new_status == 'delivered' and not order.delivered_date:
        order.delivered_date = timezone.now()
    elif new_status == 'cancelled' and order.is_paid:
        # إعادة المخزون لو الطلب كان مدفوع وتم إلغاؤه
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()

    order.status = new_status
    order.save()

    result_serializer = OrderSerializer(order, context={'request': request})
    return Response(result_serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """إلغاء أوردر"""
    order = get_object_or_404(Order, id=order_id, user=request.user)

    if order.status in ['shipped', 'delivered']:
        return Response(
            {"error": f"لا يمكن إلغاء طلب بحالة: {order.get_status_display()}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    order.status = 'cancelled'
    order.save()

    # إعادة المخزون
    for item in order.items.all():
        item.product.stock += item.quantity
        item.product.save()

    return Response({"message": "تم إلغاء الطلب بنجاح"})


@api_view(['GET'])
def track_order(request, tracking_number):
    """تتبع الطلب بدون تسجيل دخول"""
    order = get_object_or_404(Order, tracking_number=tracking_number)
    serializer = OrderSerializer(order, context={'request': request})
    return Response({
        'status': order.get_status_display(),
        'tracking_number': order.tracking_number,
        'order_details': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders_list(request):
    """جلب جميع الطلبات للمشرفين"""
    orders = Order.objects.all().order_by('-created_at')

    status_filter = request.GET.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter)

    paginator = PageNumberPagination()
    paginator.page_size = 50
    page = paginator.paginate_queryset(orders, request)
    serializer = OrderSerializer(page, many=True, context={'request': request})

    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders_stats(request):
    """إحصائيات الطلبات للمشرفين"""
    from django.db.models import Sum

    stats = {
        'total_orders': Order.objects.count(),
        'pending_orders': Order.objects.filter(status='pending').count(),
        'shipped_orders': Order.objects.filter(status='shipped').count(),
        'delivered_orders': Order.objects.filter(status='delivered').count(),
        'cancelled_orders': Order.objects.filter(status='cancelled').count(),
        'total_revenue': Order.objects.filter(status='delivered').aggregate(
            Sum('total_price')
        )['total_price__sum'] or 0,
    }

    return Response(stats)


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_cart(request):
    """سلة التسوق (session-based)"""
    session_key = f'cart_{request.user.id}'

    if request.method == 'GET':
        cart = request.session.get(session_key, [])
        cart_details = []
        for item in cart:
            try:
                product = Product.objects.get(id=item['product_id'], is_active=True)
                cart_details.append({
                    'product_id': product.id,
                    'name': product.name,
                    'price': float(product.get_current_price()),
                    'quantity': item['quantity'],
                    'available_stock': product.stock
                })
            except Product.DoesNotExist:
                continue
        return Response(cart_details)

    elif request.method == 'POST':
        items = request.data.get('items', [])
        request.session[session_key] = items
        return Response({'message': 'تم حفظ السلة بنجاح'})

    elif request.method == 'DELETE':
        request.session[session_key] = []
        return Response({'message': 'تم مسح السلة بنجاح'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def repeat_order(request, order_id):
    """إعادة طلب نفس المنتجات"""
    old_order = get_object_or_404(Order, id=order_id, user=request.user)

    items_data = []
    for item in old_order.items.all():
        if item.product.stock >= item.quantity:
            items_data.append({
                'product_id': item.product.id,
                'color_id': item.color.id if item.color else None,
                'quantity': item.quantity
            })

    if not items_data:
        return Response(
            {"error": "لا توجد منتجات متاحة لإعادة الطلب"},
            status=status.HTTP_400_BAD_REQUEST
        )

    new_data = {
        'phone': old_order.phone,
        'address': old_order.address,
        'payment_method': old_order.payment_method,
        'notes': old_order.notes,
        'items': items_data
    }

    serializer = CreateOrderSerializer(data=new_data, context={'request': request})

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            validated_items = serializer.validated_data['items']
            
            # ✅ نفس التعديلات التي في create_order
            product_ids = [item['product'].id for item in validated_items]
            products = Product.objects.select_for_update().filter(id__in=product_ids)
            products_dict = {p.id: p for p in products}
            
            total_price = 0
            order_items_to_create = []
            
            for item_data in validated_items:
                product = products_dict.get(item_data['product'].id)
                if not product:
                    raise ValueError(f"المنتج غير موجود")
                
                quantity = item_data['quantity']
                
                if product.stock < quantity:
                    raise ValueError(f"المنتج {product.name} غير متوفر بالكمية المطلوبة")
                
                price_at_time = float(product.get_current_price())
                total_price += price_at_time * quantity
                
                order_items_to_create.append({
                    'product': product,
                    'color': item_data.get('color'),
                    'quantity': quantity,
                    'price_at_time': price_at_time
                })

            order = Order.objects.create(
                user=request.user,
                total_price=total_price,
                phone=serializer.validated_data['phone'],
                address=serializer.validated_data['address'],
                payment_method=serializer.validated_data.get('payment_method', 'cash'),
                notes=serializer.validated_data.get('notes', ''),
                status='pending'
            )

            for item_data in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    color=item_data['color'],
                    quantity=item_data['quantity'],
                    price_at_time=item_data['price_at_time']
                )
                item_data['product'].stock -= item_data['quantity']
                item_data['product'].save()

            return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)