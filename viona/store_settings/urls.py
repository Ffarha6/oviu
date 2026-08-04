from django.urls import path
from . import views

app_name = 'store_settings'

urlpatterns = [
    path('', views.public_site_settings, name='settings'),
]