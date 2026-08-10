from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('register/',       views.register,      name='register'),
    path('verify-email/',   views.verify_email,  name='verify-email'),
    path('login/',          views.login,         name='login'),
    path('logout/',         views.logout_view,   name='logout'),

    # User Profile
    path('user/',           views.get_user,      name='get-user'),
    path('profile/',        views.update_profile, name='update-profile'),

    # Password Management
    path('change-password/', views.change_password, name='change-password'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('verify-reset-code/', views.verify_reset_code, name='verify-reset-code'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('reset-password/',  views.reset_password,  name='reset-password'),
    path("api/profile/", views.profile_api, name="profile_api"),
    # OAuth callback — بعد جوجل/فيسبوك بيعملوا redirect هنا
    path('oauth/complete/',  views.OAuthRedirectView.as_view(), name='oauth-complete'),

    # ✅ لوحة تحكم الأدمن — محمية بصلاحية IsAdminUser (is_staff) في الـ view نفسه
    #path('admin/dashboard/', views.admin_dashboard, name='admin-dashboard'),

    # ✅ جديد: عناوين الشحن المتعددة (بدل حقل address الواحد على اليوزر)
    path('addresses/',              views.addresses_list_create, name='addresses-list-create'),
    path('addresses/<int:address_id>/', views.address_detail,    name='address-detail'),
]