from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from django.core.validators import RegexValidator
from django.shortcuts import redirect
from .models import User, PendingRegistration
import secrets
import requests
from django.utils.timezone import now
from datetime import timedelta
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from .models import Address
from .serializers import AddressSerializer

# Validators
phone_regex = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="رقم الهاتف يجب أن يكون بصيغة دولية مثل +20123456789"
)

# ✅ القيم المسموحة لحقل الجنس - نفس القيم اللي الفرونت بيبعتها (male / female)
VALID_GENDERS = ['male', 'female']


@api_view(['POST'])
@throttle_classes([AnonRateThrottle])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    phone = request.data.get('phone') or request.data.get('phone_number')
    password = request.data.get('password')

    if not all([username, email, password]):
        return Response({'error': 'جميع الحقول مطلوبة'}, status=400)

    username = username.strip()
    email = email.strip().lower()
    phone = phone.strip() if phone else None

    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'هذا البريد الإلكتروني مسجل بالفعل'}, status=400)

    try:
        validate_password(password)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

    if phone:
        try:
            phone_regex(phone)
        except Exception:
            return Response({'error': 'رقم الهاتف غير صحيح'}, status=400)

    first_name = request.data.get('first_name') or request.data.get('firstName', '')
    last_name = request.data.get('last_name') or request.data.get('lastName', '')

    base_username = username
    unique_username = base_username
    counter = 1
    while (User.objects.filter(username=unique_username).exists()
           or PendingRegistration.objects.exclude(email__iexact=email).filter(username=unique_username).exists()):
        unique_username = f"{base_username}_{counter}"
        counter += 1

    verification_code = secrets.token_hex(3).upper()
    pending, _ = PendingRegistration.objects.update_or_create(
        email=email,
        defaults={
            'username': unique_username,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'password_hash': make_password(password),
            'verification_code': verification_code,
            'verification_code_created_at': now(),
        }
    )

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}", "Content-Type": "application/json"},
            json={
                "from": "OVIU <noreply@oviustore.com>",
                "to": [email],
                "subject": "تفعيل حسابك في OVIU",
                "html": f'''<div dir="rtl"><h2>مرحباً {first_name or username}</h2>
                <p>كود تفعيل حسابك في OVIU هو:</p><h1>{verification_code}</h1>
                <p>الكود صالح لمدة ساعة واحدة.</p><p>شكراً لانضمامك إلى OVIU</p></div>''',
            },
            timeout=10,
        )
        response.raise_for_status()
    except Exception as e:
        print(f"Verification email error: {e}")
        pending.delete()
        return Response({'error': 'تعذر إرسال كود التفعيل إلى بريدك الإلكتروني. حاول مرة أخرى لاحقًا.'}, status=503)

    return Response({
        'registration_id': pending.id,
        'email': pending.email,
        'message': 'تم إرسال كود التفعيل إلى بريدك الإلكتروني'
    }, status=201)


@api_view(['POST'])
@throttle_classes([AnonRateThrottle])
def verify_email(request):
    registration_id = request.data.get('registration_id')
    code = (request.data.get('code') or '').strip().upper()

    if not registration_id or not code:
        return Response({'error': 'registration_id و code مطلوبين'}, status=400)

    try:
        pending = PendingRegistration.objects.get(id=registration_id)
    except PendingRegistration.DoesNotExist:
        return Response({'error': 'طلب التسجيل غير موجود أو انتهت صلاحيته'}, status=400)

    if not pending.verification_code_created_at or (now() - pending.verification_code_created_at) > timedelta(hours=1):
        pending.delete()
        return Response({'error': 'انتهت صلاحية كود التفعيل. يرجى التسجيل مرة أخرى'}, status=400)

    if pending.verification_code.upper() != code:
        return Response({'error': 'كود التفعيل غير صحيح'}, status=400)

    if User.objects.filter(email__iexact=pending.email).exists():
        pending.delete()
        return Response({'error': 'هذا البريد الإلكتروني مسجل بالفعل'}, status=400)

    base_username = pending.username
    unique_username = base_username
    counter = 1
    while User.objects.filter(username=unique_username).exists():
        unique_username = f"{base_username}_{counter}"
        counter += 1

    user = User(
        username=unique_username,
        email=pending.email,
        phone=pending.phone,
        first_name=pending.first_name,
        last_name=pending.last_name,
        email_verified=True,
    )
    user.password = pending.password_hash
    user.save()

    token, _ = Token.objects.get_or_create(user=user)
    pending.delete()

    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'message': 'تم تفعيل الحساب وتسجيل الدخول بنجاح'
    }, status=201)


