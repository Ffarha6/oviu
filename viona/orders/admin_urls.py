from django.urls import path
from . import admin_views

app_name = 'orders_admin'

urlpatterns = [
    path('stats/', admin_views.admin_order_stats, name='admin-stats'),
    path('export/', admin_views.admin_orders_export, name='admin-export'),
    path('<int:order_id>/', admin_views.admin_order_detail, name='admin-order-detail'),
    path('', admin_views.admin_orders_list, name='admin-orders-list'),
]