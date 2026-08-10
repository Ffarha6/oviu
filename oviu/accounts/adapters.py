from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied

User = get_user_model()


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """تسجيل الدخول بجوجل وفيسبوك - مباشر بدون تحقق"""

    def pre_social_login(self, request, sociallogin):
        """لو المستخدم موجود بالفعل، نسجل دخوله مباشرة"""
        user = sociallogin.user
        if user.email:
            try:
                existing_user = User.objects.get(email=user.email)
                # لو المستخدم موجود، نأكده تلقائياً
                existing_user.email_verified = True   # ← كان is_email_verified (خطأ)
                existing_user.save()
                sociallogin.connect(request, existing_user)
            except User.DoesNotExist:
                pass

    def save_user(self, request, sociallogin, form=None):
        """حفظ مستخدم جوجل/فيسبوك الجديد - مفعل مباشرة"""
        user = super().save_user(request, sociallogin, form)

        extra_data = sociallogin.account.extra_data

        # Google
        if sociallogin.account.provider == 'google':
            if not user.first_name:
                user.first_name = extra_data.get('given_name', '')
            if not user.last_name:
                user.last_name = extra_data.get('family_name', '')

        # Facebook
        elif sociallogin.account.provider == 'facebook':
            if not user.first_name:
                user.first_name = extra_data.get('first_name', '')
            if not user.last_name:
                user.last_name = extra_data.get('last_name', '')

        # مستخدم OAuth موثوق منه، نفعله مباشرة
        user.email_verified = True   # ← كان is_email_verified (خطأ)
        user.is_active = True
        user.save()

        return user


class CustomAccountAdapter(DefaultAccountAdapter):
    """منع دخول المستخدمين غير الموثقين"""

    def is_open_for_signup(self, request):
        return True

    def login(self, request, user):
        """منع الدخول لو المستخدم موثقش إيميله"""

        # لو دخول بجوجل أو فيسبوك، السماح مباشرة
        if user.socialaccount_set.exists():
            return super().login(request, user)

        # لو مستخدم عادي، لازم يكون موثق الإيميل
        if not user.email_verified:
            raise PermissionDenied(
                "يرجى تأكيد حسابك عبر الرابط المرسل إلى بريدك الإلكتروني"
            )

        return super().login(request, user)