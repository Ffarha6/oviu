from django.urls import path
from . import admin_views

app_name = 'wishlist_admin'

urlpatterns = [
    path('stats/', admin_views.admin_wishlist_stats, name='admin-stats'),
    path('overview/', admin_views.admin_wishlist_overview, name='admin-overview'),
    path('top-categories/', admin_views.admin_wishlist_top_categories, name='admin-top-categories'),
    path('top-products/', admin_views.admin_wishlist_top_products, name='admin-top-products'),
    path('', admin_views.admin_wishlist_list, name='admin-wishlist-list'),
]