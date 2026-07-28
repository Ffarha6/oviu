from django.urls import path
from . import views

app_name = 'payment'

urlpatterns = [
    # طرق الدفع
    path('methods/', views.get_payment_methods, name='payment-methods'),
    
    # عمليات الدفع
    path('initiate/', views.initiate_payment, name='initiate-payment'),
    path('verify/', views.verify_payment, name='verify-payment'),
    path('bank-transfer/', views.bank_transfer_upload, name='bank-transfer'),
    
    # مدفوعات المستخدم
    path('my-payments/', views.my_payments, name='my-payments'),
    path('<int:payment_id>/', views.payment_detail, name='payment-detail'),
    
    # إدارة المشرفين
    path('admin/list/', views.admin_payments, name='admin-payments'),
    path('admin/verify-bank/<int:payment_id>/', views.verify_bank_transfer, name='verify-bank'),
    path('admin/refund/<int:payment_id>/', views.refund_payment, name='refund-payment'),
]