from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
from django.views.decorators.http import require_http_methods

import cv2
import json
import io
import base64
from PIL import Image

from .models import FaceMeasurement, TryOnSession, TryOnResult, TryOnImage
from products.models import Product

# =============================
# MediaPipe (مع محاولة آمنة)
# =============================
try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh()
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("⚠️ MediaPipe not installed. Try-on features will be limited.")


# =============================
# صفحات
# =============================

@login_required
def tryon_page(request):
    products = Product.objects.filter(is_active=True)
    return render(request, 'tryon/try_on.html', {'products': products})


# =============================
# Upload Image - ✅ تم التعديل
# =============================

@csrf_exempt
@require_http_methods(['POST'])
def upload_image(request):
    """رفع صورة لتجربة النظارات"""
    image = request.FILES.get('image')
    glasses_product_id = request.POST.get('glasses_product_id')
    
    if not image:
        return JsonResponse({'error': 'No image uploaded'}, status=400)
    
    # إنشاء جلسة جديدة أو استخدام الموجودة
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    # ✅ لو الزائر مش مسجل دخول، request.user بيبقى AnonymousUser مش None،
    # وده كان بيكسر حفظ الجلسة لأن الحقل user بيقبل User حقيقي أو None بس
    session, created = TryOnSession.objects.get_or_create(
        session_key=session_key,
        defaults={'user': request.user if request.user.is_authenticated else None}
    )
    
    # إذا كانت الجلسة موجودة بدون user، قم بتحديثها (لو دلوقتي بقى مسجل دخول)
    if not created and session.user is None and request.user.is_authenticated:
        session.user = request.user
        session.save()
    
    # إنشاء الصورة
    img = TryOnImage.objects.create(
        session=session,
        image=image,
        glasses_product_id=glasses_product_id
    )
    
    return JsonResponse({
        'image_id': img.id,
        'session_id': session.id,
        'message': 'Image uploaded successfully'
    })


# =============================
# Process Image - ✅ تم التعديل
# =============================

