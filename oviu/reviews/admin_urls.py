from django.urls import path
from . import admin_views

app_name = 'reviews_admin'

urlpatterns = [
    path('stats/', admin_views.admin_review_stats, name='admin-stats'),
    path('<int:review_id>/approve/', admin_views.admin_approve_review, name='admin-approve'),
    path('<int:review_id>/reject/', admin_views.admin_reject_review, name='admin-reject'),
    path('<int:review_id>/reset-status/', admin_views.admin_reset_review_status, name='admin-reset-status'),
    path('<int:review_id>/reply/', admin_views.admin_reply_review, name='admin-reply'),
    path('<int:review_id>/', admin_views.admin_review_detail, name='admin-review-detail'),
    path('', admin_views.admin_reviews_list, name='admin-reviews-list'),
]