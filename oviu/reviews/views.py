from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg

from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer
from products.models import Product


@api_view(['GET'])
def product_reviews(request, product_id):
    """جلب التقييمات المعتمدة لمنتج معين"""
    product = get_object_or_404(Product, id=product_id, is_active=True)
    reviews = Review.objects.filter(product=product, is_approved=True)
    serializer = ReviewSerializer(reviews, many=True)

    # حساب متوسط التقييمات
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0

    return Response({
        'product_id': product.id,
        'product_name': product.name,
        'average_rating': round(avg_rating, 1),
        'total_reviews': reviews.count(),
        'reviews': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request):
    """إضافة تقييم جديد"""
    serializer = CreateReviewSerializer(
        data=request.data,
        context={'request': request}
    )

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # التحقق من أن المستخدم لم يقيّم هذا المنتج من قبل
    product = serializer.validated_data['product']
    existing_review = Review.objects.filter(
        user=request.user,
        product=product
    ).first()

    if existing_review:
        return Response(
            {'error': 'لقد قمت بتقييم هذا المنتج من قبل. يمكنك تعديل تقييمك السابق.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    review = serializer.save()
    result_serializer = ReviewSerializer(review)

    return Response(result_serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_review(request, review_id):
    """تعديل تقييم (للمستخدم نفسه فقط)"""
    review = get_object_or_404(Review, id=review_id, user=request.user)

    # منع تعديل التقييمات المعتمدة
    if review.is_approved:
        return Response(
            {'error': 'لا يمكن تعديل تقييم تم اعتماده بالفعل'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = CreateReviewSerializer(
        review,
        data=request.data,
        partial=True,
        context={'request': request}
    )

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    review = serializer.save()
    result_serializer = ReviewSerializer(review)

    return Response(result_serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    """حذف تقييم (للمستخدم نفسه فقط)"""
    review = get_object_or_404(Review, id=review_id, user=request.user)

    if review.is_approved:
        return Response(
            {'error': 'لا يمكن حذف تقييم تم اعتماده بالفعل'},
            status=status.HTTP_400_BAD_REQUEST
        )

    review.delete()
    return Response({'message': 'تم حذف التقييم بنجاح'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reviews(request):
    """جلب تقييمات المستخدم الحالي"""
    reviews = Review.objects.filter(user=request.user)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


# ========== APIs للمشرفين فقط ==========

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_reviews(request):
    """جلب جميع التقييمات (للمشرفين)"""
    reviews = Review.objects.all().order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def approve_review(request, review_id):
    """اعتماد تقييم (للمشرفين فقط)"""
    review = get_object_or_404(Review, id=review_id)
    review.is_approved = True
    review.save()

    serializer = ReviewSerializer(review)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_review(request, review_id):
    """حذف أي تقييم (للمشرفين فقط)"""
    review = get_object_or_404(Review, id=review_id)
    review.delete()
    return Response({'message': 'تم حذف التقييم بنجاح'})