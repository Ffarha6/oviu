from django.contrib import admin
from django.utils import timezone
from .models import Order, OrderItem


# ========== Actions لتغيير حالة الطلبات ==========
def mark_as_shipped(modeladmin, request, queryset):
    valid_orders = []
    invalid_orders = []
    
    for order in queryset:
        if order.status in ['pending', 'confirmed']:
            valid_orders.append(order.id)
        else:
            invalid_orders.append(f"#{order.id} ({order.get_status_display()})")
    
    if valid_orders:
        Order.objects.filter(id__in=valid_orders).update(
            status='shipped',
            shipped_date=timezone.now()
        )
        modeladmin.message_user(
            request, 
            f"✅ تم شحن {len(valid_orders)} طلب", 
            level='SUCCESS'
        )
    
    if invalid_orders:
        modeladmin.message_user(
            request, 
            f"❌ لا يمكن شحن هذه الطلبات: {', '.join(invalid_orders)}", 
            level='ERROR'
        )

mark_as_shipped.short_description = "شحن الطلبات المحددة"


def mark_as_delivered(modeladmin, request, queryset):
    valid_orders = [order.id for order in queryset if order.status == 'shipped']
    
    if valid_orders:
        Order.objects.filter(id__in=valid_orders).update(
            status='delivered',
            delivered_date=timezone.now()
        )
        modeladmin.message_user(request, f"✅ تم تسليم {len(valid_orders)} طلب", level='SUCCESS')
    else:
        modeladmin.message_user(request, "❌ لا يمكن تسليم طلبات لم يتم شحنها", level='ERROR')

mark_as_delivered.short_description = "تسليم الطلبات المحددة"


def mark_as_cancelled(modeladmin, request, queryset):
    valid_orders = [order.id for order in queryset if order.status in ['pending', 'confirmed']]
    
    if valid_orders:
        Order.objects.filter(id__in=valid_orders).update(status='cancelled')
        modeladmin.message_user(request, f"✅ تم إلغاء {len(valid_orders)} طلب", level='SUCCESS')
    else:
        modeladmin.message_user(request, "❌ لا يمكن إلغاء طلبات تم شحنها أو تسليمها", level='ERROR')

mark_as_cancelled.short_description = "إلغاء الطلبات المحددة"


# ========== عرض المنتجات داخل الأوردر ==========
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    fields = ['product_name_display', 'quantity', 'price_at_time', 'total_display']
    readonly_fields = ['price_at_time', 'product_name_display', 'total_display']
    extra = 0
    can_delete = False
    max_num = 0
    
    def product_name_display(self, obj):
        return f"{obj.product.name} - {obj.color.name}" if obj.color else obj.product.name
    product_name_display.short_description = "المنتج"
    
    def total_display(self, obj):
        return f"{obj.get_total()} ج.م"
    total_display.short_description = "الإجمالي"


# ========== صفحة الأوردر الرئيسية ==========
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    
    list_display = [
        'id', 'user_display', 'phone', 'status', 'status_colored', 
        'total_price_display', 'payment_method', 'created_at'
    ]
    list_editable = ['status']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['id', 'user__email', 'user__username', 'phone', 'address']
    readonly_fields = ['created_at', 'shipped_date', 'delivered_date']
    ordering = ['-created_at']
    list_per_page = 25
    list_select_related = ['user']
    actions = [mark_as_shipped, mark_as_delivered, mark_as_cancelled]
    
    # تنظيم عرض تفاصيل الأوردر
    fieldsets = (
        ('👤 بيانات العميل', {
            'fields': ('user', 'phone', 'address')
        }),
        ('📦 بيانات الطلب', {
            'fields': ('total_price', 'payment_method', 'status', 'notes')
        }),
        ('🚚 بيانات الشحن', {
            'fields': ('shipped_date', 'delivered_date', 'tracking_number'),
            'classes': ('collapse',)
        }),
        ('📅 تواريخ', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def user_display(self, obj):
        return obj.user.email or obj.user.username
    user_display.short_description = "المستخدم"
    
    def total_price_display(self, obj):
        return f"{obj.total_price} ج.م"
    total_price_display.short_description = "الإجمالي"
    
    def status_colored(self, obj):
        colors = {
            'pending': '🟡',
            'confirmed': '🔵',
            'paid': '🟢',
            'shipped': '📦',
            'delivered': '✅',
            'cancelled': '❌',
        }
        return f"{colors.get(obj.status, '⚪')} {obj.get_status_display()}"
    status_colored.short_description = "الحالة"
    status_colored.admin_order_field = 'status'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('items__product', 'items__color')
    
    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            old_status = Order.objects.get(id=obj.id).status
            self.message_user(
                request, 
                f"📝 تم تغيير حالة الطلب #{obj.id} من {old_status} إلى {obj.status}",
                level='INFO'
            )
        super().save_model(request, obj, form, change)


# ========== تسجيل OrderItem في الـ Admin ==========
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'color', 'quantity', 'price_at_time', 'get_total']
    list_filter = ['order__status']
    search_fields = ['order__id', 'product__name']
    readonly_fields = ['price_at_time']
    list_select_related = ['order', 'product', 'color']

    def get_total(self, obj):
        return f"{obj.get_total()} ج.م"
    get_total.short_description = "الإجمالي"