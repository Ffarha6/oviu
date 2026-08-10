from rest_framework import serializers
from .models import Wishlist
from products.serializers import ProductListSerializer


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer لقائمة الأماني"""
    product_detail = ProductListSerializer(source='product', read_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')
    added_at_display = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = [
            'id', 'user', 'user_email', 'product', 'product_detail',
            'added_at', 'added_at_display'
        ]
        read_only_fields = ['id', 'user', 'added_at']

    def get_added_at_display(self, obj):
        return obj.added_at.strftime("%Y-%m-%d %H:%M")