from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt

from .services.ai_parser import get_chat_response, get_or_create_session


@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    user_message = request.data.get('message', '').strip()
    
    if not user_message:
        return Response(
            {'error': 'الرسالة مطلوبة'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    session = get_or_create_session(request)
    response_text = get_chat_response(user_message, session)
    
    return Response({
        'reply': response_text,
        'user_message': user_message
    })

# ✅ الطريقة الصح — بعد تعريف الـ function مش فوقها
chat = csrf_exempt(chat)


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'status': 'ok', 'message': 'Chatbot is running'})


@api_view(['GET'])
@permission_classes([AllowAny])
def session_history(request):
    session = get_or_create_session(request)
    messages = session.messages.all()
    
    data = [{
        'is_user': msg.is_user,
        'message': msg.message,
        'created_at': msg.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for msg in messages]
    
    return Response(data)