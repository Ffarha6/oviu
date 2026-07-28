from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'is_user', 'is_admin_reply', 'message', 'created_at']


class ChatSessionAdminListSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    is_guest = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_answered = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = [
            'id', 'customer_name', 'customer_email', 'is_guest',
            'last_message', 'last_message_time', 'unread_count',
            'is_closed', 'is_answered', 'created_at',
        ]

    def get_customer_name(self, obj):
        if obj.user:
            full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return full_name or obj.user.username
        return "زائر"

    def get_customer_email(self, obj):
        return obj.user.email if obj.user else None

    def get_is_guest(self, obj):
        return obj.user is None

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        return last.message if last else ""

    def get_last_message_time(self, obj):
        last = obj.messages.order_by('-created_at').first()
        return last.created_at if last else obj.created_at

    def get_unread_count(self, obj):
        # عدد رسائل العميل بعد آخر رد (بوت أو أدمن)
        last_reply = obj.messages.filter(is_user=False).order_by('-created_at').first()
        qs = obj.messages.filter(is_user=True)
        if last_reply:
            qs = qs.filter(created_at__gt=last_reply.created_at)
        return qs.count()

    def get_is_answered(self, obj):
        return obj.messages.filter(is_user=False).exists()






from .models import FAQ, CannedResponse


class FAQAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'is_active', 'order', 'created_at', 'updated_at']


class CannedResponseAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = CannedResponse
        fields = ['id', 'title', 'text', 'is_active', 'created_at', 'updated_at']