from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    """جلسة محادثة (لكل مستخدم أو زائر)"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='chat_sessions'
    )
    session_key = models.CharField(max_length=40, db_index=True)
    is_closed = models.BooleanField(default=False, help_text="هل تم إغلاق المحادثة من الأدمن")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "جلسة محادثة"
        verbose_name_plural = "جلسات المحادثة"
        ordering = ['-updated_at']

    def __str__(self):
        user_name = self.user.email if self.user else "زائر"
        return f"{user_name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class ChatMessage(models.Model):
    """رسالة داخل جلسة المحادثة"""
    session = models.ForeignKey(
        ChatSession, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    is_user = models.BooleanField(default=True)  # True: رسالة المستخدم، False: رد البوت
    is_admin_reply = models.BooleanField(default=False, help_text="True لو الرد ده كتبه أدمن حقيقي مش البوت")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "رسالة"
        verbose_name_plural = "الرسائل"
        ordering = ['created_at']

    def __str__(self):
        sender = "المستخدم" if self.is_user else "البوت"
        return f"{sender}: {self.message[:50]}"


class FAQ(models.Model):
    """سؤال وجواب يديره الأدمن، ويستخدمه البوت في الرد التلقائي"""
    question = models.CharField(max_length=300)
    answer = models.TextField()
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "سؤال شائع"
        verbose_name_plural = "الأسئلة الشائعة"
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.question


class CannedResponse(models.Model):
    """رد جاهز يقدر الأدمن يستخدمه بضغطة واحدة أثناء الرد على العملاء"""
    title = models.CharField(max_length=100, help_text="اسم مختصر للرد عشان يظهر في القائمة")
    text = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "رد جاهز"
        verbose_name_plural = "الردود الجاهزة"
        ordering = ['-created_at']

    def __str__(self):
        return self.title