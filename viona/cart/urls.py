from django.urls import path
from . import views

app_name = 'cart'

urlpatterns = [
    path('', views.get_cart, name='cart'),
    path('add/', views.add_to_cart, name='add-to-cart'),
    path('item/<int:item_id>/', views.update_cart_item, name='update-item'),
    path('remove/<int:item_id>/', views.remove_from_cart, name='remove-item'),
    path('clear/', views.clear_cart, name='clear-cart'),
    path('summary/', views.cart_summary, name='cart-summary'),
]