# translation.py
from modeltranslation.translator import register, TranslationOptions
from .models import Product


@register(Product)
class ProductTranslationOptions(TranslationOptions):
    """
    Translation options for Product model.
    Only translatable text fields are included.
    """
    # الحقول اللي هتترجم (فقط الحقول النصية الحرة)
    fields = (
        'name',
        'description',
        'meta_title',
        'meta_description',
    )
    
    # منع الترجمة الفارغة (يسمح بترك الحقول فارغة)
    blank_translation = True  # ✅ تم التعديل
    
    # ✅ تم التعديل: استخدام fallback_values بدلاً من fallback_language
