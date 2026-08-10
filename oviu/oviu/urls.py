"""
URL configuration for viona project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic import RedirectView

urlpatterns = [
    # ========== Admin ==========
    path('admin/', admin.site.urls),
    path('admin-add-product/', RedirectView.as_view(url='/dashboard/products/product/add/')),

    # ========== APIs ==========
    path('api/auth/', include('accounts.urls')),
    path('api/dashboard/orders/', include('orders.admin_urls')),
    path('api/orders/', include('orders.urls')),
    path('api/dashboard/products/', include('products.admin_urls')),
    path('api/dashboard/orders/', include('orders.admin_urls')),
    path('api/dashboard/users/', include('accounts.admin_urls')),
    path('api/dashboard/admins/', include('accounts.admin_admins_urls')),
    path('api/dashboard/coupons/', include('coupons.admin_urls')),
    path('api/dashboard/reviews/', include('reviews.admin_urls')),
    path('api/dashboard/chatbot/', include('chatbot.admin_urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/payment/', include('payment.urls')),
    path('api/coupons/', include('coupons.urls')),
    #path('tryon/', include('try_on.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/dashboard/wishlist/', include('wishlist.admin_urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('accounts/', include('allauth.urls')),
    path('api/auth/', include('accounts.urls', namespace='accounts')),
    path('api/reports/', include('reports.urls')),
    path('api/dashboard/settings/', include('store_settings.admin_urls')),
    path('api/settings/', include('store_settings.urls')),


    

    # ========== SEO ==========
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),
]

# ========== Media & Static Files (Development Only) ==========
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
   