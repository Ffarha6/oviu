from django.contrib.auth import get_user_model
from django.db.models import Count, Max, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Wishlist

User = get_user_model()


class AdminWishlistPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ─── اتجاه الإضافة للمفضلة خلال آخر 30 يوم (للرسم البياني) ───────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_wishlist_overview(request):
    since = timezone.now() - timedelta(days=30)
    data = (
        Wishlist.objects.filter(added_at__gte=since)
        .annotate(day=TruncDate('added_at'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )
    return Response([{'day': str(d['day']), 'count': d['count']} for d in data])



# ─── إحصائيات الكروت فوق الجدول ──────────────────────────────────────────────
# ✅ ملحوظة: الباك اند حاليًا بيسجل بس إن المنتج اتضاف للمفضلة وإمتى.
# مفيش تتبع لعدد المشاهدات، أو الإضافة للسلة، أو التحويل لطلب فعلي،
# فالكروت دي اتشالت من الإحصائيات لحد ما نضيف تتبع ليها في المستقبل.
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_wishlist_stats(request):
    total_items = Wishlist.objects.count()
    unique_users = Wishlist.objects.values('user').distinct().count()

    return Response({
        'total_items': total_items,
        'unique_users': unique_users,
    })


# ─── قائمة المستخدمين وقوائم أمنياتهم (مجمّعة حسب اليوزر) ───────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_wishlist_list(request):
    search = request.GET.get('search')

    user_ids = Wishlist.objects.values_list('user', flat=True).distinct()
    users_qs = User.objects.filter(id__in=user_ids)

    if search:
        users_qs = users_qs.filter(
            Q(email__icontains=search) |
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )

    users_qs = users_qs.annotate(
        items_count=Count('wishlist_items'),
        last_activity=Max('wishlist_items__added_at'),
    ).order_by('-last_activity')

    paginator = AdminWishlistPagination()
    page = paginator.paginate_queryset(users_qs, request)

    results = []
    for user in page:
        recent_items = (
            Wishlist.objects.filter(user=user)
            .select_related('product')
            .order_by('-added_at')[:6]
        )
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        results.append({
            'user_id': user.id,
            'name': full_name,
            'email': user.email,
            'items_count': user.items_count,
            'last_activity': user.last_activity,
            'preview_products': [
                {'id': w.product.id, 'name': w.product.name, 'sku': w.product.sku}
                for w in recent_items
            ],
        })

    return paginator.get_paginated_response(results)


# ─── الفئات الأكثر إضافة للمفضلة ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_wishlist_top_categories(request):
    total = Wishlist.objects.count()
    data = (
        Wishlist.objects.values('product__product_type')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    result = [
        {
            'category': d['product__product_type'],
            'count': d['count'],
            'percent': round((d['count'] / total * 100), 1) if total else 0,
        }
        for d in data
    ]
    return Response(result)


# ─── المنتجات الأكثر إضافة للمفضلة ────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_wishlist_top_products(request):
    data = (
        Wishlist.objects.values('product__id', 'product__name', 'product__sku')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )
    return Response(list(data))