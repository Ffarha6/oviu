from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.urls import reverse
from django.db import transaction
from django.db.models import Avg, Count, Q, Sum, F
import re


def product_image_upload_path(instance, filename):
    """
    تحديد مسار رفع الصور ديناميكياً.

    ✅ بنستخدم الـ ID بتاع المنتج واللون بدل الاسم/الـ slug الكامل بالعربي.
    السبب: بعض أسماء المنتجات طويلة جدًا (زي "نظارة شمس رجالية Ray-Ban بتصميم
    مربع عصري إطار أسود..."), ولما بنبني المسار من الـ slug الكامل + اسم اللون
    عربي، طول المسار الناتج كان بيتخطى الحد الأقصى المسموح به لحقل اسم الملف
    في Django (max_length الافتراضي = 100 حرف)، فكان بيطلع:
    SuspiciousFileOperation: Storage can not find an available filename...

    استخدام الأرقام (IDs) هنا:
    - بيضمن إن المسار قصير وثابت الطول دايمًا، مهما كان اسم المنتج أو اللون طويل.
    - بيتجنب مشاكل ترميز الأحرف العربية/الخاصة في مسارات الملفات على بعض أنظمة التخزين.
    - أسرع في المقارنة/الفهرسة من نصوص طويلة.
    """
    return f'products/{instance.color.product_id}/{instance.color_id}/{filename}'


