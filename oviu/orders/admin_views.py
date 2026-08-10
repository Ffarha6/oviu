from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum

from .models import Order
from .serializers import (
    OrderAdminListSerializer,
    OrderAdminDetailSerializer,
    OrderAdminUpdateSerializer,
)


class AdminOrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ─── إحصائيات الكروت اللي فوق جدول الطلبات ────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_order_stats(request):
    qs = Order.objects.all()
    total = qs.count()
    pending = qs.filter(status='pending').count()
    confirmed = qs.filter(status='confirmed').count()
    preparing = qs.filter(status='preparing').count()
    shipped = qs.filter(status='shipped').count()
    delivered = qs.filter(status='delivered').count()
    cancelled = qs.filter(status='cancelled').count()
    total_revenue = qs.filter(status='delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0

    return Response({
        'total_orders': total,
        'pending': pending,
        # ✅ "قيد المعالجة" في التصميم بتجمع الطلبات المؤكدة + قيد التجهيز
        'processing': confirmed + preparing,
        'shipped': shipped,
        'delivered': delivered,
        'cancelled': cancelled,
        'total_revenue': float(total_revenue),
    })


# ─── قائمة الطلبات (بحث + فلاتر + صفحات) ──────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders_list(request):
    orders = Order.objects.all().select_related('user').prefetch_related('items')

    search = request.GET.get('search')
    if search:
        orders = orders.filter(
            Q(id__icontains=search) |
            Q(user__email__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(phone__icontains=search) |
            Q(tracking_number__icontains=search)
        )

    status_filter = request.GET.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter)

    payment_method = request.GET.get('payment_method')
    if payment_method:
        orders = orders.filter(payment_method=payment_method)

    date_from = request.GET.get('date_from')
    if date_from:
        orders = orders.filter(created_at__date__gte=date_from)

    date_to = request.GET.get('date_to')
    if date_to:
        orders = orders.filter(created_at__date__lte=date_to)

    ordering = request.GET.get('ordering', '-created_at')
    allowed = ['created_at', '-created_at', 'total_price', '-total_price']
    orders = orders.order_by(ordering if ordering in allowed else '-created_at')

    paginator = AdminOrderPagination()
    page = paginator.paginate_queryset(orders, request)
    serializer = OrderAdminListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ─── تفاصيل طلب / تعديل بيانات إضافية (ملاحظات، تتبع، حالة الدفع) ────────────
@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_order_detail(request, order_id):
    order = get_object_or_404(
        Order.objects.select_related('user').prefetch_related('items__product__colors__images', 'items__color'),
        id=order_id
    )

    if request.method == 'GET':
        return Response(OrderAdminDetailSerializer(order, context={'request': request}).data)

    serializer = OrderAdminUpdateSerializer(order, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(OrderAdminDetailSerializer(order, context={'request': request}).data)





# ─── تصدير الطلبات كملف CSV (بنفس فلاتر البحث الحالية) ───────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders_export(request):
    import csv
    from django.http import HttpResponse

    orders = Order.objects.all().select_related('user').prefetch_related('items')

    search = request.GET.get('search')
    if search:
        orders = orders.filter(
            Q(id__icontains=search) |
            Q(user__email__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(phone__icontains=search) |
            Q(tracking_number__icontains=search)
        )

    status_filter = request.GET.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter)

    payment_method = request.GET.get('payment_method')
    if payment_method:
        orders = orders.filter(payment_method=payment_method)

    date_from = request.GET.get('date_from')
    if date_from:
        orders = orders.filter(created_at__date__gte=date_from)

    date_to = request.GET.get('date_to')
    if date_to:
        orders = orders.filter(created_at__date__lte=date_to)

    orders = orders.order_by('-created_at')

    response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    response['Content-Disposition'] = 'attachment; filename="orders_export.csv"'
    writer = csv.writer(response)
    writer.writerow(['رقم الطلب', 'العميل', 'البريد الإلكتروني', 'الهاتف', 'عدد العناصر',
                      'الإجمالي', 'طريقة الدفع', 'حالة الدفع', 'الحالة', 'رقم التتبع', 'تاريخ الطلب'])

    status_labels = dict(Order.STATUS_CHOICES)
    payment_labels = dict(Order.PAYMENT_CHOICES)

    for o in orders:
        full_name = f"{o.user.first_name} {o.user.last_name}".strip() or o.user.username
        writer.writerow([
            o.id, full_name, o.user.email, o.phone, o.items.count(),
            o.total_price, payment_labels.get(o.payment_method, o.payment_method),
            'مدفوع' if o.is_paid else 'غير مدفوع',
            status_labels.get(o.status, o.status),
            o.tracking_number or '',
            o.created_at.strftime('%Y-%m-%d %H:%M'),
        ])

    return response