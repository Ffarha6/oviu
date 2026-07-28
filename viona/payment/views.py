from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils.timezone import now
import uuid

from .models import Payment, PaymentMethod, TransactionLog
from .serializers import (
    PaymentSerializer, PaymentMethodSerializer, InitiatePaymentSerializer,
    VerifyPaymentSerializer, BankTransferSerializer
)
from orders.models import Order


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_methods(request):
    """الحصول على طرق الدفع المتاحة"""
    methods = PaymentMethod.objects.filter(is_active=True)
    serializer = PaymentMethodSerializer(methods, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """بدء عملية الدفع"""
    serializer = InitiatePaymentSerializer(data=request.data, context={'request': request})
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    order_id = serializer.validated_data['order_id']
    payment_method = serializer.validated_data['payment_method']
    
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    # إنشاء سجل دفع جديد
    payment = Payment.objects.create(
        order=order,
        user=request.user,
        amount=order.total_price,
        payment_method=payment_method,
        status='pending',
        transaction_id=f"TXN_{uuid.uuid4().hex[:12].upper()}"
    )
    
    # تسجيل المعاملة
    TransactionLog.objects.create(
        payment=payment,
        action='initiate',
        status='pending',
        response_data={'payment_method': payment_method}
    )
    
    # إذا كانت طريقة الدفع "cash on delivery"، يمكن إكمال الدفع مباشرة
    if payment_method == 'cash':
        payment.mark_as_completed(transaction_id=payment.transaction_id)
        TransactionLog.objects.create(
            payment=payment,
            action='complete',
            status='completed',
            response_data={'message': 'Cash on delivery order confirmed'}
        )
        return Response({
            'status': 'success',
            'message': 'تم تأكيد الطلب. سيتم الدفع عند الاستلام',
            'payment': PaymentSerializer(payment).data
        })
    
    # لطرق الدفع الأخرى، ننتظر التأكيد
    return Response({
        'status': 'pending',
        'message': 'تم بدء عملية الدفع. يرجى إكمال الدفع',
        'payment_id': payment.id,
        'transaction_id': payment.transaction_id,
        'amount': float(payment.amount)
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """التحقق من حالة الدفع (للدفع بالبطاقة)"""
    serializer = VerifyPaymentSerializer(data=request.data, context={'request': request})
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    payment = get_object_or_404(Payment, id=serializer.validated_data['payment_id'])
    
    # هنا سيتم الاتصال بـ Stripe أو PayMob للتحقق من الدفع
    # حالياً نقوم بمحاكاة التحقق
    
    # محاكاة نجاح الدفع
    payment.mark_as_completed()
    TransactionLog.objects.create(
        payment=payment,
        action='verify',
        status='completed',
        response_data={'verified': True}
    )
    
    return Response({
        'status': 'completed',
        'message': 'تم تأكيد الدفع بنجاح',
        'payment': PaymentSerializer(payment).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bank_transfer_upload(request):
    """رفع إيصال التحويل البنكي"""
    serializer = BankTransferSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    payment = get_object_or_404(Payment, id=serializer.validated_data['payment_id'])
    receipt = serializer.validated_data['receipt']
    
    payment.bank_receipt = receipt
    payment.status = 'processing'
    payment.save()
    
    TransactionLog.objects.create(
        payment=payment,
        action='bank_transfer_upload',
        status='processing',
        response_data={'receipt_uploaded': True}
    )
    
    return Response({
        'status': 'processing',
        'message': 'تم رفع الإيصال بنجاح. سيتم مراجعته قريباً'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_payments(request):
    """الحصول على جميع مدفوعات المستخدم"""
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_detail(request, payment_id):
    """تفاصيل الدفع"""
    payment = get_object_or_404(Payment, id=payment_id, user=request.user)
    serializer = PaymentSerializer(payment)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_payments(request):
    """جميع المدفوعات للمشرفين"""
    payments = Payment.objects.all().order_by('-created_at')
    
    status_filter = request.GET.get('status')
    if status_filter:
        payments = payments.filter(status=status_filter)
    
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def verify_bank_transfer(request, payment_id):
    """التحقق من إيصال التحويل البنكي (للمشرف فقط)"""
    payment = get_object_or_404(Payment, id=payment_id)
    
    if payment.payment_method != 'bank':
        return Response({'error': 'هذه ليست معاملة تحويل بنكي'}, status=status.HTTP_400_BAD_REQUEST)
    
    payment.bank_receipt_verified = True
    payment.mark_as_completed()
    
    TransactionLog.objects.create(
        payment=payment,
        action='bank_transfer_verified',
        status='completed',
        response_data={'verified_by_admin': request.user.email}
    )
    
    return Response({
        'status': 'completed',
        'message': 'تم التحقق من التحويل البنكي بنجاح'
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def refund_payment(request, payment_id):
    """استرداد الدفع (للمشرف فقط)"""
    payment = get_object_or_404(Payment, id=payment_id)
    
    if payment.status != 'completed':
        return Response({'error': 'لا يمكن استرداد دفعة غير مكتملة'}, status=status.HTTP_400_BAD_REQUEST)
    
    payment.mark_as_refunded()
    
    # تحديث حالة الطلب
    payment.order.status = 'refunded'
    payment.order.save()
    
    TransactionLog.objects.create(
        payment=payment,
        action='refund',
        status='refunded',
        response_data={'refunded_by_admin': request.user.email}
    )
    
    return Response({
        'status': 'refunded',
        'message': 'تم استرداد الدفع بنجاح'
    })