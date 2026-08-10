from django.apps import AppConfig


class TryOnConfig(AppConfig):  # ✅ اسم الكلاس
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'try_on'  # ✅ اسم التطبيق مع underscore
    verbose_name = 'تجربة النظارات الافتراضية'