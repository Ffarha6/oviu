import os
from pathlib import Path
import dj_database_url
from django.utils.translation import gettext_lazy as _

BASE_DIR = Path(__file__).resolve().parent.parent

# ========== CORE ==========
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-your-real-key-here')
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = [
    'viona.azurewebsites.net',
    'viona.com',
    'www.viona.com',
    'localhost',
    '127.0.0.1',
    '.onrender.com',
    'oviu-production.up.railway.app',

]

# ========== APPS ==========
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    'nested_admin',
    'jazzmin',
    'admin_interface',
    'colorfield',
    'modeltranslation',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',

    'accounts',
    'products',
    'orders',
    'try_on',
    'cart',
    'payment',
    'coupons',
    'wishlist',
    'reviews',
    'chatbot',
]

# ========== JAZZMIN ==========
JAZZMIN_SETTINGS = {
    "site_title": "Viona Admin",
    "site_header": "Viona Dashboard",
    "welcome_sign": "Welcome Admin 👋",
    "site_brand": "Viona",
    "topmenu_links": [
        {"name": "Home", "url": "/", "permissions": ["auth.view_user"]},
    ],
    "icons": {
        "auth.user": "fas fa-user",
        "auth.group": "fas fa-users",
        "orders.order": "fas fa-shopping-cart",
        "products.product": "fas fa-box",
    },
    "show_sidebar": True,
    "navigation_expanded": True,
}

# ========== REST FRAMEWORK ==========
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'user': '5000/hour',
        'login': '20/minute',
    },
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# ========== MIDDLEWARE ==========
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',          # ← مرة واحدة بس وفوق كل حاجة
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# ========== INTERNATIONALIZATION ==========
LANGUAGES = (
    ('ar', _('Arabic')),
    ('en', _('English')),
)
USE_I18N = True
LANGUAGE_CODE = 'ar-eg'
TIME_ZONE = 'Africa/Cairo'
USE_TZ = True
ROOT_URLCONF = 'viona.urls'

# ========== TEMPLATES ==========
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'viona.wsgi.application'

# ========== DATABASE ==========
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'accounts.User'

# ========== PASSWORD VALIDATION ==========
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ========== STATIC & MEDIA FILES ==========
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========== CORS ==========
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://oviu.vercel.app",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

CSRF_TRUSTED_ORIGINS = [
    'https://viona.azurewebsites.net',
    'https://www.viona.com',
    'https://oviu.vercel.app',
    'https://*.vercel.app',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# ========== EMAIL ==========
# ✅ فعّلنا SMTP حقيقي عن طريق جيميل بدل الـ Console Backend، عشان الإيميلات
# (كود التفعيل + رابط استعادة كلمة المرور) توصل فعليًا لصندوق الوارد.
#
# ⚠️ ملحوظة أمان: القيم دي (خصوصًا EMAIL_HOST_PASSWORD) متحطة هنا مباشرة عشان
# تشتغل بسرعة في التطوير المحلي بس. لو الملف ده هيترفع على GitHub أو أي مكان
# عام، لازم تتنقل لمتغيرات بيئة (environment variables / ملف .env) بدل ما تفضل
# مكتوبة صراحة في الكود، عشان محدش يقدر يشوف الـ App Password بتاعك.
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
SERVER_EMAIL = EMAIL_HOST_USER

# لو حبيتي ترجعي لوضع التطوير (يطبع في التيرمنال بدل ما يبعت فعليًا)، شيلي
# السطور اللي فوق وارجعي للسطر ده:
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ========== SECURITY ==========
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
ADMIN_URL = os.environ.get('ADMIN_URL', 'admin-secret-viona')

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True' and not DEBUG
SESSION_COOKIE_SECURE = not DEBUG and os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'
CSRF_COOKIE_SECURE = not DEBUG and os.environ.get('CSRF_COOKIE_SECURE', 'False') == 'True'
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SESSION_COOKIE_AGE = 86400
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"

SILENCED_SYSTEM_CHECKS = ["security.W019"]

# ========== AUTHENTICATION & ALLAUTH ==========
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'none'

SOCIALACCOUNT_ADAPTER = 'accounts.adapters.CustomSocialAccountAdapter'
ACCOUNT_ADAPTER = 'accounts.adapters.CustomAccountAdapter'

SITE_ID = 2

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'OAUTH_PKCE_ENABLED': True,
    },
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'FIELDS': ['id', 'email', 'name', 'first_name', 'last_name'],
        'EXCHANGE_TOKEN': True,
        'VERIFIED_EMAIL': False,
    },

    
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'FIELDS': ['id', 'email', 'name', 'first_name', 'last_name'],
        'EXCHANGE_TOKEN': True,
        'VERIFIED_EMAIL': False,
        'APP': {
            'client_id': os.environ.get('FACEBOOK_APP_ID', ''),
            'secret': os.environ.get('FACEBOOK_SECRET', ''),
        }
    },
}

# بعد ما allauth يخلص يروح لـ OAuthRedirectView
LOGIN_REDIRECT_URL = '/api/auth/oauth/complete/'
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'http'

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

# ========== CACHE ==========
REDIS_URL = os.environ.get('REDIS_URL')

if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }

# ========== LOGGING ==========
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': LOGS_DIR / 'django_errors.log',
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}