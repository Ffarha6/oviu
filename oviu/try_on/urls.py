from django.urls import path
from . import views

app_name = 'tryon'

urlpatterns = [
    # ========== الصفحات ==========
    path('', views.tryon_page, name='tryon_page'),

    # ========== Upload ==========
    path('upload/', views.upload_image, name='upload_image'),
    path('process-image/<int:image_id>/', views.process_image, name='process_image'),

    # ========== Video (معلق مؤقتاً - يتطلب WebRTC) ==========
    # path('video-process/', views.process_video_frame, name='process_video_frame'),
    # path('video-stream/', views.video_stream, name='video_stream'),

    # ========== اختيار النظارة ==========
    path('select-glasses/', views.select_glasses, name='select_glasses'),

    # ========== النتائج ==========
    path('save-result/', views.save_tryon_result, name='save_result'),
    path('my-results/', views.my_tryon_results, name='my_results'),
    path('result/<int:result_id>/', views.result_detail, name='result_detail'),
    path('delete-result/<int:result_id>/', views.delete_result, name='delete_result'),

    # ========== Sessions ==========
    path('sessions/', views.user_sessions, name='user_sessions'),
    path('session/<int:session_id>/', views.session_detail, name='session_detail'),

    # ========== API ==========
    path('api/sessions/', views.api_sessions, name='api_sessions'),
    path('api/upload/', views.upload_image, name='api_upload'),  # ✅ تم التعديل: api_upload_image → upload_image
    path('api/process/<int:image_id>/<int:product_id>/', views.apply_glasses, name='api_process'),  # ✅ تم التعديل: api_process_tryon → apply_glasses
    path('api/products/', views.api_products, name='api_products'),
]