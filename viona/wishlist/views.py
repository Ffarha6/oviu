from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Wishlist
from .serializers import WishlistSerializer
from products.models import Product


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_wishlist(request):
    """جلب قائمة الأماني للمستخدم الحالي"""
    wishlist_items = Wishlist.objects.filter(user=request.user)
    serializer = WishlistSerializer(wishlist_items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    """إضافة منتج إلى قائمة الأماني"""
    product_id = request.data.get('product_id')

    if not product_id:
        return Response(
            {'error': 'product_id مطلوب'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # التحقق من وجود المنتج
    product = get_object_or_404(Product, id=product_id, is_active=True)

    # التحقق من عدم وجوده مسبقاً في القائمة
    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    if created:
        serializer = WishlistSerializer(wishlist_item)
        return Response(
            {'message': 'تم إضافة المنتج إلى المفضلة', 'data': serializer.data},
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(
            {'message': 'المنتج موجود بالفعل في المفضلة'},
            status=status.HTTP_200_OK
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    """حذف منتج من قائمة الأماني"""
    wishlist_item = get_object_or_404(
        Wishlist,
        user=request.user,
        product_id=product_id
    )
    wishlist_item.delete()

    return Response(
        {'message': 'تم حذف المنتج من المفضلة'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_in_wishlist(request, product_id):
    """التحقق مما إذا كان المنتج في قائمة الأماني"""
    exists = Wishlist.objects.filter(
        user=request.user,
        product_id=product_id
    ).exists()

    return Response({'in_wishlist': exists})