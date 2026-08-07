from modeltranslation.translator import register, TranslationOptions
from .models import Product


@register(Product)
class ProductTranslationOptions(TranslationOptions):
    """
    Translation options for Product model.

    ✅ بعد إضافة MODELTRANSLATION_LANGUAGES = ('ar',) في settings.py،
    اللغة الوحيدة اللي بتتخزن فعليًا هي العربي (name_ar, description_ar...)،
    فمفيش داعي لأي إعدادات fallback بين لغتين لأنه مفيش غير لغة واحدة أصلاً.
    """
    fields = (
        'name',
        'description',
        'meta_title',
        'meta_description',
    )