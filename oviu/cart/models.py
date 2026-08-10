from django.db import models
from django.conf import settings
from products.models import Product, Color


class Cart(models.Model):
    """سلة التسوق للمستخدم"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
        null=True,
        blank=True
    )
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cart"
        verbose_name_plural = "Carts"
        indexes = [
            models.Index(fields=['session_key']),
            models.Index(fields=['user', '-updated_at']),
        ]
    
    def __str__(self):
        if self.user:
            return f"Cart - {self.user.email}"
        return f"Cart - Session {self.session_key[:8]}"
    
    def get_total_price(self):
        """حساب إجمالي سعر السلة"""
        total = sum(item.get_total_price() for item in self.items.all())
        return total
    
    def get_total_items(self):
        """حساب عدد المنتجات في السلة"""
        return sum(item.quantity for item in self.items.all())
    
    def clear(self):
        """تفريغ السلة"""
        self.items.all().delete()


class CartItem(models.Model):
    """منتج داخل سلة التسوق"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        unique_together = ['cart', 'product', 'color']
        indexes = [
            models.Index(fields=['cart', 'product']),
        ]
    
    def __str__(self):
        color_str = f" - {self.color.name}" if self.color else ""
        return f"{self.quantity}x {self.product.name}{color_str}"
    
    def get_total_price(self):
        """حساب سعر المنتج × الكمية"""
        price = self.product.get_current_price()
        return price * self.quantity
    
    def get_price_at_time(self):
        """سعر المنتج الحالي (لحفظه عند إنشاء الطلب)"""
        return float(self.product.get_current_price())