from rest_framework import serializers
from .models import TryOnSession, TryOnImage, TryOnResult, FaceMeasurement
from products.models import Product


class FaceMeasurementSerializer(serializers.ModelSerializer):
    """Serializer for face measurements"""
    
    class Meta:
        model = FaceMeasurement
        fields = ['id', 'eye_distance', 'face_width', 'nose_bridge', 'created_at']
        read_only_fields = ['id', 'created_at']


class TryOnImageSerializer(serializers.ModelSerializer):
    """Serializer for try-on images"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TryOnImage
        fields = ['id', 'image', 'image_url', 'glasses_product', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image_url(self, obj):
        return obj.image.url if obj.image else None


class TryOnResultSerializer(serializers.ModelSerializer):
    """Serializer for try-on results"""
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.SerializerMethodField()
    original_image_url = serializers.SerializerMethodField()
    processed_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TryOnResult
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'original_image', 'original_image_url',
            'processed_image', 'processed_image_url',
            'confidence_score', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_product_price(self, obj):
        return float(obj.product.get_current_price())
    
    def get_original_image_url(self, obj):
        return obj.original_image.image.url if obj.original_image and obj.original_image.image else None
    
    def get_processed_image_url(self, obj):
        return obj.processed_image.url if obj.processed_image else None


class TryOnSessionSerializer(serializers.ModelSerializer):
    """Serializer for try-on sessions"""
    images = TryOnImageSerializer(many=True, read_only=True)
    results = TryOnResultSerializer(many=True, read_only=True)
    measurement = FaceMeasurementSerializer(read_only=True)
    images_count = serializers.SerializerMethodField()
    results_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TryOnSession
        fields = [
            'id', 'session_key', 'created_at', 'updated_at',
            'images', 'results', 'measurement',
            'images_count', 'results_count'
        ]
        read_only_fields = ['id', 'session_key', 'created_at', 'updated_at']
    
    def get_images_count(self, obj):
        return obj.images.count()
    
    def get_results_count(self, obj):
        return obj.results.count()


class CreateTryOnImageSerializer(serializers.ModelSerializer):
    """Serializer for creating a new try-on image"""
    
    class Meta:
        model = TryOnImage
        fields = ['image', 'glasses_product']
    
    def validate_image(self, value):
        """التحقق من صحة الصورة"""
        if value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
        
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("نوع الصورة غير مدعوم. الأنواع المدعومة: JPEG, PNG, WEBP")
        
        return value


class CreateTryOnResultSerializer(serializers.ModelSerializer):
    """Serializer for creating a new try-on result"""
    
    class Meta:
        model = TryOnResult
        fields = ['original_image', 'product', 'processed_image', 'confidence_score']
    
    def validate_confidence_score(self, value):
        if value < 0 or value > 1:
            raise serializers.ValidationError("Confidence score must be between 0 and 1")
        return value


class UpdateFaceMeasurementSerializer(serializers.ModelSerializer):
    """Serializer for updating face measurements"""
    
    class Meta:
        model = FaceMeasurement
        fields = ['eye_distance', 'face_width', 'nose_bridge']
    
    def validate_eye_distance(self, value):
        if value < 30 or value > 80:
            raise serializers.ValidationError("Eye distance must be between 30mm and 80mm")
        return value
    
    def validate_face_width(self, value):
        if value < 100 or value > 200:
            raise serializers.ValidationError("Face width must be between 100mm and 200mm")
        return value