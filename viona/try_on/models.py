from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product  # ✅ نقل الاستيراد إلى الأعلى


def tryon_image_upload_path(instance, filename):
    """تحديد مسار رفع الصور ديناميكياً"""
    return f'tryon/session_{instance.session.id}/{filename}'


def tryon_result_upload_path(instance, filename):
    """تحديد مسار رفع نتائج التجربة"""
    return f'tryon/results/session_{instance.session.id}/{filename}'


class TryOnSession(models.Model):
    """جلسة تجربة النظارات الافتراضية"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='tryon_sessions'
    )
    session_key = models.CharField(max_length=40, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_key', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
        verbose_name = "Try-On Session"
        verbose_name_plural = "Try-On Sessions"
    
    def __str__(self):
        user_str = self.user.email if self.user else "Guest"
        return f"Session {self.session_key[:8]} - {user_str}"


class FaceMeasurement(models.Model):
    """قياسات وجه المستخدم"""
    # ✅ تم التعديل: OneToOne بدلاً من ForeignKey
    session = models.OneToOneField(
        TryOnSession, 
        on_delete=models.CASCADE, 
        related_name='measurement'
    )
    # ✅ تم التعديل: حذف حقل user لأنه موجود في session
    eye_distance = models.FloatField(
        validators=[MinValueValidator(30), MaxValueValidator(80)],
        help_text="Distance between eyes in mm (30-80mm)"
    )
    face_width = models.FloatField(
        validators=[MinValueValidator(100), MaxValueValidator(200)],
        help_text="Face width in mm (100-200mm)"
    )
    # ✅ تم التعديل: حذف الـ validators من الحقل الاختياري
    nose_bridge = models.FloatField(
        null=True, 
        blank=True,
        help_text="Nose bridge width in mm (5-30mm) - optional"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Face Measurement"
        verbose_name_plural = "Face Measurements"
    
    def __str__(self):
        return f"Measurement {self.id} - Eye Dist: {self.eye_distance}mm"


class TryOnImage(models.Model):
    """الصورة الأصلية التي رفعها المستخدم"""
    session = models.ForeignKey(
        TryOnSession, 
        on_delete=models.CASCADE, 
        related_name='images'
    )
    image = models.ImageField(
        upload_to=tryon_image_upload_path,
        help_text="Original user photo"
    )
    glasses_product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tryon_images'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Try-On Image"
        verbose_name_plural = "Try-On Images"
    
    def __str__(self):
        return f"Image {self.id} - Session {self.session.id}"


class TryOnResult(models.Model):
    """نتيجة تجربة النظارة على الصورة"""
    session = models.ForeignKey(
        TryOnSession, 
        on_delete=models.CASCADE, 
        related_name='results'
    )
    original_image = models.ForeignKey(
        TryOnImage, 
        on_delete=models.CASCADE, 
        related_name='results'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='tryon_results'
    )
    # ✅ تم التعديل: إضافة دالة مسار ديناميكية
    processed_image = models.ImageField(
    upload_to=tryon_result_upload_path,
    null=True,
    blank=True,
    help_text="Image with glasses applied"
)
    confidence_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="AI confidence score (0-1)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session', '-created_at']),
            models.Index(fields=['product', '-created_at']),
        ]
        verbose_name = "Try-On Result"
        verbose_name_plural = "Try-On Results"
    
    def __str__(self):
        return f"Result {self.id} - {self.product.name} - Score: {self.confidence_score}"