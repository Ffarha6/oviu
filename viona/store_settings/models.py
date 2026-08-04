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

    # ========== تفضيلات المتجر ==========
    enable_multilanguage = models.BooleanField(default=True)
    enable_dark_mode = models.BooleanField(default=True)

    # Chatbot
    enable_chatbot = models.BooleanField(default=True)
    show_chatbot_button = models.BooleanField(default=True)

    # AI Try-On
    enable_virtual_tryon = models.BooleanField(default=False)
    show_virtual_tryon_in_home = models.BooleanField(default=False)
    show_virtual_tryon_in_navbar = models.BooleanField(default=False)

    # Store Features
    enable_wishlist = models.BooleanField(default=True)
    enable_reviews = models.BooleanField(default=True)
    enable_offers = models.BooleanField(default=True)
    enable_coupons = models.BooleanField(default=True)

    # Homepage
    show_home_banner = models.BooleanField(default=True)
    show_categories = models.BooleanField(default=True)
    show_featured_products = models.BooleanField(default=True)
    show_brands = models.BooleanField(default=True)
    show_newsletter = models.BooleanField(default=True)

    # Store Control
    allow_registration = models.BooleanField(default=True)
    allow_orders = models.BooleanField(default=True)

    # Notifications
    enable_low_stock_alerts = models.BooleanField(default=True)
    enable_marketing_messages = models.BooleanField(default=False)

    # Maintenance
    maintenance_mode = models.BooleanField(default=False)

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
        pass  # لا نسمح بحذف الإعدادات

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj