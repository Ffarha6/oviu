from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    fields = ['product', 'color', 'quantity', 'get_total_price']
    readonly_fields = ['get_total_price']
    extra = 0
    
    def get_total_price(self, obj):
        return f"{obj.get_total_price()} ج.م"
    get_total_price.short_description = "الإجمالي"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_display', 'total_items', 'total_price', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__email', 'user__username', 'session_key']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CartItemInline]
    ordering = ['-updated_at']
    
    def user_display(self, obj):
        return obj.user.email if obj.user else f"Session: {obj.session_key[:8]}"
    user_display.short_description = "المستخدم"
    
    def total_items(self, obj):
        return obj.get_total_items()
    total_items.short_description = "عدد المنتجات"
    
    def total_price(self, obj):
        return f"{obj.get_total_price()} ج.م"
    total_price.short_description = "الإجمالي"


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart_display', 'product', 'color', 'quantity', 'get_total_price']
    list_filter = ['cart__user', 'product']
    search_fields = ['product__name', 'cart__user__email']
    
    def cart_display(self, obj):
        if obj.cart.user:
            return obj.cart.user.email
        return obj.cart.session_key
    cart_display.short_description = "السلة"
    
    def get_total_price(self, obj):
        return f"{obj.get_total_price()} ج.م"
    get_total_price.short_description = "الإجمالي"