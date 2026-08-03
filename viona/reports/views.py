import io
from datetime import datetime, timedelta

from django.db.models import Sum, Count, F, DecimalField
from django.db.models.functions import TruncDate, Coalesce
from django.http import HttpResponse
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from orders.models import Order, OrderItem
from products.models import Product
from payment.models import Payment
from accounts.models import User

from .models import GeneratedReport
from .serializers import GeneratedReportSerializer


# ═══════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════

def get_date_range(request):
    """
    بيقرأ start و end من الـ query params (YYYY-MM-DD).
    لو مش موجودين، بيرجع آخر 30 يوم افتراضيًا.
    """
    end_str = request.GET.get('end')
    start_str = request.GET.get('start')

    end = datetime.strptime(end_str, '%Y-%m-%d').date() if end_str else timezone.now().date()
    start = datetime.strptime(start_str, '%Y-%m-%d').date() if start_str else end - timedelta(days=30)

    return start, end


def previous_period(start, end):
    """نفس طول الفترة قبل start مباشرة، عشان نحسب نسبة التغيير"""
    length = (end - start).days + 1
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=length - 1)
    return prev_start, prev_end


def pct_change(current, previous):
    if not previous:
        return {"change": 0, "trend": "up"}
    change = ((current - previous) / previous) * 100
    return {"change": round(abs(change), 1), "trend": "up" if change >= 0 else "down"}


NON_CANCELLED = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered']


# ═══════════════════════════════════════════════════════════════════
# نظرة عامة — كروت الإحصائيات فوق صفحة التقارير
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def overview_stats(request):
    start, end = get_date_range(request)
    prev_start, prev_end = previous_period(start, end)

    def period_stats(p_start, p_end):
        orders = Order.objects.filter(created_at__date__range=[p_start, p_end])
        valid_orders = orders.exclude(status='cancelled')

        revenue = valid_orders.aggregate(v=Coalesce(Sum('total_price'), 0, output_field=DecimalField()))['v']
        orders_count = valid_orders.count()
        avg_order_value = (revenue / orders_count) if orders_count else 0

        returns = Payment.objects.filter(
            status='refunded', refunded_at__date__range=[p_start, p_end]
        ).aggregate(v=Coalesce(Sum('amount'), 0, output_field=DecimalField()))['v']

        return {
            "revenue": float(revenue),
            "orders_count": orders_count,
            "avg_order_value": float(avg_order_value),
            "returns": float(returns),
        }

    current = period_stats(start, end)
    previous = period_stats(prev_start, prev_end)

    total_customers = User.objects.filter(
        is_staff=False, is_superuser=False, date_joined__date__lte=end
    ).count()
    prev_total_customers = User.objects.filter(
        is_staff=False, is_superuser=False, date_joined__date__lte=prev_end
    ).count()

    # ⚠️ لا يوجد تتبع فعلي لزوار الموقع في الباك دلوقتي.
    # بنستخدم هنا "نسبة الطلبات لعدد العملاء المسجلين" كمؤشر تقريبي بديل
    # (conversion proxy) لحد ما يتضاف نظام تتبع زيارات حقيقي (Google Analytics
    # أو موديل PageView مخصص). لو حابة نظام حقيقي قوليلي.
    conversion_rate = (current["orders_count"] / total_customers * 100) if total_customers else 0
    prev_conversion_rate = (previous["orders_count"] / prev_total_customers * 100) if prev_total_customers else 0

    data = {
        "total_revenue": current["revenue"],
        "total_orders": current["orders_count"],
        "total_customers": total_customers,
        "avg_order_value": round(current["avg_order_value"], 2),
        "returns": current["returns"],
        "conversion_rate": round(conversion_rate, 2),
        "changes": {
            "revenue": pct_change(current["revenue"], previous["revenue"]),
            "orders": pct_change(current["orders_count"], previous["orders_count"]),
            "customers": pct_change(total_customers, prev_total_customers),
            "avg_order_value": pct_change(current["avg_order_value"], previous["avg_order_value"]),
            "returns": pct_change(current["returns"], previous["returns"]),
            "conversion_rate": pct_change(conversion_rate, prev_conversion_rate),
        },
    }
    return Response(data)


# ═══════════════════════════════════════════════════════════════════
# نظرة عامة على المبيعات (جراف الإيرادات اليومي)
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def revenue_overview(request):
    start, end = get_date_range(request)

    rows = (
        Order.objects.filter(created_at__date__range=[start, end])
        .exclude(status='cancelled')
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(revenue=Sum('total_price'), orders=Count('id'))
        .order_by('day')
    )

    data = [
        {
            "date": r["day"].strftime('%Y-%m-%d'),
            "revenue": float(r["revenue"] or 0),
            "orders": r["orders"],
        }
        for r in rows
    ]
    return Response(data)


