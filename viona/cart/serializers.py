from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product, Color
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    product_detail = ProductListSerializer(source='product', read_only=True)
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.SerializerMethodField()
    color_name = serializers.ReadOnlyField(source='color.name')
    color_code = serializers.ReadOnlyField(source='color.code')
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_detail', 'product_name', 'product_price',
            'color', 'color_name', 'color_code',
            'quantity', 'total_price', 'added_at', 'updated_at'
        ]
        read_only_fields = ['id', 'added_at', 'updated_at']
    
    def get_product_price(self, obj):
        return float(obj.product.get_current_price())
    
    def get_total_price(self, obj):
        return float(obj.get_total_price())


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding item to cart"""
    product_id = serializers.IntegerField()
    color_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, max_value=99, default=1)
    
    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("المنتج غير موجود")
        
        if product.stock <= 0:
            raise serializers.ValidationError("المنتج غير متوفر في المخزون")
        
        return value
    
    def validate_color_id(self, value):
        if value:
            try:
                color = Color.objects.get(id=value)
            except Color.DoesNotExist:
                raise serializers.ValidationError("اللون غير موجود")
        return value
    
    def validate(self, data):
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        try:
            product = Product.objects.get(id=product_id)
            if quantity > product.stock:
                raise serializers.ValidationError(
                    f"الكمية المطلوبة ({quantity}) أكبر من المتاح ({product.stock})"
                )
        except Product.DoesNotExist:
            pass
        
        return data


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity"""
    quantity = serializers.IntegerField(min_value=0, max_value=99)
    
    def validate_quantity(self, value):
        if value == 0:
            return value
        return value


class CartSerializer(serializers.ModelSerializer):
    """Serializer for cart"""
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_price(self, obj):
        return float(obj.get_total_price())
    
    def get_total_items(self, obj):
        return obj.get_total_items()