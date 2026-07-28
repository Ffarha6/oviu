from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from django.utils import timezone

from .models import Review
from .serializers import (
    ReviewAdminListSerializer,
    ReviewAdminDetailSerializer,
    ReviewAdminReplySerializer,
)


class AdminReviewPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def _status(review):
    if review.is_rejected:
        return 'rejected'
    if review.is_approved:
        return 'approved'
    return 'pending'


# ─── إحصائيات الكروت اللي فوق جدول التقييمات ─────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_review_stats(request):
    qs = list(Review.objects.all())
    total = len(qs)

    pending = sum(1 for r in qs if _status(r) == 'pending')
    approved = sum(1 for r in qs if _status(r) == 'approved')
    rejected = sum(1 for r in qs if _status(r) == 'rejected')

    avg_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    five_star = sum(1 for r in qs if r.rating == 5)
    has_comment = sum(1 for r in qs if r.comment and r.comment.strip())

    return Response({
        'total_reviews': total,
        'pending': pending,
        'approved': approved,
        'rejected': rejected,
        'average_rating': round(avg_rating, 1),
        'five_star_count': five_star,
        'five_star_percent': round((five_star / total * 100), 1) if total else 0,
        'has_comment_count': has_comment,
        'has_comment_percent': round((has_comment / total * 100), 1) if total else 0,
    })


# ─── قائمة التقييمات (بحث + فلاتر + صفحات) ───────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_reviews_list(request):
    reviews = Review.objects.all().select_related('user', 'product').order_by('-created_at')

    search = request.GET.get('search')
    if search:
        reviews = reviews.filter(
            Q(comment__icontains=search) |
            Q(title__icontains=search) |
            Q(user__username__icontains=search) |
            Q(user__email__icontains=search) |
            Q(product__name__icontains=search)
        )

    status_filter = request.GET.get('status')
    reviews = list(reviews)
    if status_filter:
        reviews = [r for r in reviews if _status(r) == status_filter]

    rating_filter = request.GET.get('rating')
    if rating_filter:
        reviews = [r for r in reviews if r.rating == int(rating_filter)]

    product_id = request.GET.get('product')
    if product_id:
        reviews = [r for r in reviews if r.product_id == int(product_id)]

    paginator = AdminReviewPagination()
    page = paginator.paginate_queryset(reviews, request)
    serializer = ReviewAdminListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ─── تفاصيل تقييم / حذف ──────────────────────────────────────────────────────
@api_view(['GET', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_review_detail(request, review_id):
    review = get_object_or_404(Review, id=review_id)

    if request.method == 'GET':
        return Response(ReviewAdminDetailSerializer(review, context={'request': request}).data)

    if request.method == 'DELETE':
        review.delete()
        return Response(status=204)


# ─── اعتماد التقييم ───────────────────────────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_approve_review(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    review.is_approved = True
    review.is_rejected = False
    review.save(update_fields=['is_approved', 'is_rejected'])
    return Response(ReviewAdminDetailSerializer(review, context={'request': request}).data)


# ─── رفض التقييم ──────────────────────────────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_reject_review(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    review.is_rejected = True
    review.is_approved = False
    review.save(update_fields=['is_approved', 'is_rejected'])
    return Response(ReviewAdminDetailSerializer(review, context={'request': request}).data)


# ─── إعادة التقييم لحالة "قيد المراجعة" ──────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_reset_review_status(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    review.is_approved = False
    review.is_rejected = False
    review.save(update_fields=['is_approved', 'is_rejected'])
    return Response(ReviewAdminDetailSerializer(review, context={'request': request}).data)


# ─── الرد على التقييم ──────────────────────────────────────────────────────────
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_reply_review(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    serializer = ReviewAdminReplySerializer(review, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(ReviewAdminDetailSerializer(review, context={'request': request}).data)