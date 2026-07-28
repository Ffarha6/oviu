from rest_framework import serializers
from .models import Payment, PaymentMethod, TransactionLog
from orders.models import Order


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods"""
    name_display = serializers.ReadOnlyField(source='get_name_display')
    
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'name_display', 'icon', 'description', 'is_active', 'sort_order']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    order_number = serializers.ReadOnlyField(source='order.id')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    payment_method_display = serializers.ReadOnlyField(source='get_payment_method_display')
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'amount', 'payment_method',
            'payment_method_display', 'status', 'status_display',
            'transaction_id', 'paid_at', 'created_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'paid_at', 'created_at']


class InitiatePaymentSerializer(serializers.Serializer):
    """Serializer for initiating a payment"""
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=PaymentMethod.METHOD_CHOICES)
    
    def validate_order_id(self, value):
        try:
            order = Order.objects.get(id=value, user=self.context['request'].user)
            if order.is_paid:
                raise serializers.ValidationError("هذا الطلب مدفوع بالفعل")
            if order.status == 'cancelled':
                raise serializers.ValidationError("لا يمكن الدفع لطلب ملغي")
        except Order.DoesNotExist:
            raise serializers.ValidationError("الطلب غير موجود")
        return value


class VerifyPaymentSerializer(serializers.Serializer):
    """Serializer for verifying a payment"""
    payment_id = serializers.IntegerField()
    transaction_id = serializers.CharField(max_length=100, required=False)
    
    def validate_payment_id(self, value):
        try:
            payment = Payment.objects.get(id=value, user=self.context['request'].user)
            if payment.status == 'completed':
                raise serializers.ValidationError("هذا الدفع مكتمل بالفعل")
        except Payment.DoesNotExist:
            raise serializers.ValidationError("الدفع غير موجود")
        return value


class BankTransferSerializer(serializers.Serializer):
    """Serializer for bank transfer payment"""
    payment_id = serializers.IntegerField()
    receipt = serializers.ImageField()
    
    def validate_payment_id(self, value):
        try:
            payment = Payment.objects.get(id=value, user=self.context['request'].user)
            if payment.payment_method != 'bank':
                raise serializers.ValidationError("طريقة الدفع ليست تحويل بنكي")
        except Payment.DoesNotExist:
            raise serializers.ValidationError("الدفع غير موجود")
        return value


class TransactionLogSerializer(serializers.ModelSerializer):
    """Serializer for transaction logs"""
    
    class Meta:
        model = TransactionLog
        fields = ['id', 'action', 'status', 'response_data', 'created_at']
        read_only_fields = ['id', 'created_at']