from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.cache import cache

from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer


class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    """Get all active products with filtering, searching, and pagination."""

    products = Product.objects.filter(
        is_active=True
    ).prefetch_related(
        'colors',
        'colors__images'
    )

    # ========== FILTERING ==========

    audience = request.GET.get('audience')
    if audience:
        products = products.filter(audience=audience)

    product_type = request.GET.get('product_type')
    if product_type:
        products = products.filter(product_type=product_type)

    lens_type = request.GET.get('lens_type')
    if lens_type:
        products = products.filter(lens_type=lens_type)

    frame_shape = request.GET.get('frame_shape')
    if frame_shape:
        products = products.filter(frame_shape=frame_shape)

    min_price = request.GET.get('min_price')
    if min_price:
        products = products.filter(price__gte=min_price)

    max_price = request.GET.get('max_price')
    if max_price:
        products = products.filter(price__lte=max_price)

    has_discount = request.GET.get('has_discount')
    if has_discount and has_discount.lower() == 'true':
        products = products.filter(discount_price__isnull=False)

    in_stock = request.GET.get('in_stock')
    if in_stock and in_stock.lower() == 'true':
        products = products.filter(stock__gt=0)

    # ========== SEARCH ==========

    search = request.GET.get('search')

    if search:
        products = products.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search)
        )

    # ========== ORDERING ==========

    ordering = request.GET.get('ordering', '-created_at')

    allowed_orderings = [
        'price',
        '-price',
        'created_at',
        '-created_at',
        'name',
        '-name',
    ]

    if ordering in allowed_orderings:
        products = products.order_by(ordering)
    else:
        products = products.order_by('-created_at')

    # ========== PAGINATION ==========

    paginator = ProductPagination()
    page = paginator.paginate_queryset(products, request)

    serializer = ProductListSerializer(
        page,
        many=True,
        context={'request': request}
    )

    response = paginator.get_paginated_response(serializer.data)

    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, slug):
    """Get detailed information about a specific product."""

    product = get_object_or_404(
        Product.objects.prefetch_related('colors__images'),
        slug=slug,
        is_active=True
    )

    serializer = ProductDetailSerializer(
        product,
        context={'request': request}
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_by_id(request, product_id):
    """Get product by ID (fallback for old links)."""

    product = get_object_or_404(
        Product.objects.prefetch_related('colors__images'),
        id=product_id,
        is_active=True
    )

    serializer = ProductDetailSerializer(
        product,
        context={'request': request}
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    """Get all categories with counts."""

    from django.db.models import Count

    categories = Product.objects.filter(
        is_active=True
    ).values(
        'product_type'
    ).annotate(
        count=Count('id')
    )

    return Response(categories)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products_by_category(request, category):
    """Get products by category."""

    products = Product.objects.filter(
        product_type=category,
        is_active=True
    ).prefetch_related(
        'colors',
        'colors__images'
    )

    paginator = ProductPagination()
    page = paginator.paginate_queryset(products, request)

    serializer = ProductListSerializer(
        page,
        many=True,
        context={'request': request}
    )

    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_products(request):
    """Search products by name or description."""

    query = request.GET.get('q', '').strip()

    if not query:
        return Response(
            {'error': 'Search query parameter "q" is required'},
            status=400
        )

    products = Product.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query),
        is_active=True
    ).prefetch_related(
        'colors',
        'colors__images'
    )

    paginator = ProductPagination()
    page = paginator.paginate_queryset(products, request)

    serializer = ProductListSerializer(
        page,
        many=True,
        context={'request': request}
    )

    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """Get featured products (top rated or on sale)."""

    products = Product.objects.filter(
        is_active=True
    ).filter(
        Q(discount_price__isnull=False) |
        Q(average_rating__gte=4.0)
    ).prefetch_related(
        'colors',
        'colors__images'
    )[:10]

    serializer = ProductListSerializer(
        products,
        many=True,
        context={'request': request}
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def new_arrivals(request):
    """Get newest products."""

    products = Product.objects.filter(
        is_active=True
    ).order_by(
        '-created_at'
    ).prefetch_related(
        'colors',
        'colors__images'
    )[:20]

    serializer = ProductListSerializer(
        products,
        many=True,
        context={'request': request}
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def related_products(request, slug):
    """Get related products based on category and audience."""

    product = get_object_or_404(
        Product,
        slug=slug,
        is_active=True
    )

    related = Product.objects.filter(
        Q(product_type=product.product_type) |
        Q(audience=product.audience),
        is_active=True
    ).exclude(
        id=product.id
    ).prefetch_related(
        'colors',
        'colors__images'
    )[:10]

    serializer = ProductListSerializer(
        related,
        many=True,
        context={'request': request}
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def autocomplete(request):
    """اقتراحات أثناء الكتابة (AutoComplete)."""

    query = request.GET.get('q', '').strip()

    if not query or len(query) < 2:
        return Response([])

    products = Product.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query),
        is_active=True
    ).prefetch_related(
        'colors',
        'colors__images'
    )[:10]

    suggestions = []

    for product in products:
        image = None

        # البحث عن الصورة الأساسية
        for color in product.colors.all():
            primary = color.images.filter(is_primary=True).first()

            if primary and primary.image:
                image = request.build_absolute_uri(primary.image.url)
                break

        # لو مفيش primary، نستخدم أول صورة موجودة
        if not image:
            for color in product.colors.all():
                first = color.images.first()

                if first and first.image:
                    image = request.build_absolute_uri(first.image.url)
                    break

        suggestions.append({
            'id': product.id,
            'name': product.name,
            'slug': product.slug,
            'price': float(product.get_current_price()),
            'image': image,
        })

    return Response(suggestions)


@api_view(['GET'])
@permission_classes([AllowAny])
def best_sellers(request):
    """Get best selling products."""

    products = Product.objects.filter(
        is_active=True
    ).order_by(
        '-views_count'
    ).prefetch_related(
        'colors',
        'colors__images'
    )[:10]

    serializer = ProductListSerializer(
        products,
        many=True,
        context={'request': request}
    )

    return Response(serializer.data)