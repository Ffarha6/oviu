from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product


class Review(models.Model):
    """تقييم ومراجعة المنتج"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="التقييم من 1 إلى 5"
    )
    title = models.CharField(max_length=200, blank=True, help_text="عنوان المراجعة")
    comment = models.TextField(help_text="نص المراجعة")
    is_approved = models.BooleanField(default=False, help_text="موافقة المشرف على النشر")
    
    is_rejected = models.BooleanField(default=False, help_text="رفض المشرف للتقييم")
    admin_reply = models.TextField(blank=True, help_text="رد الأدمن على التقييم")
    
    # صور للمراجعة (اختياري)
    image1 = models.ImageField(upload_to='reviews/', blank=True, null=True)
    image2 = models.ImageField(upload_to='reviews/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "تقييم"
        verbose_name_plural = "التقييمات"
        ordering = ['-created_at']
        unique_together = ['user', 'product']  # مستخدم واحد يمكنه تقييم منتج مرة واحدة

    def __str__(self):
        return f"{self.user.email} - {self.product.name} - {self.rating}⭐"

    def get_rating_display(self):
        """عرض التقييم بنجوم"""
        stars = '★' * self.rating + '☆' * (5 - self.rating)
        return stars