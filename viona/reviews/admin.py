from django.contrib import admin
from django.utils.html import format_html
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_display', 'product', 'rating_stars',
        'title_preview', 'is_approved', 'created_at'
    ]
    list_filter = ['rating', 'is_approved', 'created_at']
    search_fields = ['user__email', 'product__name', 'comment']
    list_editable = ['is_approved']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def user_display(self, obj):
        return obj.user.email
    user_display.short_description = "المستخدم"

    def rating_stars(self, obj):
        return obj.get_rating_display()
    rating_stars.short_description = "التقييم"

    def title_preview(self, obj):
        return obj.title[:50] if obj.title else "-"
    title_preview.short_description = "العنوان"

    fieldsets = (
        ('بيانات التقييم', {
            'fields': ('user', 'product', 'rating', 'title', 'comment')
        }),
        ('الصور', {
            'fields': ('image1', 'image2'),
            'classes': ('collapse',)
        }),
        ('الحالة', {
            'fields': ('is_approved',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['approve_reviews', 'unapprove_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"✅ تم اعتماد {queryset.count()} تقييم")
    approve_reviews.short_description = "اعتماد التقييمات المحددة"

    def unapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f"❌ تم إلغاء اعتماد {queryset.count()} تقييم")
    unapprove_reviews.short_description = "إلغاء اعتماد التقييمات المحددة"