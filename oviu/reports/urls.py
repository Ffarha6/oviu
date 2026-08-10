from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('overview/', views.overview_stats, name='overview-stats'),
    path('revenue-overview/', views.revenue_overview, name='revenue-overview'),
    path('sales-by-channel/', views.sales_by_channel, name='sales-by-channel'),
    path('sales-by-category/', views.sales_by_category, name='sales-by-category'),
    path('orders-by-status/', views.orders_by_status, name='orders-by-status'),
    path('top-selling-products/', views.top_selling_products, name='top-selling-products'),
    path('revenue-summary/', views.revenue_summary, name='revenue-summary'),
    path('history/', views.reports_history, name='history'),
    path('export/', views.export_report, name='export'),
]