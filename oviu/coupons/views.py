from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, ApplyCouponSerializer, CouponUsageSerializer
from orders.models import Order


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_coupon(request):
    """تطبيق كوبون على الطلب"""
    serializer = ApplyCouponSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    code = serializer.validated_data['code']
    coupon = get_object_or_404(Coupon, code=code, is_active=True)
    
    # التحقق من صلاحية الكوبون للمستخدم
    can_use, message = coupon.can_use_by_user(request.user)
    if not can_use:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
    
    # الحصول على سلة المستخدم (من تطبيق cart)
    from cart.models import Cart
    try:
        cart = Cart.objects.get(user=request.user)
        total_amount = cart.get_total_price()
    except Cart.DoesNotExist:
        return Response({'error': 'سلة التسوق فارغة'}, status=status.HTTP_400_BAD_REQUEST)
    
    # التحقق من الحد الأدنى للطلب
    if total_amount < coupon.min_order_amount:
        return Response({
            'error': f'الحد الأدنى للطلب لاستخدام هذا الكوبون هو {coupon.min_order_amount} ج.م'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # حساب الخصم
    discount_amount = coupon.calculate_discount(total_amount)
    final_amount = total_amount - discount_amount
    
    # تخزين الكوبون في الجلسة (للاستخدام عند إنشاء الطلب)
    request.session['applied_coupon'] = {
        'code': coupon.code,
        'discount_amount': float(discount_amount),
        'final_amount': float(final_amount)
    }
    
    return Response({
        'success': True,
        'coupon': CouponSerializer(coupon).data,
        'discount_amount': float(discount_amount),
        'total_before_discount': float(total_amount),
        'total_after_discount': float(final_amount),
        'message': f'تم تطبيق الكوبون {coupon.code} بنجاح'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_coupon(request):
    """إزالة الكوبون المطبق"""
    if 'applied_coupon' in request.session:
        del request.session['applied_coupon']
        return Response({'success': True, 'message': 'تم إزالة الكوبون'})
    
    return Response({'error': 'لا يوجد كوبون مطبق'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_applied_coupon(request):
    """الحصول على الكوبون المطبق حالياً"""
    applied = request.session.get('applied_coupon')
    if applied:
        return Response(applied)
    
    return Response({'has_coupon': False})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_coupons(request):
    """الكوبونات المتاحة للمستخدم"""
    now = timezone.now()
    coupons = Coupon.objects.filter(
        is_active=True,
        valid_from__lte=now,
        valid_to__gte=now
    )
    
    # فلترة الكوبونات التي يمكن للمستخدم استخدامها
    available_coupons = []
    for coupon in coupons:
        can_use, _ = coupon.can_use_by_user(request.user)
        if can_use:
            available_coupons.append(coupon)
    
    serializer = CouponSerializer(available_coupons, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_coupon_usage(request):
    """تاريخ استخدام الكوبونات الخاصة بالمستخدم"""
    usages = CouponUsage.objects.filter(user=request.user).order_by('-used_at')
    serializer = CouponUsageSerializer(usages, many=True)
    return Response(serializer.data)


# ========== APIs للمشرفين فقط ==========

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_coupons(request):
    """جميع الكوبونات (للمشرفين)"""
    coupons = Coupon.objects.all().order_by('-created_at')
    serializer = CouponSerializer(coupons, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_coupon(request):
    """إنشاء كوبون جديد (للمشرفين)"""
    serializer = CouponSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    coupon = serializer.save()
    return Response(CouponSerializer(coupon).data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def update_coupon(request, coupon_id):
    """تحديث كوبون (للمشرفين)"""
    coupon = get_object_or_404(Coupon, id=coupon_id)
    serializer = CouponSerializer(coupon, data=request.data, partial=True)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_coupon(request, coupon_id):
    """حذف كوبون (للمشرفين)"""
    coupon = get_object_or_404(Coupon, id=coupon_id)
    coupon.delete()
    return Response({'message': 'تم حذف الكوبون بنجاح'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def coupon_stats(request, coupon_id):
    """إحصائيات استخدام الكوبون (للمشرفين)"""
    coupon = get_object_or_404(Coupon, id=coupon_id)
    
    from django.db.models import Sum
    stats = {
        'total_used': coupon.used_count,
        'total_discount_given': coupon.usages.aggregate(
            total=Sum('discount_amount')
        )['total'] or 0,
        'usage_limit_remaining': coupon.usage_limit - coupon.used_count if coupon.usage_limit else 'غير محدود',
        'usages': CouponUsageSerializer(coupon.usages.all(), many=True).data
    }
    
    return Response(stats)