import nested_admin
from django.contrib import admin
from django.db import models
from django.utils.html import format_html
from .models import Product, Color, ProductImage
from orders.models import OrderItem



class ProductImageInline(nested_admin.NestedTabularInline):
    model = ProductImage
    fields = ['image_preview', 'image', 'alt_text', 'is_primary']
    readonly_fields = ['image_preview']
    extra = 1
    fk_name = 'color'

    def image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" width="60" height="60" style="border-radius: 8px; object-fit: cover;" />',
                obj.image.url
            )
        return "📷"
    image_preview.short_description = "معاينة"


class ColorInline(nested_admin.NestedTabularInline):
    model = Color
    fields = ['name', 'code', 'color_preview']
    readonly_fields = ['color_preview']
    extra = 1
    inlines = [ProductImageInline]

    def color_preview(self, obj):
        if obj and obj.code:
            return format_html(
                '<div style="width: 30px; height: 30px; background: {}; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px #ddd;"></div>',
                obj.code
            )
        return "🎨"
    color_preview.short_description = "اللون"


@admin.register(Product)
class ProductAdmin(nested_admin.NestedModelAdmin):
    inlines = [ColorInline]

    list_display = [
        'id', 
        'name', 
        'product_type',
'audience',
'lens_type',
'frame_shape', 
'get_current_price',
        'stock', 
        'has_discount', 
        'total_sales', 
        'is_active'
    ]
    list_editable = [
    'product_type',
    'audience',
    'stock',
    'is_active'
]   
    list_filter = [
    'product_type',
    'audience',
    'lens_type',
    'frame_shape',
    'is_active',
    'has_discount'
]   
    search_fields = ['name', 'description']
    ordering = ['-id']
    list_per_page = 25

    fieldsets = (
    ('معلومات أساسية', {
        'fields': (
            'name',
            'slug',
            'product_type',
            'audience',
            'description',
            'is_active'
        )
    }),

    ('معلومات العدسات والإطار', {
        'fields': (
            'lens_type',
            'frame_shape',
        ),
        'classes': ('collapse',)
    }),

    ('السعر والمخزون', {
        'fields': (
            'price',
            'discount_price',
            'stock'
        )
    }),

    ('مقاسات النظارة', {
        'fields': (
            'lens_width',
            'bridge_width',
            'temple_length'
        ),
        'classes': ('collapse',)
    }),

    ('SEO', {
        'fields': (
            'meta_title',
            'meta_description'
        ),
        'classes': ('collapse',)
    }),
)
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    actions = ['activate_products', 'deactivate_products', 'increase_stock']

    def get_current_price(self, obj):
            price = obj.get_current_price()
            return f"{price} ج.م"
    get_current_price.short_description = "السعر الحالي"
    get_current_price.admin_order_field = 'price'

    def has_discount(self, obj):
        return "✅" if obj.has_discount else "❌"
    has_discount.short_description = "خصم"
    has_discount.boolean = True

    def total_sales(self, obj):
        total = OrderItem.objects.filter(
            product=obj,
            order__status='delivered'
            ).aggregate(total_quantity=models.Sum('quantity'))['total_quantity'] or 0
        return total if total > 0 else "-"
    total_sales.short_description = "عدد المبيعات"

        
    def activate_products(self, request, queryset):
        queryset.update(is_active=True)
    activate_products.short_description = "تفعيل المنتجات المحددة"

    def deactivate_products(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_products.short_description = "إلغاء تفعيل المنتجات المحددة"

    def increase_stock(self, request, queryset):
        from django.db.models import F
        queryset.update(stock=F('stock') + 10)
    increase_stock.short_description = "زيادة المخزون بـ 10 وحدات"

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('colors')

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if change:
            self.message_user(request, f"تم تحديث المنتج {obj.name} بنجاح")


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):

    list_display = [
        'id',
        'product',
        'name',
        'code',
        'color_preview',
        'images_count'
    ]

    list_filter = ['product']

    search_fields = [
        'name',
        'product__name'
    ]

    list_select_related = ['product']

    def color_preview(self, obj):
        if obj and obj.code:
            return format_html(
                '<div style="width: 25px; height: 25px; background: {}; border-radius: 50%; border: 1px solid #ccc;"></div>',
                obj.code
            )
        return "🎨"

    color_preview.short_description = "معاينة"

    def images_count(self, obj):
        return obj.images.count()

    images_count.short_description = "عدد الصور"
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'color', 'image_preview', 'is_primary', 'alt_text']
    list_editable = ['is_primary']
    list_filter = ['color__product', 'is_primary']
    search_fields = ['color__product__name', 'alt_text', 'color__name']
    list_select_related = ['color__product']

    def image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" width="40" height="40" style="border-radius: 4px; object-fit: cover;" />',
                obj.image.url
            )
        return "📷"
    image_preview.short_description = "معاينة"