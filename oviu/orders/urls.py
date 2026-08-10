from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # ========== إنشاء الطلبات ==========
    path('create/', views.create_order, name='create-order'),
    
    # ========== عرض الطلبات ==========
    path('my-orders/', views.my_orders, name='my-orders'),
    path('<int:order_id>/', views.order_detail, name='order-detail'),
    
    # ========== تحديث الطلبات ==========
    path('<int:order_id>/status/', views.update_order_status, name='update-status'),
    path('<int:order_id>/cancel/', views.cancel_order, name='cancel-order'),
    
    # ========== تتبع الطلب ==========
    path('track/<str:tracking_number>/', views.track_order, name='track-order'),
    
    # ========== إعادة الطلب ==========
    path('<int:order_id>/repeat/', views.repeat_order, name='repeat-order'),
    
    # ========== المشرفين (Admin) ==========
    path('admin/list/', views.admin_orders_list, name='admin-orders-list'),
    path('admin/stats/', views.admin_orders_stats, name='admin-orders-stats'),
    
    # ========== سلة التسوق ==========
    path('cart/', views.user_cart, name='user-cart'),
    
    # ========== الفواتير (معلق - أضف الدالة أولاً) ==========
    # path('<int:order_id>/invoice/', views.order_invoice, name='order-invoice'),
]