@api_view(['POST'])
@throttle_classes([AnonRateThrottle])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'البريد الإلكتروني وكلمة المرور مطلوبين'}, status=400)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}, status=400)
    
    if not user.check_password(password):
        return Response({'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}, status=400)
    
    if not user.email_verified:
        return Response({'error': 'برجاء تفعيل بريدك الإلكتروني أولاً'}, status=403)
    
    user.last_login = now()
    user.save(update_fields=['last_login'])
    
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
        'address': user.address,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'message': 'تم تسجيل الدخول بنجاح'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'phone': user.phone or "",
        'address': user.address or "",
        'email_verified': user.email_verified,
        'date_joined': str(user.date_joined.date()),
        'date_of_birth': str(user.date_of_birth) if getattr(user, 'date_of_birth', None) else "",
        'shipping_addresses': user.shipping_addresses if getattr(user, 'shipping_addresses', None) else [],
        # ✅ FIX: كانوا ناقصين خالص من الـ response، فالفرونت مكانش بيستلمهم
        # حتى لو كانوا متخزنين صح في قاعدة البيانات.
        'gender': getattr(user, 'gender', '') or "",
        'governorate': getattr(user, 'governorate', '') or "",
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user

    # ── first_name / last_name ──
    if 'first_name' in request.data:
        user.first_name = request.data.get('first_name') or ''
    if 'last_name' in request.data:
        user.last_name = request.data.get('last_name') or ''

    # ── date_of_birth ──
    if 'date_of_birth' in request.data:
        dob = request.data.get('date_of_birth')
        user.date_of_birth = dob if dob else None

    # ── gender ──
    # ✅ FIX: كان مش بيتحفظ خالص لأن الـ view دي مكانتش بتقراه من request.data
    if 'gender' in request.data:
        gender = request.data.get('gender')
        if gender and gender not in VALID_GENDERS:
            return Response({'error': 'قيمة الجنس غير صحيحة'}, status=400)
        user.gender = gender or None

    # ── governorate ──
    # ✅ FIX: نفس الحكاية، كان مش بيتحفظ خالص
    if 'governorate' in request.data:
        user.governorate = request.data.get('governorate') or None

    # ── phone (مع نفس الفاليديشن اللي كانت موجودة) ──
    phone = request.data.get('phone', user.phone)
    if phone != user.phone:
        if phone:
            try:
                phone_regex(phone)
            except Exception:
                return Response({'error': 'رقم الهاتف غير صحيح'}, status=400)
        user.phone = phone

    # ── address ──
    if 'address' in request.data:
        user.address = request.data.get('address', user.address)

    user.save()

    return Response({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'phone': user.phone,
        'address': user.address,
        'date_of_birth': str(user.date_of_birth) if user.date_of_birth else "",
        # ✅ اترجعوا في الـ response كمان عشان الفرونت يحدث الحالة فورًا
        'gender': user.gender or "",
        'governorate': user.governorate or "",
        'message': 'تم تحديث الملف الشخصي بنجاح'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({'error': 'كلمة المرور القديمة والجديدة مطلوبين'}, status=400)
    
    if not request.user.check_password(old_password):
        return Response({'error': 'كلمة المرور القديمة غير صحيحة'}, status=400)
    
    try:
        validate_password(new_password)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
    request.user.set_password(new_password)
    request.user.save()
    
    Token.objects.filter(user=request.user).delete()
    new_token = Token.objects.create(user=request.user)
    
    return Response({
        'message': 'تم تغيير كلمة المرور بنجاح',
        'new_token': new_token.key
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
    except:
        pass
    return Response({'message': 'تم تسجيل الخروج بنجاح'})


@api_view(['POST'])
def forgot_password(request):
    email = (request.data.get('email') or '').strip().lower()

    if not email:
        return Response(
            {'error': 'البريد الإلكتروني مطلوب'},
            status=400
        )

    try:
        user = User.objects.get(email__iexact=email)

        reset_token = secrets.token_urlsafe(32)

        user.reset_token = reset_token
        user.reset_token_created_at = now()

        user.save(update_fields=[
            'reset_token',
            'reset_token_created_at'
        ])

        reset_link = f"{settings.FRONTEND_URL}/reset-password/{reset_token}"

        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "OVIU <noreply@oviustore.com>",
                "to": [email],
                "subject": "استعادة كلمة المرور - OVIU",
                "html": f"""
                <div dir="rtl" style="font-family: Arial, sans-serif;">
                    <h2>مرحباً {user.username}</h2>

                    <p>
                        تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في OVIU.
                    </p>

                    <p>
                        اضغط على الرابط التالي لإعادة تعيين كلمة المرور:
                    </p>

                    <p>
                        <a href="{reset_link}">
                            إعادة تعيين كلمة المرور
                        </a>
                    </p>

                    <p>
                        الرابط صالح لمدة ساعة واحدة.
                    </p>

                    <p>
                        إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
                    </p>
                </div>
                """,
            },
            timeout=10,
        )

        response.raise_for_status()

        return Response({
            'message': 'إذا كان البريد الإلكتروني مسجلاً، سنرسل رابط إعادة التعيين'
        })

    except User.DoesNotExist:
        return Response({
            'message': 'إذا كان البريد الإلكتروني مسجلاً، سنرسل رابط إعادة التعيين'
        })

    except Exception as e:
        print(f"Password reset email error: {e}")

        return Response(
            {'error': 'تعذر إرسال رابط إعادة التعيين. حاول مرة أخرى لاحقًا.'},
            status=503
        )

@api_view(['POST'])
def reset_password(request):
    token = request.data.get('token')
    new_password = request.data.get('password')
    
    if not token or not new_password:
        return Response({'error': 'الرمز وكلمة المرور الجديدة مطلوبين'}, status=400)
    
    try:
        user = User.objects.get(reset_token=token)
        if user.reset_token_created_at:
            if (now() - user.reset_token_created_at) > timedelta(hours=1):
                return Response({'error': 'انتهت صلاحية رابط إعادة التعيين'}, status=400)
        else:
            return Response({'error': 'الرابط غير صالح'}, status=400)
        
        try:
            validate_password(new_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
        user.set_password(new_password)
        user.reset_token = ''
        user.save()
        Token.objects.filter(user=user).delete()
        
        return Response({'message': 'تم تغيير كلمة المرور بنجاح. برجاء تسجيل الدخول مرة أخرى'})
    except User.DoesNotExist:
        return Response({'error': 'الرمز غير صالح أو منتهي الصلاحية'}, status=400)


# ─── OAuth Redirect View ─────────────────────────────────────────────────────
# بعد ما django-allauth يعمل login بجوجل أو فيسبوك،
# بترد بـ redirect للفرونت مع الـ token في الـ URL
class OAuthRedirectView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user

        if not user.is_authenticated:
            # فشل الـ OAuth
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            return redirect(f"{frontend_url}/oauth/callback?error=auth_failed")

        token, _ = Token.objects.get_or_create(user=user)

        # تأكيد الإيميل تلقائياً لمستخدمي السوشيال
        if not user.email_verified:
            user.email_verified = True
            user.save()

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        return redirect(
            f"{frontend_url}/oauth/callback"
            f"?token={token.key}"
            f"&user_id={user.id}"
            f"&username={user.username}"
            f"&email={user.email}"
        )


# ─── (غير مستخدمة من الفرونت حاليًا — راجعي الملاحظة تحت) ─────────────────────
@login_required
def profile_api(request):
    user = request.user
    if request.method == "GET":
        return JsonResponse({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "username": user.username,
            "phone": user.phone or "",
            "address": user.address or "",
            "date_of_birth": str(user.date_of_birth) if user.date_of_birth else "",
            "email_verified": user.email_verified,
            "date_joined": str(user.date_joined.date()),
            "shipping_addresses": user.shipping_addresses or [],
            "gender": getattr(user, 'gender', '') or "",
            "governorate": getattr(user, 'governorate', '') or "",
        })
    if request.method == "POST":
        data = json.loads(request.body)
        user.first_name = data.get("first_name", user.first_name)
        user.last_name  = data.get("last_name",  user.last_name)
        user.phone      = data.get("phone",       user.phone)
        user.address    = data.get("address",     user.address)
        user.gender       = data.get("gender", getattr(user, 'gender', None))
        user.governorate  = data.get("governorate", getattr(user, 'governorate', None))
        user.save()
        return JsonResponse({"status": "ok"})
    
    
    
    
    # ════════════════════════════════════════════════════════════════════════
# ✅ جديد: ضيفي الفانكشنز دي في آخر accounts/views.py
#
# محتاجة كمان تضيفي الاستيرادات دي فوق مع باقي الاستيرادات لو مش موجودة:
#   from django.shortcuts import get_object_or_404
#   from .models import Address
#   from .serializers import AddressSerializer
# ════════════════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def addresses_list_create(request):
    """
    GET: كل عناوين المستخدم الحالي (الافتراضي يظهر الأول)
    POST: إضافة عنوان جديد - بيتضاف للقائمة، مش بيستبدل أي عنوان قديم
    """
    if request.method == 'GET':
        addresses = Address.objects.filter(user=request.user)
        return Response(AddressSerializer(addresses, many=True).data)

    serializer = AddressSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    # ✅ أول عنوان للمستخدم بيبقى افتراضي تلقائيًا، وأي عنوان بعد كده بيتحط
    # افتراضي بس لو المستخدم حدد كده صراحة (is_default: true من الفرونت)
    is_first_address = not Address.objects.filter(user=request.user).exists()
    make_default = serializer.validated_data.get('is_default', False) or is_first_address

    if make_default:
        Address.objects.filter(user=request.user).update(is_default=False)

    address = serializer.save(user=request.user, is_default=make_default)
    return Response(AddressSerializer(address).data, status=201)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def address_detail(request, address_id):
    """تعديل أو حذف عنوان محدد (لازم يكون تابع للمستخدم الحالي)"""
    address = get_object_or_404(Address, id=address_id, user=request.user)

    if request.method == 'DELETE':
        was_default = address.is_default
        address.delete()
        # ✅ لو مسحنا العنوان الافتراضي وفيه عناوين تانية، نخلي أقدم واحد
        # (أو أي واحد) هو الافتراضي الجديد بدل ما نسيب المستخدم من غير
        # عنوان افتراضي خالص
        if was_default:
            next_address = Address.objects.filter(user=request.user).first()
            if next_address:
                next_address.is_default = True
                next_address.save(update_fields=['is_default'])
        return Response(status=204)

    serializer = AddressSerializer(address, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    if serializer.validated_data.get('is_default'):
        Address.objects.filter(user=request.user).exclude(pk=address.pk).update(is_default=False)

    serializer.save()
    return Response(serializer.data)