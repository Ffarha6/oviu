from django.contrib import admin
from .models import TryOnSession, TryOnImage  # افترضت اسماء الموديلات

# ========== Inline لعرض الصور داخل الجلسة ==========
class TryOnImageInline(admin.TabularInline):
    model = TryOnImage
    fields = ['image_preview', 'image', 'glasses_product', 'created_at']
    readonly_fields = ['image_preview', 'created_at']
    extra = 0
    can_delete = True
    
    def image_preview(self, obj):
        if obj and obj.image:
            from django.utils.html import format_html
            return format_html('<img src="{}" width="80" height="80" style="border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "📷"
    image_preview.short_description = "معاينة"


# ========== تسجيل TryOnSession ==========
@admin.register(TryOnSession)
class TryOnSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_display', 'session_key', 'created_at', 'images_count']
    list_filter = ['created_at']
    search_fields = ['user__email', 'user__username', 'session_key']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    inlines = [TryOnImageInline]
    
    def user_display(self, obj):
        return obj.user.email if obj.user else "زائر"
    user_display.short_description = "المستخدم"
    
    def images_count(self, obj):
        return obj.images.count()
    images_count.short_description = "عدد الصور"
    
    fieldsets = (
        ('معلومات الجلسة', {
            'fields': ('user', 'session_key')
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ========== تسجيل TryOnImage ==========
@admin.register(TryOnImage)
class TryOnImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'image_preview', 'glasses_product', 'created_at']
    list_filter = ['created_at', 'glasses_product']
    search_fields = ['session__user__email', 'glasses_product__name']
    readonly_fields = ['image_preview', 'created_at']
    
    def image_preview(self, obj):
        if obj and obj.image:
            from django.utils.html import format_html
            return format_html('<img src="{}" width="100" height="100" style="border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "📷"
    image_preview.short_description = "معاينة"
    
    fieldsets = (
        ('بيانات التجربة', {
            'fields': ('session', 'glasses_product', 'image')
        }),
        ('معاينة', {
            'fields': ('image_preview',),
            'classes': ('collapse',)
        }),
    )