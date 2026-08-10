from django.contrib import admin
from django.utils.html import format_html
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'discount_display', 'validity_display', 
        'used_count', 'is_active', 'status_badge'
    ]
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_to']
    search_fields = ['code', 'name', 'description']
    list_editable = ['is_active']
    readonly_fields = ['used_count', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('معلومات الكوبون', {
            'fields': ('code', 'name', 'description', 'discount_type', 'discount_value', 'max_discount_amount')
        }),
        ('شروط الاستخدام', {
            'fields': ('min_order_amount', 'usage_limit', 'usage_limit_per_user', 'is_first_order_only')
        }),
        ('الصلاحية', {
            'fields': ('valid_from', 'valid_to', 'is_active')
        }),
        ('المنتجات والفئات', {
            'fields': ('products',),
            'classes': ('collapse',)
        }),
        ('إحصائيات', {
            'fields': ('used_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def discount_display(self, obj):
        if obj.discount_type == 'percentage':
            return f"{obj.discount_value}%"
        return f"{obj.discount_value} ج.م"
    discount_display.short_description = "الخصم"
    
    def validity_display(self, obj):
        return f"{obj.valid_from.strftime('%Y-%m-%d')} → {obj.valid_to.strftime('%Y-%m-%d')}"
    validity_display.short_description = "مدة الصلاحية"
    
    def status_badge(self, obj):
        if obj.is_valid:
            return format_html('<span style="color: green;">✓ صالح</span>')
        return format_html('<span style="color: red;">✗ منتهي</span>')
    status_badge.short_description = "الحالة"
    
    actions = ['activate_coupons', 'deactivate_coupons']
    
    def activate_coupons(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"✅ تم تفعيل {queryset.count()} كوبون")
    activate_coupons.short_description = "تفعيل الكوبونات المحددة"
    
    def deactivate_coupons(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"❌ تم إلغاء تفعيل {queryset.count()} كوبون")
    deactivate_coupons.short_description = "إلغاء تفعيل الكوبونات المحددة"


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['id', 'coupon', 'user', 'order', 'discount_amount', 'used_at']
    list_filter = ['used_at']
    search_fields = ['coupon__code', 'user__email', 'order__id']
    readonly_fields = ['used_at']
    ordering = ['-used_at']