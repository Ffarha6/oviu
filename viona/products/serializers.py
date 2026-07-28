from rest_framework import serializers
from .models import Product, Color, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'alt_text', 'is_primary']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class ColorSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    # ✅ hex_code بيجي من الـ field "code" في الـ model
    hex_code = serializers.CharField(source='code', read_only=True)

    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code', 'images', 'primary_image']

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return ProductImageSerializer(primary, context=self.context).data
        return None


class ProductListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer للـ list page
    ✅ بيبعت: primary_image (absolute URL) + colors (مع hex_code وصورهم)
    """
    current_price   = serializers.SerializerMethodField()
    primary_image   = serializers.SerializerMethodField()
    has_discount    = serializers.BooleanField(read_only=True)
    # ✅ أضفنا colors عشان تظهر الألوان والصور في الكارت
    colors          = ColorSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name',
            'product_type', 'audience', 'lens_type', 'frame_shape',
            'price', 'discount_price', 'current_price', 'has_discount',
            'stock',
            'average_rating', 'reviews_count',
            'primary_image',
            'colors',
            'created_at',
        ]

    def get_current_price(self, obj):
        return float(obj.get_current_price())

    def get_primary_image(self, obj):
        """
        ✅ بيرجع absolute URL مباشرة
        بيدور على أول صورة primary في أي كولور
        """
        request = self.context.get('request')
        for color in obj.colors.all():
            primary = color.images.filter(is_primary=True).first()
            if primary and primary.image:
                url = primary.image.url
                return request.build_absolute_uri(url) if request else f"http://127.0.0.1:8000{url}"
        # لو مفيش primary، خد أول صورة موجودة
        for color in obj.colors.all():
            first = color.images.first()
            if first and first.image:
                url = first.image.url
                return request.build_absolute_uri(url) if request else f"http://127.0.0.1:8000{url}"
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer لصفحة تفاصيل المنتج"""
    colors        = ColorSerializer(many=True, read_only=True)
    current_price = serializers.SerializerMethodField()
    has_discount  = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_current_price(self, obj):
        return float(obj.get_current_price())
    
    
    
    
    # ══════════════════════════════════════════════════════════════════════════
# ✅ إضافات جديدة للأدمن بانل — ضيفي الكود ده في آخر ملف products/serializers.py
# (تحت الكلاسات الموجودة، من غير ما تمسحي حاجة قديمة)
# ══════════════════════════════════════════════════════════════════════════


class ProductAdminListSerializer(serializers.ModelSerializer):
    """سيريالايزر خفيف لجدول المنتجات في الأدمن بانل"""
    current_price = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    colors_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'product_type', 'audience',
            'price', 'discount_price', 'current_price', 'discount_percent',
            'stock', 'stock_status', 'is_active', 'primary_image',
            'colors_count', 'created_at',
        ]

    def get_current_price(self, obj):
        return float(obj.get_current_price())

    def get_discount_percent(self, obj):
        if obj.discount_price and obj.price:
            return round((1 - float(obj.discount_price) / float(obj.price)) * 100)
        return None

    def get_stock_status(self, obj):
        if obj.stock <= 0:
            return 'out'
        if obj.stock <= 10:
            return 'low'
        return 'in'

    def get_primary_image(self, obj):
        request = self.context.get('request')
        for color in obj.colors.all():
            primary = color.images.filter(is_primary=True).first()
            if primary and primary.image:
                url = primary.image.url
                return request.build_absolute_uri(url) if request else url
        return None

    def get_colors_count(self, obj):
        return obj.colors.count()


class ProductAdminDetailSerializer(serializers.ModelSerializer):
    """سيريالايزر كامل لصفحة تعديل المنتج (بيرجع الألوان والصور كمان)"""
    colors = ColorSerializer(many=True, read_only=True)
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_current_price(self, obj):
        return float(obj.get_current_price())


class ProductWriteSerializer(serializers.ModelSerializer):
    """يُستخدم لإنشاء/تعديل بيانات المنتج الأساسية (من غير الألوان والصور)"""
    class Meta:
        model = Product
        fields = [
            'name', 'product_type', 'audience', 'is_active',
            'lens_type', 'frame_shape', 'price', 'discount_price',
            'stock', 'description', 'lens_width', 'bridge_width',
            'temple_length', 'meta_title', 'meta_description', 'sku',
        ]


class ColorWriteSerializer(serializers.ModelSerializer):
    """يُستخدم لإضافة لون جديد لمنتج"""
    class Meta:
        model = Color
        fields = ['id', 'product', 'name', 'code']


class ProductImageUploadSerializer(serializers.ModelSerializer):
    """يُستخدم لرفع صورة للون معين"""
    class Meta:
        model = ProductImage
        fields = ['id', 'color', 'image', 'alt_text', 'is_primary']