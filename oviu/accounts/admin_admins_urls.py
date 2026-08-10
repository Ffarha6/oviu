from django.urls import path
from . import admin_views

app_name = 'accounts_admin_admins'

urlpatterns = [
    path('permission-modules/', admin_views.admin_permission_modules, name='permission-modules'),
    path('stats/', admin_views.admin_admins_stats, name='admin-admins-stats'),
    path('<int:user_id>/permissions/', admin_views.admin_update_admin_permissions, name='admin-update-permissions'),
    path('<int:user_id>/promote/', admin_views.admin_promote_user, name='admin-promote'),
    path('<int:user_id>/demote/', admin_views.admin_demote_admin, name='admin-demote'),
    path('<int:user_id>/', admin_views.admin_admin_detail, name='admin-admin-detail'),
    path('', admin_views.admin_admins_list, name='admin-admins-list'),
]