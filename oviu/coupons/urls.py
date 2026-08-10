from django.urls import path
from . import views

app_name = 'coupons'

urlpatterns = [
    # تطبيق الكوبون
    path('apply/', views.apply_coupon, name='apply-coupon'),
    path('remove/', views.remove_coupon, name='remove-coupon'),
    path('current/', views.get_applied_coupon, name='current-coupon'),
    
    # كوبونات المستخدم
    path('my-coupons/', views.my_coupons, name='my-coupons'),
    path('my-usage/', views.my_coupon_usage, name='my-usage'),
    
    # إدارة المشرفين
    path('admin/list/', views.admin_coupons, name='admin-coupons'),
    path('admin/create/', views.create_coupon, name='create-coupon'),
    path('admin/update/<int:coupon_id>/', views.update_coupon, name='update-coupon'),
    path('admin/delete/<int:coupon_id>/', views.delete_coupon, name='delete-coupon'),
    path('admin/stats/<int:coupon_id>/', views.coupon_stats, name='coupon-stats'),
]