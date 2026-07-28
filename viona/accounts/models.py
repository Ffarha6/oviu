from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):

    """
    Custom User Model for Viona Eyewear Store
    """

    # ✅ خيارات الجنس - اتضافت جديد
    GENDER_CHOICES = [
        ('male', 'ذكر'),
        ('female', 'أنثى'),
    ]

    # Reset password fields
    reset_token = models.CharField(max_length=100, blank=True, null=True)
    reset_token_created_at = models.DateTimeField(blank=True, null=True)

    # Basic Info
    phone = models.CharField(_('phone number'), max_length=15, blank=True, null=True)
    address = models.TextField(_('address'), blank=True, null=True)
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)

    # ✅ حقلين جداد: الجنس والمحافظة - دول اللي كانوا ناقصين
    gender = models.CharField(_('gender'), max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    governorate = models.CharField(_('governorate'), max_length=50, blank=True, null=True)
    
    ADMIN_ROLE_CHOICES = [
        ('admin', 'أدمن'),
        ('manager', 'مدير'),
        ('editor', 'محرر'),
        ('support', 'دعم فني'),
    ]
    admin_role = models.CharField(_('admin role'), max_length=20, choices=ADMIN_ROLE_CHOICES, blank=True, null=True)
    admin_permissions = models.JSONField(_('admin permissions'), default=list, blank=True)

    # Verification
    email_verified = models.BooleanField(_('email verified'), default=False)
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    verification_code_created_at = models.DateTimeField(blank=True, null=True)

    # Eyewear specific
    prescription_details = models.JSONField(
        _('prescription details'),
        default=dict,
        blank=True,
        help_text='{"right_eye": {"sphere": -2.0, "cylinder": -0.5, "axis": 180}, "left_eye": {...}}'
    )

    # Shopping preferences
    shipping_addresses = models.JSONField(
        _('shipping addresses'),
        default=list,
        blank=True,
        help_text='List of saved addresses'
    )

    # Timestamps
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-date_joined']
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email or self.username

    def get_full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    def has_complete_profile(self):
        return bool(self.phone and self.address)

    def is_prescription_available(self):
        return bool(self.prescription_details and
                   (self.prescription_details.get('right_eye') or
                    self.prescription_details.get('left_eye')))


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
    
    
    
    
    
    # ════════════════════════════════════════════════════════════════════════
# ✅ جديد: موديل عناوين حقيقي (بدل الاعتماد على حقول address/phone/governorate
# الموجودة على User مباشرة). ده اللي بيسمح بأكتر من عنوان محفوظ لكل مستخدم.
#
# ضيفي الكلاس ده في آخر accounts/models.py (تحت كلاس Profile اللي عندك بالفعل)
# ════════════════════════════════════════════════════════════════════════

class Address(models.Model):
    """عنوان شحن محفوظ - المستخدم ممكن يكون عنده أكتر من واحد"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    governorate = models.CharField(max_length=50)
    address = models.TextField()
    # ✅ العنوان الافتراضي اللي بيتعرض أول واحد ويتختار تلقائيًا في الشيك اوت
    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', '-created_at']
        verbose_name = 'Address'
        verbose_name_plural = 'Addresses'

    def __str__(self):
        return f"{self.full_name} - {self.governorate} ({'افتراضي' if self.is_default else 'عادي'})"