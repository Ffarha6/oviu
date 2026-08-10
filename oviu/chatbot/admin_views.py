from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import ChatSession, ChatMessage
from .admin_serializers import ChatSessionAdminListSerializer, ChatMessageAdminSerializer


class AdminChatPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ─── إحصائيات الشات بوت (حقيقية بالكامل) ─────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_chat_stats(request):
    sessions = ChatSession.objects.all()
    total = sessions.count()
    answered = 0
    unanswered = 0
    response_times = []

    for s in sessions:
        first_user_msg = s.messages.filter(is_user=True).order_by('created_at').first()
        first_reply = s.messages.filter(is_user=False).order_by('created_at').first()
        if first_reply:
            answered += 1
            if first_user_msg and first_reply.created_at > first_user_msg.created_at:
                response_times.append((first_reply.created_at - first_user_msg.created_at).total_seconds())
        else:
            unanswered += 1

    avg_response_seconds = round(sum(response_times) / len(response_times)) if response_times else 0
    resolution_rate = round((answered / total * 100), 1) if total else 0

    return Response({
        'total_conversations': total,
        'answered': answered,
        'unanswered': unanswered,
        'resolution_rate': resolution_rate,
        'avg_response_seconds': avg_response_seconds,
    })


# ─── قائمة المحادثات (بحث + تبويبات: الكل / مفتوحة / بدون رد) ────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_conversations_list(request):
    sessions = ChatSession.objects.all().select_related('user').prefetch_related('messages')

    search = request.GET.get('search')
    if search:
        sessions = sessions.filter(
            Q(user__username__icontains=search) |
            Q(user__email__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(messages__message__icontains=search)
        ).distinct()

    tab = request.GET.get('tab', 'all')
    sessions = list(sessions)
    if tab == 'open':
        sessions = [s for s in sessions if not s.is_closed]
    elif tab == 'unanswered':
        sessions = [s for s in sessions if not s.messages.filter(is_user=False).exists()]

    sessions.sort(key=lambda s: (s.messages.order_by('-created_at').first().created_at if s.messages.exists() else s.created_at), reverse=True)

    paginator = AdminChatPagination()
    page = paginator.paginate_queryset(sessions, request)
    serializer = ChatSessionAdminListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ─── رسائل محادثة معينة ───────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_conversation_messages(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id)
    messages = session.messages.all().order_by('created_at')
    return Response({
        'session': ChatSessionAdminListSerializer(session).data,
        'messages': ChatMessageAdminSerializer(messages, many=True).data,
    })


# ─── إرسال رد من الأدمن ────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_send_reply(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id)
    text = request.data.get('message', '').strip()
    if not text:
        return Response({'error': 'نص الرد مطلوب'}, status=400)

    message = ChatMessage.objects.create(
        session=session,
        is_user=False,
        is_admin_reply=True,
        message=text,
    )
    session.save()  # تحديث updated_at

    return Response(ChatMessageAdminSerializer(message).data, status=201)


# ─── إغلاق / إعادة فتح المحادثة ────────────────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_conversation_status(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id)
    session.is_closed = not session.is_closed
    session.save(update_fields=['is_closed'])
    return Response({'id': session.id, 'is_closed': session.is_closed})






from .models import FAQ, CannedResponse
from .admin_serializers import FAQAdminSerializer, CannedResponseAdminSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_faqs_list(request):
    if request.method == 'POST':
        serializer = FAQAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        faq = serializer.save()
        return Response(FAQAdminSerializer(faq).data, status=201)

    faqs = FAQ.objects.all()
    return Response(FAQAdminSerializer(faqs, many=True).data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_faq_detail(request, faq_id):
    faq = get_object_or_404(FAQ, id=faq_id)

    if request.method == 'GET':
        return Response(FAQAdminSerializer(faq).data)

    if request.method == 'PATCH':
        serializer = FAQAdminSerializer(faq, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(FAQAdminSerializer(faq).data)

    if request.method == 'DELETE':
        faq.delete()
        return Response(status=204)


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_canned_responses_list(request):
    if request.method == 'POST':
        serializer = CannedResponseAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = serializer.save()
        return Response(CannedResponseAdminSerializer(response).data, status=201)

    responses = CannedResponse.objects.filter(is_active=True)
    return Response(CannedResponseAdminSerializer(responses, many=True).data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_canned_response_detail(request, response_id):
    response = get_object_or_404(CannedResponse, id=response_id)

    if request.method == 'GET':
        return Response(CannedResponseAdminSerializer(response).data)

    if request.method == 'PATCH':
        serializer = CannedResponseAdminSerializer(response, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CannedResponseAdminSerializer(response).data)

    if request.method == 'DELETE':
        response.delete()
        return Response(status=204)