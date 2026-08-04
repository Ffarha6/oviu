from django.urls import path
from . import admin_views

app_name = 'store_settings_admin'

urlpatterns = [
    path('', admin_views.admin_site_settings, name='admin-settings'),
]