class Product(models.Model):
    PRODUCT_TYPES = [
    ('medical', 'Medical Glasses'),
    ('sunglasses', 'Sunglasses'),
    ('reading', 'Reading Glasses'),
    ('lenses', 'Lenses'),
]

    AUDIENCE_CHOICES = [
    ('men', 'Men'),
    ('women', 'Women'),
    ('unisex', 'Unisex'),
    ('kids', 'Kids'),
]
    
    LENS_TYPES = [
    ('glass', 'Glass'),
    ('plastic', 'Plastic'),
    ('blue_cut', 'Blue Cut'),
    ('contact', 'Contact Lens'),
]
    
    
    FRAME_SHAPES = [
    ('round', 'Round'),
    ('square', 'Square'),
    ('rectangle', 'Rectangle'),
    ('aviator', 'Aviator'),
    ('cat_eye', 'Cat Eye'),
]
    # ========== الحقول الأساسية ==========
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    product_type = models.CharField(
    max_length=50,
    choices=PRODUCT_TYPES
)

    audience = models.CharField(
    max_length=50,
    choices=AUDIENCE_CHOICES
)
    is_active = models.BooleanField(default=True)


    lens_type = models.CharField(
    max_length=50,
    choices=LENS_TYPES,
    blank=True,
    null=True
)
    
    frame_shape = models.CharField(
    max_length=50,
    choices=FRAME_SHAPES,
    blank=True,
    null=True
)
    # ========== السعر ==========
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)]
    )
    has_discount = models.BooleanField(default=False, editable=False)

    # ========== المخزون ==========
    stock = models.PositiveIntegerField(default=0)

    # ========== الوصف ==========
    description = models.TextField()

    # ========== المقاسات ==========
    lens_width = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    bridge_width = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    temple_length = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])

    # ========== SEO ==========
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    # ========== إحصائيات ==========
    views_count = models.PositiveIntegerField(default=0, editable=False)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, editable=False)
    reviews_count = models.PositiveIntegerField(default=0, editable=False)

    # ========== التواريخ ==========
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Product"
        verbose_name_plural = "Products"
        indexes = [
    models.Index(fields=['slug']),
    models.Index(fields=['product_type', 'audience']),
    models.Index(fields=['is_active', 'has_discount']),
]
    def __str__(self):
        return self.name

    # ========== الدوال ==========
    @property
    def total_sales_count(self):
        """عدد مرات بيع المنتج"""
        from orders.models import OrderItem
        return OrderItem.objects.filter(
            product=self,
            order__status='delivered'
        ).aggregate(total=Sum('quantity'))['total'] or 0

    @classmethod
    def search_advanced(cls, request):
        """بحث متقدم مع فلترة وترتيب"""
        queryset = cls.objects.filter(is_active=True)
        
        # 1. البحث النصي
        search = request.GET.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(meta_title__icontains=search)
            )
        
        # 2. فلترة حسب النوع
        product_type = request.GET.get('type')
        if product_type:
            queryset = queryset.filter(type=product_type)
        
        # 3. فلترة حسب الفئة
        category = request.GET.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # 4. فلترة حسب السعر
        min_price = request.GET.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        max_price = request.GET.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # 5. فلترة حسب وجود خصم
        has_discount = request.GET.get('has_discount')
        if has_discount and has_discount.lower() == 'true':
            queryset = queryset.filter(discount_price__isnull=False)
        
        # 6. فلترة حسب المخزون
        in_stock = request.GET.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        # 7. فلترة حسب اللون
        color = request.GET.get('color')
        if color:
            queryset = queryset.filter(colors__name__icontains=color)
        
        # 8. فلترة حسب المقاس
        lens_width = request.GET.get('lens_width')
        if lens_width:
            queryset = queryset.filter(lens_width__gte=int(lens_width))
        
        # 9. الترتيب (Sorting)
        ordering = request.GET.get('ordering', '-created_at')
        allowed_orderings = {
            'price': 'price',
            '-price': '-price',
            'created_at': 'created_at',
            '-created_at': '-created_at',
            'name': 'name',
            '-name': '-name',
            'best_selling': '-total_sales_count',
            'top_rated': '-average_rating',
        }
        
        if ordering in allowed_orderings:
            queryset = queryset.order_by(allowed_orderings[ordering])
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset

    def clean(self):
        if self.discount_price and self.discount_price >= self.price:
            raise ValidationError({
                'discount_price': 'Discount price must be less than original price'
            })

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_slug()
        if not self.sku:
            self.sku = self._generate_sku()
        self.has_discount = bool(self.discount_price)
        self.full_clean(exclude=['slug'])
        super().save(*args, **kwargs)

    def _generate_slug(self):
        import random, string
        # allow_unicode=True عشان الأسماء العربية متتحولش لفراغ
        base = slugify(self.name, allow_unicode=True)
        if not base:
            base = 'product'
        candidate = base
        while Product.objects.filter(slug=candidate).exists():
            suffix = ''.join(random.choices(string.digits, k=4))
            candidate = f"{base}-{suffix}"
        return candidate

    def _generate_sku(self):
        import random, string
        prefix = {
            'sunglasses': 'SUN', 'medical': 'MED',
            'reading': 'REA', 'lenses': 'LEN',
        }.get(self.product_type, 'PRD')
        while True:
            candidate = f"OV-{prefix}-{''.join(random.choices(string.digits, k=4))}"
            if not Product.objects.filter(sku=candidate).exists():
                return candidate

    def get_current_price(self):
        """حساب السعر الحالي بعد الخصم"""
        if self.discount_price is not None and self.discount_price > 0:
            return self.discount_price
        return self.price

    def get_absolute_url(self):
        return reverse('product_detail', args=[self.slug])

    def increment_views(self):
        """زيادة عدد المشاهدات بدون تشغيل الـ save() كامل"""
        Product.objects.filter(pk=self.pk).update(views_count=F('views_count') + 1)

    def update_rating(self):
        """تحديث متوسط التقييم"""
        reviews = self.reviews.filter(is_approved=True)
        if reviews.exists():
            avg = reviews.aggregate(Avg('rating'))['rating__avg']
            Product.objects.filter(pk=self.pk).update(
                average_rating=avg,
                reviews_count=reviews.count()
            )
        else:
            Product.objects.filter(pk=self.pk).update(average_rating=0, reviews_count=0)


class Color(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10)

    class Meta:
        unique_together = ['product', 'name']
        ordering = ['name']
        verbose_name = "Color"
        verbose_name_plural = "Colors"

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    def clean(self):
        if self.code and not re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', self.code):
            raise ValidationError({'code': 'Color code must be a valid hex code (e.g., #000000 or #FFF)'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first()


class ProductImage(models.Model):
    color = models.ForeignKey(Color, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(
        upload_to=product_image_upload_path,
        # ✅ زودنا الحد الأقصى لطول اسم الملف المخزن في قاعدة البيانات من الافتراضي
        # (100 حرف) لـ 255 كإجراء احترازي إضافي، حتى مع مسار الـ IDs القصير الجديد.
        max_length=255,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])]
    )
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', 'id']
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"

    def __str__(self):
        return f"Image for {self.color.product.name} - {self.color.name}"

    def save(self, *args, **kwargs):
        """عند حفظ الصورة، تأكد من وجود صورة رئيسية واحدة فقط"""
        if self.is_primary:
            with transaction.atomic():
                ProductImage.objects.filter(
                    color=self.color,
                    is_primary=True
                ).select_for_update().exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)