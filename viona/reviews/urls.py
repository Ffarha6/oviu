from django.urls import path
from . import views

app_name = 'reviews'

urlpatterns = [
    # عامة
    path('product/<int:product_id>/', views.product_reviews, name='product-reviews'),

    # للمستخدم العادي
    path('my-reviews/', views.my_reviews, name='my-reviews'),
    path('add/', views.add_review, name='add-review'),
    path('update/<int:review_id>/', views.update_review, name='update-review'),
    path('delete/<int:review_id>/', views.delete_review, name='delete-review'),

    # للمشرفين فقط
    path('admin/list/', views.admin_reviews, name='admin-reviews'),
    path('admin/approve/<int:review_id>/', views.approve_review, name='approve-review'),
    path('admin/delete/<int:review_id>/', views.admin_delete_review, name='admin-delete-review'),
]