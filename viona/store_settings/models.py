from django.db import models


class SiteSettings(models.Model):
    # ========== معلومات المتجر ==========
    store_name = models.CharField(max_length=100, default="OVIU")
    store_tagline = models.CharField(max_length=200, blank=True)
    store_email = models.EmailField(blank=True)
    store_phone = models.CharField(max_length=30, blank=True)
    store_address = models.CharField(max_length=255, blank=True)
    store_description = models.CharField(max_length=500, blank=True)

    # ========== الهوية البصرية ==========
    primary_color = models.CharField(max_length=7, default="#0F0F0F")
    secondary_color = models.CharField(max_length=7, default="#C89072")
    background_color = models.CharField(max_length=7, default="#F7F2EE")

    # ========== تفضيلات المتجر (Feature Toggles) ==========
    enable_multilanguage = models.BooleanField(default=False)
    enable_low_stock_alerts = models.BooleanField(default=True)
    enable_dark_mode = models.BooleanField(default=False)
    enable_chatbot = models.BooleanField(default=True)
    enable_wishlist = models.BooleanField(default=True)
    enable_marketing_messages = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Site Settings"

    # ========== Singleton Pattern ==========
    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # ما نسمحش بحذف الصف ده خالص

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj