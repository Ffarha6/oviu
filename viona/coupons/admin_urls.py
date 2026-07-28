from django.urls import path
from . import admin_views

app_name = 'coupons_admin'

urlpatterns = [
    path('stats/', admin_views.admin_coupon_stats, name='admin-stats'),
    path('<int:coupon_id>/toggle-status/', admin_views.admin_toggle_coupon_status, name='admin-toggle-status'),
    path('<int:coupon_id>/', admin_views.admin_coupon_detail, name='admin-coupon-detail'),
    path('', admin_views.admin_coupons_list, name='admin-coupons-list'),
]