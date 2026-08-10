from django.urls import path
from . import admin_views

app_name = 'accounts_admin'

urlpatterns = [
    path('stats/', admin_views.admin_user_stats, name='admin-stats'),
    path('<int:user_id>/toggle-status/', admin_views.admin_toggle_user_status, name='admin-toggle-status'),
    path('<int:user_id>/toggle-staff/', admin_views.admin_toggle_staff, name='admin-toggle-staff'),
    path('<int:user_id>/', admin_views.admin_user_detail, name='admin-user-detail'),
    path('', admin_views.admin_users_list, name='admin-users-list'),
]