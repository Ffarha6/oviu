from django.db import models
from django.conf import settings


class GeneratedReport(models.Model):
    """
    كل مرة الأدمن يعمل "تصدير تقرير"، بنسجل هنا نسخة من الملف
    عشان يظهر في جدول "أحدث التقارير" ويكون قابل للتنزيل تاني في أي وقت.
    """

    REPORT_TYPES = [
        ('overview', 'نظرة عامة'),
        ('sales', 'المبيعات'),
        ('orders', 'الطلبات'),
        ('customers', 'العملاء'),
        ('products', 'المنتجات'),
    ]
    FORMAT_CHOICES = [
        ('xlsx', 'Excel'),
        ('pdf', 'PDF'),
    ]

    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    file_format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    file = models.FileField(upload_to='reports/%Y/%m/')

    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_reports',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Generated Report'
        verbose_name_plural = 'Generated Reports'

    def __str__(self):
        return self.name