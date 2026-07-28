from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # ثابتة (لا تحتوي على متغيرات)
    path('featured/', views.featured_products, name='featured'),
    path('new-arrivals/', views.new_arrivals, name='new-arrivals'),
    path('search/', views.search_products, name='search'),
    path('categories/', views.get_categories, name='categories'),
    path('categories/<str:category>/', views.get_products_by_category, name='products-by-category'),
    path('related/<slug:slug>/', views.related_products, name='related'),
    path('autocomplete/', views.autocomplete, name='autocomplete'),
    path('best-sellers/', views.best_sellers, name='best_sellers'),
    
    # متغيرة (تأتي في النهاية)
    path('by-id/<int:product_id>/', views.product_detail_by_id, name='product-detail-by-id'),
    path('<slug:slug>/', views.product_detail, name='product-detail'),
    path('', views.get_products, name='products-list'),
]