from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from orders.models import Order
import uuid


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'نسبة مئوية'),
        ('fixed', 'قيمة ثابتة'),
    ]
    
    #基本信息
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200, blank=True, help_text="وصف الكوبون (ظاهر للعميل)")
    description = models.TextField(blank=True)
    
    #نوع الخصم
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    #الحد الأقصى للخصم (للكوبونات百分比)
    max_discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="الحد الأقصى للخصم (للكوبونات百分比 فقط)"
    )
    
    #الحد الأدنى للطلب
    min_order_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="الحد الأدنى لقيمة الطلب لاستخدام الكوبون"
    )
    
    #الصلاحية
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    
    #الاستخدام
    usage_limit = models.PositiveIntegerField(default=1, help_text="عدد مرات استخدام الكوبون (لكل مستخدم أو إجمالي)")
    usage_limit_per_user = models.PositiveIntegerField(default=1, help_text="عدد مرات استخدام الكوبون لكل مستخدم")
    used_count = models.PositiveIntegerField(default=0, editable=False)
    
    #المنتجات المسموح بها (فارغ = جميع المنتجات)
    products = models.ManyToManyField(
        'products.Product', 
        blank=True, 
        related_name='coupon_products',  # ✅ تم التعديل
        help_text="المنتجات التي يشملها الكوبون (فارغ = جميع المنتجات)"
    )
    
    #الفئات المسموح بها
    categories = models.ManyToManyField(
        'products.Product', 
        blank=True, 
        related_name='coupon_categories',  # ✅ تم التعديل
        help_text="فئات المنتجات", 
        limit_choices_to={'category__isnull': False}
    )
    
    #المحافظات المسموح بها (فارغة = كل المحافظات)
    governorates = models.JSONField(
        default=list,
        blank=True,
        help_text="قائمة المحافظات المسموح بها لاستخدام الكوبون (فارغة = كل المحافظات)"
    )
    
    
    #حالة الكوبون
    is_active = models.BooleanField(default=True)
    is_first_order_only = models.BooleanField(default=False, help_text="هل الكوبون مخصص لأول طلب فقط؟")
    
    #التواريخ
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'is_active']),
            models.Index(fields=['valid_from', 'valid_to']),
        ]
        verbose_name = "Coupon"
        verbose_name_plural = "Coupons"
    
    def __str__(self):
        return f"{self.code} - {self.get_discount_type_display()} {self.discount_value}"
    
    @property
    def is_valid(self):
        """التحقق من صلاحية الكوبون"""
        now = timezone.now()
        if not self.is_active:
            return False
        if self.valid_from > now:
            return False
        if self.valid_to < now:
            return False
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False
        return True
    
    def calculate_discount(self, total_amount):
        """حساب قيمة الخصم"""
        if not self.is_valid:
            return 0
        
        if self.discount_type == 'percentage':
            discount = total_amount * (self.discount_value / 100)
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
        else:  # fixed
            discount = min(self.discount_value, total_amount)
        
        return discount
    
    def can_use_by_user(self, user):
        """التحقق مما إذا كان المستخدم يمكنه استخدام الكوبون"""
        if not self.is_valid:
            return False, "الكوبون غير صالح"
        
        if self.is_first_order_only:
            if Order.objects.filter(user=user, is_paid=True).exists():
                return False, "هذا الكوبون مخصص لأول طلب فقط"
        
        # التحقق من عدد استخدامات المستخدم
        from .models import CouponUsage
        user_usage_count = CouponUsage.objects.filter(
            coupon=self, 
            user=user,
            order__is_paid=True
        ).count()
        
        if user_usage_count >= self.usage_limit_per_user:
            return False, f"لقد استخدمت هذا الكوبون {self.usage_limit_per_user} مرة كحد أقصى"
        
        return True, "يمكن استخدام الكوبون"
    
    def mark_as_used(self, order):
        """تسجيل استخدام الكوبون"""
        from .models import CouponUsage
        CouponUsage.objects.create(
            coupon=self,
            user=order.user,
            order=order,
            discount_amount=order.discount_amount
        )
        self.used_count += 1
        self.save()


class CouponUsage(models.Model):
    """تسجيل استخدام الكوبونات"""
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_usages')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='coupon_usage')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-used_at']
        unique_together = ['coupon', 'order']
        verbose_name = "Coupon Usage"
        verbose_name_plural = "Coupon Usages"
    
    def __str__(self):
        return f"{self.coupon.code} - Order #{self.order.id}"