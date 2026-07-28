from django.urls import path
from . import admin_views

app_name = 'chatbot_admin'

urlpatterns = [
    path('stats/', admin_views.admin_chat_stats, name='admin-stats'),
    path('faqs/<int:faq_id>/', admin_views.admin_faq_detail, name='admin-faq-detail'),
    path('faqs/', admin_views.admin_faqs_list, name='admin-faqs-list'),
    path('canned-responses/<int:response_id>/', admin_views.admin_canned_response_detail, name='admin-canned-detail'),
    path('canned-responses/', admin_views.admin_canned_responses_list, name='admin-canned-list'),
    path('<int:session_id>/messages/', admin_views.admin_conversation_messages, name='admin-messages'),
    path('<int:session_id>/reply/', admin_views.admin_send_reply, name='admin-reply'),
    path('<int:session_id>/toggle-status/', admin_views.admin_toggle_conversation_status, name='admin-toggle-status'),
    path('', admin_views.admin_conversations_list, name='admin-conversations-list'),
]