# ═══════════════════════════════════════════════════════════════════
# المبيعات حسب القناة
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def sales_by_channel(request):
    """
    ⚠️ يعتمد على حقل `channel` في موديل Order (راجع ملاحظات التركيب تحت).
    لو الحقل لسه مش مضاف، الـ endpoint هيرجع "website" لكل الطلبات.
    """
    start, end = get_date_range(request)

    has_channel_field = hasattr(Order, 'channel')
    if not has_channel_field:
        total = Order.objects.filter(created_at__date__range=[start, end]).exclude(status='cancelled') \
            .aggregate(v=Coalesce(Sum('total_price'), 0, output_field=DecimalField()))['v']
        return Response([{"label": "الموقع الإلكتروني", "value": float(total), "percent": 100}])

    rows = (
        Order.objects.filter(created_at__date__range=[start, end])
        .exclude(status='cancelled')
        .values('channel')
        .annotate(revenue=Sum('total_price'))
        .order_by('-revenue')
    )
    total = sum(float(r["revenue"] or 0) for r in rows) or 1
    labels = dict(Order.CHANNEL_CHOICES) if hasattr(Order, 'CHANNEL_CHOICES') else {}

    data = [
        {
            "label": labels.get(r["channel"], r["channel"]),
            "value": float(r["revenue"] or 0),
            "percent": round(float(r["revenue"] or 0) / total * 100, 1),
        }
        for r in rows
    ]
    return Response(data)


# ═══════════════════════════════════════════════════════════════════
# المبيعات حسب الفئة
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def sales_by_category(request):
    start, end = get_date_range(request)

    rows = (
        OrderItem.objects.filter(
            order__created_at__date__range=[start, end]
        )
        .exclude(order__status='cancelled')
        .values('product__product_type')
        .annotate(revenue=Sum(F('quantity') * F('price_at_time')))
        .order_by('-revenue')
    )

    total = sum(float(r["revenue"] or 0) for r in rows) or 1
    labels = dict(Product.PRODUCT_TYPES)

    data = [
        {
            "label": labels.get(r["product__product_type"], r["product__product_type"]),
            "value": float(r["revenue"] or 0),
            "percent": round(float(r["revenue"] or 0) / total * 100, 1),
        }
        for r in rows
    ]
    return Response(data)


# ═══════════════════════════════════════════════════════════════════
# الطلبات حسب الحالة
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def orders_by_status(request):
    start, end = get_date_range(request)

    rows = (
        Order.objects.filter(created_at__date__range=[start, end])
        .values('status')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    total = sum(r["count"] for r in rows) or 1
    labels = dict(Order.STATUS_CHOICES)

    data = [
        {
            "label": labels.get(r["status"], r["status"]),
            "status": r["status"],
            "count": r["count"],
            "percent": round(r["count"] / total * 100, 1),
        }
        for r in rows
    ]
    return Response({"total": total, "data": data})


# ═══════════════════════════════════════════════════════════════════
# الأكثر مبيعًا
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def top_selling_products(request):
    start, end = get_date_range(request)
    limit = int(request.GET.get('limit', 10))

    rows = (
        OrderItem.objects.filter(order__created_at__date__range=[start, end])
        .exclude(order__status='cancelled')
        .values('product__id', 'product__name', 'product__sku')
        .annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('price_at_time')),
        )
        .order_by('-quantity_sold')[:limit]
    )

    data = [
        {
            "id": r["product__id"],
            "name": r["product__name"],
            "sku": r["product__sku"],
            "quantity_sold": r["quantity_sold"],
            "revenue": float(r["revenue"] or 0),
        }
        for r in rows
    ]
    return Response(data)


# ═══════════════════════════════════════════════════════════════════
# ملخص الإيرادات (جدول - يومي/أسبوعي/شهري)
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def revenue_summary(request):
    start, end = get_date_range(request)

    rows = (
        Order.objects.filter(created_at__date__range=[start, end])
        .exclude(status='cancelled')
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(
            orders_count=Count('id'),
            revenue=Sum('total_price'),
        )
        .order_by('-day')
    )

    refunds_by_day = {
        r["day"]: r["v"]
        for r in Payment.objects.filter(status='refunded', refunded_at__date__range=[start, end])
        .annotate(day=TruncDate('refunded_at'))
        .values('day')
        .annotate(v=Sum('amount'))
    }

    data = []
    for r in rows:
        revenue = float(r["revenue"] or 0)
        refunds = float(refunds_by_day.get(r["day"], 0))
        data.append({
            "date": r["day"].strftime('%Y-%m-%d'),
            "orders_count": r["orders_count"],
            "revenue": revenue,
            "refunds": refunds,
            "net_revenue": revenue - refunds,
        })

    return Response(data)


# ═══════════════════════════════════════════════════════════════════
# سجل التقارير المُصدَّرة (أحدث التقارير)
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def reports_history(request):
    reports = GeneratedReport.objects.all()[:20]
    serializer = GeneratedReportSerializer(reports, many=True, context={'request': request})
    return Response(serializer.data)


