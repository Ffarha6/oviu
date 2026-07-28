from django.db import models
from django.conf import settings
from products.models import Product


class Wishlist(models.Model):
    """قائمة أماني المستخدم"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "قائمة أماني"
        verbose_name_plural = "قوائم الأماني"
        unique_together = ['user', 'product']  # منع تكرار نفس المنتج لنفس المستخدم
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"