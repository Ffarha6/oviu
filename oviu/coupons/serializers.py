from rest_framework import serializers
from .models import Coupon, CouponUsage
from products.models import Product


class CouponSerializer(serializers.ModelSerializer):
    """Serializer للكوبونات"""
    discount_type_display = serializers.ReadOnlyField(source='get_discount_type_display')
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'description',
            'discount_type', 'discount_type_display', 'discount_value',
            'max_discount_amount', 'min_order_amount',
            'valid_from', 'valid_to', 'is_valid',
            'is_active', 'is_first_order_only'
        ]
        read_only_fields = ['id', 'used_count', 'created_at', 'updated_at']


class ApplyCouponSerializer(serializers.Serializer):
    """Serializer لتطبيق كوبون"""
    code = serializers.CharField(max_length=50)
    
    def validate_code(self, value):
        try:
            coupon = Coupon.objects.get(code=value.upper(), is_active=True)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("الكوبون غير صالح")
        
        if not coupon.is_valid:
            raise serializers.ValidationError("الكوبون منتهي الصلاحية أو غير نشط")
        
        return value.upper()


class CouponUsageSerializer(serializers.ModelSerializer):
    """Serializer لتاريخ استخدام الكوبونات"""
    coupon_code = serializers.ReadOnlyField(source='coupon.code')
    coupon_name = serializers.ReadOnlyField(source='coupon.name')
    order_id = serializers.ReadOnlyField(source='order.id')
    
    class Meta:
        model = CouponUsage
        fields = ['id', 'coupon', 'coupon_code', 'coupon_name', 'order_id', 'discount_amount', 'used_at']
        
        
        
        
        
        # ══════════════════════════════════════════════════════════════════════════
# ✅ إضافات جديدة للأدمن بانل — ضيفي الكود ده في آخر ملف coupons/serializers.py
# ══════════════════════════════════════════════════════════════════════════
from django.utils import timezone as _timezone


def _coupon_computed_status(coupon):
    now = _timezone.now()
    if not coupon.is_active:
        return 'inactive'
    if coupon.valid_from > now:
        return 'scheduled'
    if coupon.valid_to < now:
        return 'expired'
    return 'active'


class CouponAdminListSerializer(serializers.ModelSerializer):
    discount_type_display = serializers.ReadOnlyField(source='get_discount_type_display')
    computed_status = serializers.SerializerMethodField()
    usage_percent = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'discount_type', 'discount_type_display',
            'discount_value', 'min_order_amount', 'usage_limit', 'used_count',
            'usage_percent', 'valid_from', 'valid_to', 'is_active',
            'computed_status', 'is_first_order_only', 'created_at',
        ]

    def get_computed_status(self, obj):
        return _coupon_computed_status(obj)

    def get_usage_percent(self, obj):
        if not obj.usage_limit:
            return 0
        return min(100, round(obj.used_count / obj.usage_limit * 100))


class CouponAdminDetailSerializer(serializers.ModelSerializer):
    discount_type_display = serializers.ReadOnlyField(source='get_discount_type_display')
    computed_status = serializers.SerializerMethodField()
    usage_percent = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'description',
            'discount_type', 'discount_type_display', 'discount_value',
            'max_discount_amount', 'min_order_amount',
            'valid_from', 'valid_to', 'is_active', 'computed_status',
            'usage_limit', 'usage_limit_per_user', 'used_count', 'usage_percent',
            'is_first_order_only', 'governorates',
            'created_at', 'updated_at',
        ]

    def get_computed_status(self, obj):
        return _coupon_computed_status(obj)

    def get_usage_percent(self, obj):
        if not obj.usage_limit:
            return 0
        return min(100, round(obj.used_count / obj.usage_limit * 100))


class CouponWriteSerializer(serializers.ModelSerializer):
    """يُستخدم لإنشاء/تعديل الكوبون بالكامل من الأدمن بانل"""
    class Meta:
        model = Coupon
        fields = [
            'code', 'name', 'description',
            'discount_type', 'discount_value', 'max_discount_amount', 'min_order_amount',
            'valid_from', 'valid_to',
            'usage_limit', 'usage_limit_per_user',
            'is_active', 'is_first_order_only',
            'governorates',
        ]

    def validate_code(self, value):
        value = value.strip().upper()
        qs = Coupon.objects.filter(code=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("هذا الكود مستخدم بالفعل")
        return value

    def validate(self, data):
        valid_from = data.get('valid_from', getattr(self.instance, 'valid_from', None))
        valid_to = data.get('valid_to', getattr(self.instance, 'valid_to', None))
        if valid_from and valid_to and valid_to <= valid_from:
            raise serializers.ValidationError({'valid_to': 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية'})
        return data