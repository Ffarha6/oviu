from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User
from .models import Address


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'password', 'password_confirm']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مسجل بالفعل")
        return value
    
    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("رقم الهاتف مسجل بالفعل")
        return value
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("كلمتا المرور غير متطابقتين")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        # Authenticate with email
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        
        # Check password
        if not user.check_password(data['password']):
            raise serializers.ValidationError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        
        # Check if active
        if not user.is_active:
            raise serializers.ValidationError("هذا الحساب غير نشط")
        
        # Check email verification
        if not user.email_verified:
            raise serializers.ValidationError("برجاء تفعيل بريدك الإلكتروني أولاً")
        
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'address', 
            'email_verified', 'date_joined'
        ]
        read_only_fields = ['id', 'email_verified', 'date_joined']


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['phone', 'address', 'first_name', 'last_name', 'date_of_birth']
    
    def validate_phone(self, value):
        if value:
            # Validate phone format
            import re
            if not re.match(r'^\+?1?\d{9,15}$', value):
                raise serializers.ValidationError("رقم الهاتف يجب أن يكون بصيغة دولية")
            
            # Check uniqueness excluding current user
            if self.instance and User.objects.exclude(id=self.instance.id).filter(phone=value).exists():
                raise serializers.ValidationError("رقم الهاتف مسجل بالفعل")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("كلمتا المرور غير متطابقتين")
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("كلمتا المرور غير متطابقتين")
        return data


class VerifyEmailSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    code = serializers.CharField(max_length=10)
    
    
    
    
    
    
    # ══════════════════════════════════════════════════════════════════════════
# ✅ إضافات جديدة للأدمن بانل — إدارة المستخدمين
# ══════════════════════════════════════════════════════════════════════════


class UserAdminListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone',
            'is_active', 'is_staff', 'is_superuser', 'email_verified',
            'date_joined',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserAdminDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'address', 'gender', 'governorate',
            'date_of_birth', 'email_verified', 'is_active', 'is_staff',
            'is_superuser', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'is_superuser', 'email_verified']
        
        
        
        
        
        # ════════════════════════════════════════════════════════════════════════
# ✅ جديد: ضيفي الكلاس ده في accounts/serializers.py (وضيفي الاستيراد
# from .models import Address لو مش موجود أصلاً)
# ════════════════════════════════════════════════════════════════════════

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'full_name', 'phone', 'governorate', 'address', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']
        
        
        
        
        
        
        # ══════════════════════════════════════════════════════════════════════════
# ✅ إضافات جديدة لإدارة المشرفين — أدوار وصلاحيات (سوبر أدمن بس اللي يعدلها)
# ══════════════════════════════════════════════════════════════════════════

ADMIN_PERMISSION_MODULES = [
    ('products', 'المنتجات'),
    ('orders', 'الطلبات'),
    ('customers', 'العملاء'),
    ('payments', 'المدفوعات'),
    ('coupons', 'الكوبونات'),
    ('reviews', 'التقييمات'),
    ('wishlist', 'المفضلة'),
    ('tryon', 'التجربة الافتراضية'),
    ('chatbot', 'الشات بوت'),
    ('analytics', 'التحليلات'),
    ('offers', 'العروض'),
    ('reports', 'التقارير'),
    ('settings', 'الإعدادات'),
]

ADMIN_ROLE_LABELS = dict(User.ADMIN_ROLE_CHOICES)


class AdminUserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone',
            'is_active', 'is_staff', 'is_superuser',
            'admin_role', 'role_display', 'last_login', 'date_joined',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_role_display(self, obj):
        if obj.is_superuser:
            return 'سوبر أدمن'
        return ADMIN_ROLE_LABELS.get(obj.admin_role, 'أدمن')


class AdminUserDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'first_name', 'last_name', 'email', 'phone',
            'is_active', 'is_staff', 'is_superuser',
            'admin_role', 'role_display', 'admin_permissions',
            'last_login', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'is_superuser', 'date_joined', 'last_login']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_role_display(self, obj):
        if obj.is_superuser:
            return 'سوبر أدمن'
        return ADMIN_ROLE_LABELS.get(obj.admin_role, 'أدمن')


class AdminRolePermissionsSerializer(serializers.ModelSerializer):
    """تعديل دور وصلاحيات أدمن موجود — للسوبر أدمن فقط"""
    class Meta:
        model = User
        fields = ['admin_role', 'admin_permissions']

    def validate_admin_role(self, value):
        valid = [c[0] for c in User.ADMIN_ROLE_CHOICES]
        if value and value not in valid:
            raise serializers.ValidationError('دور غير صالح')
        return value

    def validate_admin_permissions(self, value):
        valid_keys = [m[0] for m in ADMIN_PERMISSION_MODULES]
        for perm in value:
            if perm not in valid_keys:
                raise serializers.ValidationError(f'صلاحية غير معروفة: {perm}')
        return value


class PromoteToAdminSerializer(serializers.Serializer):
    """تعيين مستخدم عادي كأدمن جديد — للسوبر أدمن فقط"""
    admin_role = serializers.ChoiceField(choices=User.ADMIN_ROLE_CHOICES)
    admin_permissions = serializers.ListField(child=serializers.CharField(), required=False, default=list)