from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    path('chat/', views.chat, name='chat'),
    path('health/', views.health, name='health'),
    path('history/', views.session_history, name='history'),
]