# ═══════════════════════════════════════════════════════════════════
# تصدير تقرير (Excel أو PDF) — بيولد الملف، يسجله في التاريخ، وينزّله فورًا
# ═══════════════════════════════════════════════════════════════════

REPORT_TYPE_LABELS = dict(GeneratedReport.REPORT_TYPES)


def _build_rows_for_report(report_type, start, end):
    """بيرجع (headers, rows) حسب نوع التقرير المطلوب"""
    if report_type == 'orders':
        qs = Order.objects.filter(created_at__date__range=[start, end]).select_related('user').order_by('-created_at')
        headers = ['رقم الطلب', 'العميل', 'الحالة', 'طريقة الدفع', 'الإجمالي', 'التاريخ']
        rows = [
            [o.id, o.user.email, o.get_status_display(), o.get_payment_method_display(),
             float(o.total_price), o.created_at.strftime('%Y-%m-%d %H:%M')]
            for o in qs
        ]
        return headers, rows

    if report_type == 'customers':
        qs = User.objects.filter(is_staff=False, date_joined__date__range=[start, end]).order_by('-date_joined')
        headers = ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'تاريخ التسجيل']
        rows = [
            [u.get_full_name(), u.email, u.phone or '-', u.date_joined.strftime('%Y-%m-%d')]
            for u in qs
        ]
        return headers, rows

    if report_type == 'products':
        rows_data = (
            OrderItem.objects.filter(order__created_at__date__range=[start, end])
            .exclude(order__status='cancelled')
            .values('product__name', 'product__sku')
            .annotate(quantity_sold=Sum('quantity'), revenue=Sum(F('quantity') * F('price_at_time')))
            .order_by('-quantity_sold')
        )
        headers = ['المنتج', 'SKU', 'الكمية المباعة', 'الإيرادات']
        rows = [
            [r['product__name'], r['product__sku'], r['quantity_sold'], float(r['revenue'] or 0)]
            for r in rows_data
        ]
        return headers, rows

    # 'overview' / 'sales' / default → ملخص إيرادات يومي
    rows_data = (
        Order.objects.filter(created_at__date__range=[start, end])
        .exclude(status='cancelled')
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(orders_count=Count('id'), revenue=Sum('total_price'))
        .order_by('day')
    )
    headers = ['التاريخ', 'عدد الطلبات', 'الإيرادات']
    rows = [[r['day'].strftime('%Y-%m-%d'), r['orders_count'], float(r['revenue'] or 0)] for r in rows_data]
    return headers, rows


def _generate_xlsx(headers, rows, title):
    from openpyxl import Workbook
    from openpyxl.styles import Font

    wb = Workbook()
    ws = wb.active
    ws.title = title[:31]

    ws.append(headers)
    for cell in ws[1]:
        cell.font = Font(bold=True)

    for row in rows:
        ws.append(row)

    for col in ws.columns:
        max_len = max((len(str(c.value)) for c in col if c.value is not None), default=10)
        ws.column_dimensions[col[0].column_letter].width = max_len + 4

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def _generate_pdf(headers, rows, title):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()

    elements = [Paragraph(title, styles['Title']), Spacer(1, 16)]

    table_data = [headers] + [[str(c) for c in row] for row in rows]
    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D9A066')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7F2EE')]),
    ]))
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    return buffer


@api_view(['POST'])
@permission_classes([IsAdminUser])
def export_report(request):
    """
    body: { "report_type": "overview"|"sales"|"orders"|"customers"|"products",
            "format": "xlsx"|"pdf", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }
    """
    report_type = request.data.get('report_type', 'overview')
    file_format = request.data.get('format', 'xlsx')

    if report_type not in dict(GeneratedReport.REPORT_TYPES):
        return Response({"error": "نوع تقرير غير صالح"}, status=status.HTTP_400_BAD_REQUEST)
    if file_format not in ['xlsx', 'pdf']:
        return Response({"error": "صيغة غير صالحة"}, status=status.HTTP_400_BAD_REQUEST)

    start, end = get_date_range(request)
    title = f"تقرير {REPORT_TYPE_LABELS[report_type]} - {start} إلى {end}"
    headers, rows = _build_rows_for_report(report_type, start, end)

    if file_format == 'xlsx':
        buffer = _generate_xlsx(headers, rows, title)
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"{report_type}_{start}_{end}.xlsx"
    else:
        buffer = _generate_pdf(headers, rows, title)
        content_type = 'application/pdf'
        filename = f"{report_type}_{start}_{end}.pdf"

    from django.core.files.base import ContentFile
    report = GeneratedReport.objects.create(
        name=title,
        report_type=report_type,
        file_format=file_format,
        date_from=start,
        date_to=end,
        created_by=request.user,
    )
    report.file.save(filename, ContentFile(buffer.getvalue()))

    response = HttpResponse(buffer.getvalue(), content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response