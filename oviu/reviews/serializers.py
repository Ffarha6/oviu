from rest_framework import serializers
from .models import Review
from accounts.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer للتقييمات"""
    user_name = serializers.ReadOnlyField(source='user.username')
    user_email = serializers.ReadOnlyField(source='user.email')
    rating_display = serializers.ReadOnlyField()
    created_at_display = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'user_email', 'product',
            'rating', 'rating_display', 'title', 'comment',
            'image1', 'image2', 'is_approved', 'created_at', 'created_at_display'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'is_approved']

    def get_created_at_display(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M")


class CreateReviewSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء تقييم جديد"""

    class Meta:
        model = Review
        fields = ['product', 'rating', 'title', 'comment', 'image1', 'image2']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("التقييم يجب أن يكون بين 1 و 5")
        return value

    def validate_product(self, value):
        if not value.is_active:
            raise serializers.ValidationError("لا يمكن تقييم منتج غير نشط")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    
    
    
    
    # ══════════════════════════════════════════════════════════════════════════
# ✅ إضافات جديدة للأدمن بانل — ضيفي الكود ده في آخر ملف reviews/serializers.py
# ══════════════════════════════════════════════════════════════════════════
from django.conf import settings as _settings


def _review_computed_status(review):
    if review.is_rejected:
        return 'rejected'
    if review.is_approved:
        return 'approved'
    return 'pending'


class ReviewAdminListSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.ReadOnlyField(source='user.email')
    product_name = serializers.ReadOnlyField(source='product.name')
    product_type = serializers.ReadOnlyField(source='product.product_type')
    computed_status = serializers.SerializerMethodField()
    has_images = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'customer_name', 'customer_email', 'product', 'product_name',
            'product_type', 'rating', 'title', 'comment', 'computed_status',
            'has_images', 'created_at',
        ]

    def get_customer_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username

    def get_computed_status(self, obj):
        return _review_computed_status(obj)

    def get_has_images(self, obj):
        return bool(obj.image1 or obj.image2)


class ReviewAdminDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.ReadOnlyField(source='user.email')
    customer_phone = serializers.ReadOnlyField(source='user.phone')
    product_name = serializers.ReadOnlyField(source='product.name')
    product_type = serializers.ReadOnlyField(source='product.product_type')
    product_id = serializers.ReadOnlyField(source='product.id')
    computed_status = serializers.SerializerMethodField()
    image1_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()
    customer_orders_count = serializers.SerializerMethodField()
    customer_total_spent = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'customer_name', 'customer_email', 'customer_phone',
            'product_id', 'product_name', 'product_type',
            'rating', 'title', 'comment', 'admin_reply',
            'image1_url', 'image2_url', 'computed_status',
            'customer_orders_count', 'customer_total_spent',
            'created_at',
        ]

    def get_customer_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username

    def get_computed_status(self, obj):
        return _review_computed_status(obj)

    def _abs_url(self, image_field):
        request = self.context.get('request')
        if image_field:
            return request.build_absolute_uri(image_field.url) if request else image_field.url
        return None

    def get_image1_url(self, obj):
        return self._abs_url(obj.image1)

    def get_image2_url(self, obj):
        return self._abs_url(obj.image2)

    def get_customer_orders_count(self, obj):
        from orders.models import Order
        return Order.objects.filter(user=obj.user).count()

    def get_customer_total_spent(self, obj):
        from orders.models import Order
        from django.db.models import Sum
        total = Order.objects.filter(user=obj.user, status='delivered').aggregate(
            total=Sum('total_price')
        )['total']
        return float(total or 0)


class ReviewAdminReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['admin_reply']