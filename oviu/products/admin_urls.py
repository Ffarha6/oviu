from django.urls import path
from . import admin_views

app_name = 'products_admin'

urlpatterns = [
    # ثابتة أولاً
    path('stats/', admin_views.admin_product_stats, name='admin-stats'),

    # ألوان وصور (لازم تيجي قبل <int:product_id>/ عشان الـ /colors/ ماتتلخبطش)
    path(
    'colors/<int:color_id>/update/',
    admin_views.admin_update_color,
    name='admin-update-color'
),
    path('colors/<int:color_id>/', admin_views.admin_delete_color, name='admin-delete-color'),
    path('colors/<int:color_id>/images/', admin_views.admin_upload_image, name='admin-upload-image'),
    path('images/<int:image_id>/', admin_views.admin_image_detail, name='admin-image-detail'),

    # عمليات على منتج معين
    path('<int:product_id>/toggle-status/', admin_views.admin_toggle_product_status, name='admin-toggle-status'),
    path('<int:product_id>/colors/', admin_views.admin_add_color, name='admin-add-color'),
    path('<int:product_id>/', admin_views.admin_product_detail, name='admin-product-detail'),

    # القائمة + الإنشاء
    path('', admin_views.admin_products_list, name='admin-products-list'),
]