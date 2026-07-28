from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .models import User
from .serializers import UserAdminListSerializer, UserAdminDetailSerializer


class AdminUserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ─── إحصائيات الكروت اللي فوق جدول العملاء ───────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_stats(request):
    qs = User.objects.all()
    total = qs.count()
    active = qs.filter(is_active=True).count()
    staff = qs.filter(is_staff=True).count()
    now = timezone.now()
    new_this_month = qs.filter(date_joined__year=now.year, date_joined__month=now.month).count()

    return Response({
        'total_customers': total,
        'active_customers': active,
        'staff_count': staff,
        'new_this_month': new_this_month,
    })


# ─── قائمة المستخدمين (بحث + فلاتر + صفحات) ──────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    users = User.objects.all()

    search = request.GET.get('search')
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(phone__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )

    status_filter = request.GET.get('status')
    if status_filter == 'active':
        users = users.filter(is_active=True)
    elif status_filter == 'inactive':
        users = users.filter(is_active=False)

    role_filter = request.GET.get('role')
    if role_filter == 'admin':
        users = users.filter(is_staff=True)
    elif role_filter == 'customer':
        users = users.filter(is_staff=False)

    ordering = request.GET.get('ordering', '-date_joined')
    allowed = ['date_joined', '-date_joined', 'username', '-username']
    users = users.order_by(ordering if ordering in allowed else '-date_joined')

    paginator = AdminUserPagination()
    page = paginator.paginate_queryset(users, request)
    serializer = UserAdminListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ─── تفاصيل مستخدم / تعديل / حذف ─────────────────────────────────────────────
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    user = get_object_or_404(User, id=user_id)

    if request.method == 'GET':
        return Response(UserAdminDetailSerializer(user).data)

    if request.method == 'PATCH':
        serializer = UserAdminDetailSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserAdminDetailSerializer(user).data)

    if request.method == 'DELETE':
        if user.id == request.user.id:
            return Response({'error': 'لا يمكنك حذف حسابك الخاص'}, status=400)
        user.delete()
        return Response(status=204)


# ─── تفعيل / إيقاف حساب مستخدم ────────────────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_user_status(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if user.id == request.user.id:
        return Response({'error': 'لا يمكنك إيقاف حسابك الخاص'}, status=400)
    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])
    return Response({'id': user.id, 'is_active': user.is_active})


# ─── ترقية مستخدم لأدمن / إلغاء صلاحية الأدمن ────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_staff(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if user.id == request.user.id:
        return Response({'error': 'لا يمكنك تعديل صلاحياتك الخاصة'}, status=400)
    user.is_staff = not user.is_staff
    user.save(update_fields=['is_staff'])
    return Response({'id': user.id, 'is_staff': user.is_staff})





# ══════════════════════════════════════════════════════════════════════════
# ✅ إضافات جديدة — إدارة المشرفين (الأدوار والصلاحيات)
# ══════════════════════════════════════════════════════════════════════════
from rest_framework.permissions import BasePermission
from .serializers import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminRolePermissionsSerializer,
    PromoteToAdminSerializer,
    ADMIN_PERMISSION_MODULES,
)


class IsSuperUser(BasePermission):
    """يسمح فقط للسوبر أدمن — دي العمليات الحساسة (تعيين/تعديل صلاحيات/إلغاء أدمن)"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_permission_modules(request):
    """قائمة الصلاحيات المتاحة (يستخدمها الفرونت لبناء واجهة الاختيار)"""
    return Response([{'key': k, 'label': v} for k, v in ADMIN_PERMISSION_MODULES])


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_admins_stats(request):
    staff_qs = User.objects.filter(is_staff=True)
    total = staff_qs.count()
    active = staff_qs.filter(is_active=True).count()
    inactive = staff_qs.filter(is_active=False).count()
    now_ = timezone.now()
    new_this_month = staff_qs.filter(date_joined__year=now_.year, date_joined__month=now_.month).count()

    role_counts = {'super_admin': User.objects.filter(is_superuser=True).count()}
    for key, _label in User.ADMIN_ROLE_CHOICES:
        role_counts[key] = staff_qs.filter(admin_role=key, is_superuser=False).count()

    return Response({
        'total_admins': total,
        'active_admins': active,
        'inactive_admins': inactive,
        'new_this_month': new_this_month,
        'role_counts': role_counts,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_admins_list(request):
    users = User.objects.filter(is_staff=True)

    search = request.GET.get('search')
    if search:
        users = users.filter(
            Q(username__icontains=search) | Q(email__icontains=search) |
            Q(first_name__icontains=search) | Q(last_name__icontains=search)
        )

    role_filter = request.GET.get('role')
    if role_filter == 'super_admin':
        users = users.filter(is_superuser=True)
    elif role_filter:
        users = users.filter(admin_role=role_filter, is_superuser=False)

    status_filter = request.GET.get('status')
    if status_filter == 'active':
        users = users.filter(is_active=True)
    elif status_filter == 'inactive':
        users = users.filter(is_active=False)

    users = users.order_by('-is_superuser', '-date_joined')

    paginator = AdminUserPagination()
    page = paginator.paginate_queryset(users, request)
    serializer = AdminUserListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_admin_detail(request, user_id):
    user = get_object_or_404(User, id=user_id, is_staff=True)
    return Response(AdminUserDetailSerializer(user).data)


@api_view(['PATCH'])
@permission_classes([IsSuperUser])
def admin_update_admin_permissions(request, user_id):
    """تعديل دور وصلاحيات أدمن — للسوبر أدمن فقط"""
    user = get_object_or_404(User, id=user_id, is_staff=True)
    if user.is_superuser:
        return Response({'error': 'لا يمكن تعديل صلاحيات السوبر أدمن'}, status=400)
    serializer = AdminRolePermissionsSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(AdminUserDetailSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsSuperUser])
def admin_promote_user(request, user_id):
    """تعيين مستخدم عادي كأدمن جديد بدور وصلاحيات محددة — للسوبر أدمن فقط"""
    user = get_object_or_404(User, id=user_id)
    serializer = PromoteToAdminSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user.is_staff = True
    user.admin_role = serializer.validated_data['admin_role']
    user.admin_permissions = serializer.validated_data.get('admin_permissions', [])
    user.save(update_fields=['is_staff', 'admin_role', 'admin_permissions'])
    return Response(AdminUserDetailSerializer(user).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsSuperUser])
def admin_demote_admin(request, user_id):
    """إلغاء صلاحيات الأدمن نهائيًا وتحويله لعميل عادي — للسوبر أدمن فقط"""
    user = get_object_or_404(User, id=user_id, is_staff=True)
    if user.is_superuser:
        return Response({'error': 'لا يمكن إلغاء صلاحيات السوبر أدمن'}, status=400)
    if user.id == request.user.id:
        return Response({'error': 'لا يمكنك إلغاء صلاحياتك الخاصة'}, status=400)
    user.is_staff = False
    user.admin_role = None
    user.admin_permissions = []
    user.save(update_fields=['is_staff', 'admin_role', 'admin_permissions'])
    return Response(status=204)