from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone

from .models import Coupon, CouponUsage
from .serializers import (
    CouponAdminListSerializer,
    CouponAdminDetailSerializer,
    CouponWriteSerializer,
)


class AdminCouponPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def _compute_status(coupon):
    now = timezone.now()
    if not coupon.is_active:
        return 'inactive'
    if coupon.valid_from > now:
        return 'scheduled'
    if coupon.valid_to < now:
        return 'expired'
    return 'active'


# ─── إحصائيات الكروت اللي فوق جدول الكوبونات ─────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_coupon_stats(request):
    coupons = list(Coupon.objects.all())
    total = len(coupons)

    active = sum(1 for c in coupons if _compute_status(c) == 'active')
    scheduled = sum(1 for c in coupons if _compute_status(c) == 'scheduled')
    expired = sum(1 for c in coupons if _compute_status(c) == 'expired')

    total_discount = CouponUsage.objects.aggregate(total=Sum('discount_amount'))['total'] or 0

    total_usage_limit = sum(c.usage_limit for c in coupons if c.usage_limit)
    total_used = sum(c.used_count for c in coupons)
    usage_rate = round((total_used / total_usage_limit * 100), 1) if total_usage_limit else 0

    return Response({
        'total_coupons': total,
        'active': active,
        'scheduled': scheduled,
        'expired': expired,
        'active_percent': round((active / total * 100), 1) if total else 0,
        'total_discount_given': float(total_discount),
        'usage_rate': usage_rate,
    })


# ─── قائمة الكوبونات (بحث + فلاتر + صفحات) + إنشاء كوبون جديد ────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_coupons_list(request):
    if request.method == 'POST':
        serializer = CouponWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        coupon = serializer.save()
        return Response(CouponAdminDetailSerializer(coupon).data, status=201)

    coupons = Coupon.objects.all().order_by('-created_at')

    search = request.GET.get('search')
    if search:
        coupons = coupons.filter(Q(code__icontains=search) | Q(name__icontains=search))

    discount_type = request.GET.get('discount_type')
    if discount_type:
        coupons = coupons.filter(discount_type=discount_type)

    status_filter = request.GET.get('status')
    coupons = list(coupons)
    if status_filter:
        coupons = [c for c in coupons if _compute_status(c) == status_filter]

    paginator = AdminCouponPagination()
    page = paginator.paginate_queryset(coupons, request)
    serializer = CouponAdminListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ─── تفاصيل كوبون / تعديل / حذف ──────────────────────────────────────────────
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_coupon_detail(request, coupon_id):
    coupon = get_object_or_404(Coupon, id=coupon_id)

    if request.method == 'GET':
        return Response(CouponAdminDetailSerializer(coupon).data)

    if request.method == 'PATCH':
        serializer = CouponWriteSerializer(coupon, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CouponAdminDetailSerializer(coupon).data)

    if request.method == 'DELETE':
        coupon.delete()
        return Response(status=204)


# ─── إيقاف / تفعيل الكوبون بضغطة واحدة ───────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_coupon_status(request, coupon_id):
    coupon = get_object_or_404(Coupon, id=coupon_id)
    coupon.is_active = not coupon.is_active
    coupon.save(update_fields=['is_active'])
    return Response({'id': coupon.id, 'is_active': coupon.is_active})