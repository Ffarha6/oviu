from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.conf import settings
from products.models import Product, Color
from django.utils import timezone


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('cash', 'Cash on Delivery'),
        ('card', 'Credit Card'),
        ('wallet', 'Wallet'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')

    order_number = models.CharField(max_length=20, unique=True, blank=True, null=True)

    phone = models.CharField(max_length=15)
    address = models.TextField()
    notes = models.TextField(blank=True)

    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_intent_id = models.CharField(max_length=100, blank=True)

    shipped_date = models.DateTimeField(null=True, blank=True)
    delivered_date = models.DateTimeField(null=True, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"Order #{self.order_number or self.id} - {self.user.email} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.order_number:
            self.order_number = f"OV-{self.id:06d}"
            Order.objects.filter(pk=self.pk).update(order_number=self.order_number)

    def calculate_total(self):
        total = sum(item.get_total() for item in self.items.all())
        self.total_price = total
        Order.objects.filter(pk=self.pk).update(total_price=total)
        return total

    def can_be_cancelled(self):
        return self.status in ['pending', 'confirmed']

    def can_be_shipped(self):
        return self.status in ['pending', 'confirmed', 'preparing']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    color = models.ForeignKey(Color, on_delete=models.PROTECT, null=True, blank=True, related_name='order_items')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
        indexes = [
            models.Index(fields=['order', 'product']),
        ]

    def __str__(self):
        color_str = f" - {self.color.name}" if self.color else ""
        return f"{self.quantity}x {self.product.name}{color_str} (Order #{self.order.id})"

    def get_total(self):
        return self.quantity * self.price_at_time

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
