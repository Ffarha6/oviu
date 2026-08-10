from django.contrib import admin
from django.utils.html import format_html
from .models import Payment, PaymentMethod, TransactionLog


class TransactionLogInline(admin.TabularInline):
    model = TransactionLog
    fields = ['action', 'status', 'response_data', 'created_at']
    readonly_fields = ['created_at']
    extra = 0
    can_delete = False
    max_num = 0


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'user_display', 'amount_display', 'payment_method', 'status_colored', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order__id', 'user__email', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at', 'paid_at', 'refunded_at']
    inlines = [TransactionLogInline]
    ordering = ['-created_at']
    
    def user_display(self, obj):
        return obj.user.email
    user_display.short_description = "المستخدم"
    
    def amount_display(self, obj):
        return f"{obj.amount} ج.م"
    amount_display.short_description = "المبلغ"
    
    def status_colored(self, obj):
        colors = {
            'pending': '🟡',
            'processing': '🟠',
            'completed': '🟢',
            'failed': '🔴',
            'refunded': '🔵',
            'cancelled': '⚪',
        }
        return f"{colors.get(obj.status, '⚪')} {obj.get_status_display()}"
    status_colored.short_description = "الحالة"
    
    fieldsets = (
        ('معلومات الطلب', {
            'fields': ('order', 'user', 'amount', 'payment_method')
        }),
        ('حالة الدفع', {
            'fields': ('status', 'transaction_id', 'payment_intent_id')
        }),
        ('بيانات البطاقة', {
            'fields': ('card_last4', 'card_brand'),
            'classes': ('collapse',)
        }),
        ('التحويل البنكي', {
            'fields': ('bank_receipt', 'bank_receipt_verified'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'paid_at', 'refunded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_refunded']
    
    def mark_as_completed(self, request, queryset):
        for payment in queryset:
            if payment.status != 'completed':
                payment.mark_as_completed()
        self.message_user(request, f"✅ تم تأكيد {queryset.count()} دفعة")
    mark_as_completed.short_description = "تأكيد الدفعات المحددة"
    
    def mark_as_refunded(self, request, queryset):
        for payment in queryset:
            if payment.status == 'completed':
                payment.mark_as_refunded()
        self.message_user(request, f"✅ تم استرداد {queryset.count()} دفعة")
    mark_as_refunded.short_description = "استرداد الدفعات المحددة"


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_display', 'icon_preview', 'is_active', 'sort_order']
    list_editable = ['is_active', 'sort_order']
    list_filter = ['is_active']
    
    def name_display(self, obj):
        return obj.get_name_display()
    name_display.short_description = "الاسم"
    
    def icon_preview(self, obj):
        if obj.icon:
            return format_html('<i class="{}"></i>', obj.icon)
        return "-"
    icon_preview.short_description = "الأيقونة"


@admin.register(TransactionLog)
class TransactionLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'payment', 'action', 'status', 'created_at']
    list_filter = ['action', 'status', 'created_at']
    search_fields = ['payment__order__id', 'payment__user__email']
    readonly_fields = ['response_data', 'created_at']
    ordering = ['-created_at']