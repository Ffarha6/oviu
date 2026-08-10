from rest_framework import serializers
from django.conf import settings
from .models import Order, OrderItem
from products.models import Product, Color


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem (read-only)"""
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.SerializerMethodField()  # ✅ تم التعديل
    product_image = serializers.SerializerMethodField()  # ✅ جديد
    color_name = serializers.ReadOnlyField(source='color.name')
    color_code = serializers.ReadOnlyField(source='color.code')
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price', 'product_image',
            'color', 'color_name', 'color_code',
            'quantity', 'price_at_time', 'total'
        ]
    
    def get_total(self, obj):
        return obj.get_total()
    
    def get_product_price(self, obj):  # ✅ تم الإضافة
        return float(obj.product.get_current_price())

    def get_product_image(self, obj):  # ✅ جديد
        request = self.context.get('request')
        img = None
        # الأولوية لصورة اللون اللي اتشرى بالظبط
        if obj.color:
            img = obj.color.images.filter(is_primary=True).first() or obj.color.images.first()
        # لو مفيش، خدي أي صورة من أي لون تاني للمنتج
        if not img:
            for color in obj.product.colors.all():
                img = color.images.filter(is_primary=True).first() or color.images.first()
                if img:
                    break
        if img and img.image:
            url = img.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order (read-only)"""
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.ReadOnlyField(source='user.email')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    payment_method_display = serializers.ReadOnlyField(source='get_payment_method_display')
    total_price_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_name',
            'total_price', 'total_price_display',
            'phone', 'address', 'payment_method', 'payment_method_display',
            'notes', 'status', 'status_display',
            'is_paid', 'paid_at', 'shipped_date', 'delivered_date',
            'tracking_number', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_total_price_display(self, obj):
        return f"{obj.total_price} ج.م"


class CreateOrderSerializer(serializers.ModelSerializer):
    """Serializer for creating a new order"""
    items = serializers.ListField(write_only=True)
    
    class Meta:
        model = Order
        fields = ['phone', 'address', 'payment_method', 'notes', 'items']
    
    def validate_phone(self, value):
        """التحقق من صحة رقم الهاتف (مصري أو دولي)"""  # ✅ تم التعديل
        # تنظيف رقم الهاتف
        cleaned = value.strip().replace(' ', '').replace('-', '')
        
        # قبول الأرقام الدولية التي تبدأ بـ +
        if cleaned.startswith('+'):
            # مثال: +201234567890 (13 رقم) أو +971xxxxxxxx
            if len(cleaned) < 10 or len(cleaned) > 15:
                raise serializers.ValidationError("رقم الهاتف غير صحيح")
            # التحقق من أن باقي الأرقام أرقام فقط
            if not cleaned[1:].isdigit():
                raise serializers.ValidationError("رقم الهاتف غير صحيح")
        else:
            # أرقام محلية
            if not cleaned.isdigit():
                raise serializers.ValidationError("رقم الهاتف يجب أن يحتوي على أرقام فقط")
            
            # مصر: 11 رقم تبدأ بـ 01 أو 02
            if len(cleaned) == 11 and cleaned[:2] in ['01', '02']:
                pass  # صحيح
            # 10 أرقام تبدأ بـ 10 (مثل 1012345678)
            elif len(cleaned) == 10 and cleaned[:2] == '10':
                pass  # صحيح
            else:
                raise serializers.ValidationError("رقم الهاتف غير صحيح (يجب أن يكون 11 رقماً مصرياً)")
        
        return cleaned
    
    def validate_payment_method(self, value):
        """التحقق من طريقة الدفع"""
        if value not in ['cash', 'card', 'wallet']:
            raise serializers.ValidationError("طريقة الدفع غير صالحة")
        return value
    
    def validate_items(self, value):
        """التحقق من صحة الأصناف"""
        if not value:
            raise serializers.ValidationError("لا يمكن أن يكون الطلب فارغاً")
        
        for item in value:
            # التحقق من وجود product_id
            product_id = item.get('product_id')
            if not product_id:
                raise serializers.ValidationError("يجب تحديد المنتج")
            
            # التحقق من وجود الكمية
            quantity = item.get('quantity')
            if not quantity:
                raise serializers.ValidationError("يجب تحديد الكمية")
            
            if quantity <= 0:
                raise serializers.ValidationError("الكمية يجب أن تكون أكبر من 0")
            
            # التحقق من وجود المنتج
            try:
                product = Product.objects.get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"المنتج {product_id} غير موجود")
            
            # التحقق من المخزون
            if quantity > product.stock:
                raise serializers.ValidationError(
                    f"المنتج {product.name} غير متوفر بالكمية المطلوبة. المتاح: {product.stock}"
                )
            
            # ✅ تم التعديل: تم حذف حساب price_at_time من هنا
            # سيتم حساب السعر في views.py بعد select_for_update()
            
            # التحقق من اللون (اختياري)
            color_id = item.get('color_id')
            if color_id:
                try:
                    color = Color.objects.get(id=color_id, product=product)
                    item['color'] = color
                except Color.DoesNotExist:
                    raise serializers.ValidationError(
                        f"اللون {color_id} غير موجود للمنتج {product.name}"
                    )
            else:
                item['color'] = None
            
            item['product'] = product
        
        return value

    def create(self, validated_data):
        """
        إنشاء الطلب مع الأصناف
        ملاحظة: هذه الدالة لن تُستخدم مباشرة لأن price_at_time يُحسب في views.py
        """
        items_data = validated_data.pop('items')
        
        # إنشاء الطلب بسعر مؤقت 0
        order = Order.objects.create(
            user=self.context['request'].user,
            total_price=0,  # سيتم تحديثه في views.py
            phone=validated_data['phone'],
            address=validated_data['address'],
            payment_method=validated_data.get('payment_method', 'cash'),
            notes=validated_data.get('notes', ''),
            status='pending'
        )
        
        # إنشاء OrderItems بسعر مؤقت 0
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                color=item_data['color'],
                quantity=item_data['quantity'],
                price_at_time=0  # سيتم تحديثه في views.py
            )
        
        return order


class UpdateOrderStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating order status (admin only)"""
    class Meta:
        model = Order
        fields = ['status']
    
    def validate_status(self, value):
        valid_statuses = ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"الحالة غير صالحة. الخيارات: {', '.join(valid_statuses)}")
        return value
    
    
    
    
    
    
    # ══════════════════════════════════════════════════════════════════════════
# ✅ إضافات جديدة للأدمن بانل — ضيفي الكود ده في آخر ملف orders/serializers.py
# (تحت الكلاسات الموجودة، من غير ما تمسحي حاجة قديمة)
# ══════════════════════════════════════════════════════════════════════════


class OrderAdminListSerializer(serializers.ModelSerializer):
    """سيريالايزر خفيف لجدول الطلبات في الأدمن بانل"""
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.ReadOnlyField(source='user.email')
    items_count = serializers.SerializerMethodField()
    status_display = serializers.ReadOnlyField(source='get_status_display')
    payment_method_display = serializers.ReadOnlyField(source='get_payment_method_display')

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email', 'phone',
            'items_count', 'total_price', 'payment_method', 'payment_method_display',
            'status', 'status_display', 'is_paid', 'tracking_number',
            'created_at',
        ]

    def get_customer_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username

    def get_items_count(self, obj):
        return obj.items.count()


class OrderAdminDetailSerializer(serializers.ModelSerializer):
    """سيريالايزر كامل لبانل تفاصيل الطلب"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.ReadOnlyField(source='user.email')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    payment_method_display = serializers.ReadOnlyField(source='get_payment_method_display')

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email', 'phone', 'address', 'notes',
            'items', 'total_price', 'payment_method', 'payment_method_display',
            'status', 'status_display', 'is_paid', 'paid_at',
            'shipped_date', 'delivered_date', 'tracking_number',
            'created_at', 'updated_at',
        ]

    def get_customer_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username


class OrderAdminUpdateSerializer(serializers.ModelSerializer):
    """تعديل بيانات إضافية للطلب من الأدمن (ملاحظات، رقم تتبع، حالة الدفع، العنوان، الهاتف)
    ملحوظة: تغيير الـ status نفسه بيتم من خلال endpoint موجود بالفعل:
    PATCH /api/orders/<id>/status/  (views.update_order_status)"""
    class Meta:
        model = Order
        fields = ['notes', 'tracking_number', 'is_paid', 'address', 'phone']