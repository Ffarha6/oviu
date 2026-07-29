from rest_framework import serializers
from .models import Product, Color, ProductImage


# =========================================================
# Product Images
# =========================================================

class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'alt_text', 'is_primary']

    def get_url(self, obj):
        request = self.context.get('request')

        if not obj.image:
            return None

        url = obj.image.url

        if request:
            return request.build_absolute_uri(url)

        return url


# =========================================================
# Colors
# =========================================================

class ColorSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    # field "code" في الـ Model يظهر في الـ API باسم hex_code
    hex_code = serializers.CharField(source='code', read_only=True)

    class Meta:
        model = Color
        fields = [
            'id',
            'name',
            'hex_code',
            'images',
            'primary_image',
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()

        if primary:
            return ProductImageSerializer(
                primary,
                context=self.context
            ).data

        return None


# =========================================================
# Product List
# =========================================================

class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer خفيف لقائمة المنتجات.

    بيرجع:
    - السعر الحالي
    - حالة الخصم
    - الصورة الأساسية
    - الألوان وصور كل لون
    """

    current_price = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    has_discount = serializers.BooleanField(read_only=True)
    colors = ColorSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'slug',
            'name',
            'product_type',
            'audience',
            'lens_type',
            'frame_shape',
            'price',
            'discount_price',
            'current_price',
            'has_discount',
            'stock',
            'average_rating',
            'reviews_count',
            'primary_image',
            'colors',
            'created_at',
        ]

    def get_current_price(self, obj):
        return float(obj.get_current_price())

    def get_primary_image(self, obj):
        request = self.context.get('request')

        # الأول نحاول نجيب الصورة المحددة كـ primary
        for color in obj.colors.all():
            primary = color.images.filter(is_primary=True).first()

            if primary and primary.image:
                url = primary.image.url

                if request:
                    return request.build_absolute_uri(url)

                return url

        # لو مفيش primary ناخد أول صورة موجودة
        for color in obj.colors.all():
            first = color.images.first()

            if first and first.image:
                url = first.image.url

                if request:
                    return request.build_absolute_uri(url)

                return url

        # المنتج مفيهوش صور
        return None


# =========================================================
# Product Details
# =========================================================

class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer كامل لصفحة تفاصيل المنتج.
    """

    colors = ColorSerializer(many=True, read_only=True)
    current_price = serializers.SerializerMethodField()
    has_discount = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_current_price(self, obj):
        return float(obj.get_current_price())


# =========================================================
# Admin - Product List
# =========================================================

class ProductAdminListSerializer(serializers.ModelSerializer):
    """
    Serializer خفيف لجدول المنتجات في Admin Panel.
    """

    current_price = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    colors_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'sku',
            'name',
            'product_type',
            'audience',
            'price',
            'discount_price',
            'current_price',
            'discount_percent',
            'stock',
            'stock_status',
            'is_active',
            'primary_image',
            'colors_count',
            'created_at',
        ]

    def get_current_price(self, obj):
        return float(obj.get_current_price())

    def get_discount_percent(self, obj):
        if obj.discount_price and obj.price:
            price = float(obj.price)
            discount_price = float(obj.discount_price)

            if price > 0:
                return round(
                    (1 - discount_price / price) * 100
                )

        return None

    def get_stock_status(self, obj):
        if obj.stock <= 0:
            return 'out'

        if obj.stock <= 10:
            return 'low'

        return 'in'

    def get_primary_image(self, obj):
        request = self.context.get('request')

        # الصورة الأساسية
        for color in obj.colors.all():
            primary = color.images.filter(is_primary=True).first()

            if primary and primary.image:
                url = primary.image.url

                if request:
                    return request.build_absolute_uri(url)

                return url

        # fallback لأول صورة موجودة
        for color in obj.colors.all():
            first = color.images.first()

            if first and first.image:
                url = first.image.url

                if request:
                    return request.build_absolute_uri(url)

                return url

        return None

    def get_colors_count(self, obj):
        return obj.colors.count()


# =========================================================
# Admin - Product Details
# =========================================================

class ProductAdminDetailSerializer(serializers.ModelSerializer):
    """
    Serializer كامل لصفحة تعديل المنتج في Admin Panel.
    """

    colors = ColorSerializer(many=True, read_only=True)
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_current_price(self, obj):
        return float(obj.get_current_price())


# =========================================================
# Create / Update Product
# =========================================================

class ProductWriteSerializer(serializers.ModelSerializer):
    """
    إنشاء أو تعديل بيانات المنتج الأساسية
    بدون الألوان والصور.
    """

    class Meta:
        model = Product
        fields = [
            'name',
            'product_type',
            'audience',
            'is_active',
            'lens_type',
            'frame_shape',
            'price',
            'discount_price',
            'stock',
            'description',
            'lens_width',
            'bridge_width',
            'temple_length',
            'meta_title',
            'meta_description',
            'sku',
        ]


# =========================================================
# Create / Update Color
# =========================================================

class ColorWriteSerializer(serializers.ModelSerializer):
    """
    إضافة أو تعديل لون للمنتج.
    """

    class Meta:
        model = Color
        fields = [
            'id',
            'product',
            'name',
            'code',
        ]


# =========================================================
# Product Image Upload
# =========================================================

class ProductImageUploadSerializer(serializers.ModelSerializer):
    """
    رفع صورة وربطها بلون معين.
    """

    class Meta:
        model = ProductImage
        fields = [
            'id',
            'color',
            'image',
            'alt_text',
            'is_primary',
        ]