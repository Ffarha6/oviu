from django.shortcuts import render
from django.views.decorators.http import require_GET
from django.core.exceptions import TemplateDoesNotExist


# ========== Test Views (للاختبار فقط) ==========
@require_GET
def test_order(request):
    """صفحة اختبار الطلبات - يمكن حذفها في الإنتاج"""
    try:
        return render(request, 'order_test.html')
    except TemplateDoesNotExist:
        return render(request, 'error.html', {'message': 'Test page not found'}, status=404)


# ========== Error Handlers ==========
def handler404(request, exception):
    """404 - صفحة غير موجودة"""
    return render(request, '404.html', {'exception': exception}, status=404)


def handler500(request):
    """500 - خطأ داخلي في الخادم"""
    return render(request, '500.html', status=500)


def handler403(request, exception):
    """403 - غير مصرح بالدخول"""
    return render(request, '403.html', {'exception': exception}, status=403)


def handler400(request, exception):
    """400 - طلب غير صحيح"""
    return render(request, '400.html', {'exception': exception}, status=400)