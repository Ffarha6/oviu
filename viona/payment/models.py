from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from orders.models import Order


class PaymentMethod(models.Model):
    """طرق الدفع المتاحة"""
    METHOD_CHOICES = [
        ('cash', 'Cash on Delivery'),
        ('card', 'Credit Card'),
        ('wallet', 'Digital Wallet'),
        ('bank', 'Bank Transfer'),
    ]
    
    name = models.CharField(max_length=50, choices=METHOD_CHOICES, unique=True)
    is_active = models.BooleanField(default=True)
    icon = models.CharField(max_length=50, blank=True, help_text="FontAwesome icon class")
    description = models.TextField(blank=True)
    sort_order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = "Payment Method"
        verbose_name_plural = "Payment Methods"
    
    def __str__(self):
        return self.get_name_display()


class Payment(models.Model):
    """سجل الدفع لكل طلب"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    # العلاقات
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    
    # معلومات الدفع
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PaymentMethod.METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # معلومات المعاملة
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    payment_intent_id = models.CharField(max_length=100, blank=True)
    
    # للدفع بالبطاقة (Stripe/ PayMob)
    card_last4 = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=20, blank=True)
    
    # للتحويل البنكي
    bank_receipt = models.ImageField(upload_to='payments/receipts/', blank=True, null=True)
    bank_receipt_verified = models.BooleanField(default=False)
    
    # التواريخ
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['payment_intent_id']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
    
    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order.id} - {self.status}"
    
    def mark_as_completed(self, transaction_id=None):
        """تحديد الدفع كمكتمل"""
        self.status = 'completed'
        if transaction_id:
            self.transaction_id = transaction_id
        from django.utils.timezone import now
        self.paid_at = now()
        self.save()
        
        # تحديث حالة الطلب إلى confirmed
        self.order.status = 'confirmed'
        self.order.is_paid = True
        self.order.paid_at = now()
        self.order.save()
    
    def mark_as_failed(self):
        """تحديد الدفع كفاشل"""
        self.status = 'failed'
        self.save()
    
    def mark_as_refunded(self):
        """تحديد الدفع كمسترد"""
        self.status = 'refunded'
        from django.utils.timezone import now
        self.refunded_at = now()
        self.save()


class TransactionLog(models.Model):
    """سجل جميع معاملات الدفع (للتتبع والتحليل)"""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    response_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Transaction Log"
        verbose_name_plural = "Transaction Logs"
    
    def __str__(self):
        return f"Log {self.id} - {self.action} - {self.status}"