def process_image(request, image_id):
    """معالجة الصورة باستخدام MediaPipe"""
    session_key = request.session.session_key
    if not session_key:
        return JsonResponse({'error': 'الصورة غير موجودة'}, status=404)
    image_obj = get_object_or_404(TryOnImage, id=image_id, session__session_key=session_key)
    
    if not MEDIAPIPE_AVAILABLE:
        return JsonResponse({'error': 'AI processing not available'}, status=501)
    
    try:
        img = cv2.imread(image_obj.image.path)
        if img is None:
            return JsonResponse({'error': 'Image not found'}, status=404)
        
        # معالجة الوجه باستخدام MediaPipe
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_img)
        
        if not results.multi_face_landmarks:
            return JsonResponse({'error': 'No face detected'}, status=400)
        
        # استخراج القياسات
        landmarks = results.multi_face_landmarks[0]
        # ... حساب القياسات ...
        
        return JsonResponse({
            'status': 'processed',
            'face_detected': True,
            'landmarks_count': len(landmarks.landmark)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# =============================
# Try-On Logic - ✅ تم التعديل
# =============================

@csrf_exempt
@require_http_methods(['POST'])
def apply_glasses(request, image_id, product_id):  # التغيير هنا فقط
    session_key = request.session.session_key
    if not session_key:
        return JsonResponse({'error': 'الصورة غير موجودة'}, status=404)
    image_obj = get_object_or_404(TryOnImage, id=image_id, session__session_key=session_key)
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    result = TryOnResult.objects.create(
        session=image_obj.session,
        original_image=image_obj,
        product=product,
        confidence_score=0.95
    )
    
    return JsonResponse({
        'result_id': result.id,
        'message': 'Glasses applied successfully'
    })

# =============================
# Select Glasses - ✅ تم الإضافة
# =============================

@csrf_exempt
@require_http_methods(['POST'])
def select_glasses(request):
    """اختيار نظارة للتجربة"""
    data = json.loads(request.body)
    product_id = data.get('product_id')
    image_id = data.get('image_id')
    session_key = request.session.session_key
    
    try:
        if not session_key:
            raise TryOnImage.DoesNotExist
        product = Product.objects.get(id=product_id, is_active=True)
        image = TryOnImage.objects.get(id=image_id, session__session_key=session_key)
        
        # حفظ المنتج المختار مع الصورة
        image.glasses_product = product
        image.save()
        
        return JsonResponse({
            'status': 'success',
            'product_id': product.id,
            'product_name': product.name,
            'image_id': image.id
        })
    except Product.DoesNotExist:
        return JsonResponse({'error': 'المنتج غير موجود'}, status=404)
    except TryOnImage.DoesNotExist:
        return JsonResponse({'error': 'الصورة غير موجودة'}, status=404)


# =============================
# Save Result - ✅ تم الإضافة
# =============================

@csrf_exempt
@require_http_methods(['POST'])
def save_tryon_result(request):
    """حفظ نتيجة تجربة النظارة"""
    data = json.loads(request.body)
    image_id = data.get('image_id')
    product_id = data.get('product_id')
    processed_image_data = data.get('processed_image')
    session_key = request.session.session_key
    
    try:
        if not session_key:
            raise TryOnImage.DoesNotExist
        image = TryOnImage.objects.get(id=image_id, session__session_key=session_key)
        product = Product.objects.get(id=product_id, is_active=True)
        
        # حفظ الصورة المعالجة (إذا وجدت)
        processed_image = None
        if processed_image_data:
            format, imgstr = processed_image_data.split(';base64,')
            ext = format.split('/')[-1]
            processed_image = ContentFile(base64.b64decode(imgstr), name=f"result_{image_id}.{ext}")
        
        # إنشاء نتيجة جديدة
        result = TryOnResult.objects.create(
            session=image.session,
            original_image=image,
            product=product,
            processed_image=processed_image,
            confidence_score=0.95
        )
        
        return JsonResponse({
            'status': 'success',
            'result_id': result.id,
            'message': 'تم حفظ النتيجة بنجاح'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# =============================
# Video Processing (معلق مؤقتاً)
# =============================

@csrf_exempt
@login_required
def process_video_frame(request):
    """معالجة فيديو (معلق مؤقتاً)"""
    return JsonResponse({'status': 'Video processing coming soon'}, status=501)


def video_stream(request):
    """بث الفيديو (معلق مؤقتاً)"""
    return JsonResponse({'status': 'Video stream coming soon'}, status=501)


# =============================
# Results
# =============================

@login_required
def my_tryon_results(request):
    results = TryOnResult.objects.filter(session__user=request.user)
    return render(request, 'tryon/my_results.html', {'results': results})


@login_required
def result_detail(request, result_id):
    result = get_object_or_404(TryOnResult, id=result_id, session__user=request.user)
    return render(request, 'tryon/result_detail.html', {'result': result})


@login_required
def delete_result(request, result_id):
    result = get_object_or_404(TryOnResult, id=result_id, session__user=request.user)
    result.delete()
    return JsonResponse({'status': 'deleted'})


# =============================
# Sessions
# =============================

@login_required
def user_sessions(request):
    sessions = TryOnSession.objects.filter(user=request.user)
    return render(request, 'tryon/sessions.html', {'sessions': sessions})


@login_required
def session_detail(request, session_id):
    session = get_object_or_404(TryOnSession, id=session_id, user=request.user)
    return render(request, 'tryon/session_detail.html', {'session': session})


# =============================
# API - ✅ تم التعديل
# =============================

@login_required
def api_sessions(request):
    sessions = TryOnSession.objects.filter(user=request.user)
    data = [{'id': s.id, 'created_at': s.created_at} for s in sessions]
    return JsonResponse(data, safe=False)


def api_products(request):
    # ✅ الصورة مش حقل مباشر على Product؛ لازم نعدي عن طريق أول لون للمنتج،
    # وبعدين ناخد الصورة الأساسية بتاعة اللون ده (أو أول صورة لو مفيش أساسية)
    products = Product.objects.filter(is_active=True).prefetch_related('colors__images')
    data = []
    for p in products:
        first_color = p.colors.first()
        image_url = None
        if first_color:
            img = first_color.primary_image or first_color.images.first()
            if img and img.image:
                image_url = img.image.url

        data.append({
            'id': p.id,
            'name': p.name,
            'price': float(p.get_current_price()),
            'image_url': image_url,
            'category': p.product_type,
            'color': first_color.name if first_color else '',
        })
    return JsonResponse(data, safe=False)