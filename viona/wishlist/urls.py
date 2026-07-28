from django.urls import path
from . import views

app_name = 'wishlist'

urlpatterns = [
    path('', views.my_wishlist, name='my-wishlist'),
    path('add/', views.add_to_wishlist, name='add-to-wishlist'),
    path('remove/<int:product_id>/', views.remove_from_wishlist, name='remove-from-wishlist'),
    path('check/<int:product_id>/', views.is_in_wishlist, name='is-in-wishlist'),
]