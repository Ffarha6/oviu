import requests
from ..models import ChatSession, ChatMessage
from products.models import Product
from orders.models import Order


# ========== FAQ Responses (بدون AI) ==========
FAQ_RESPONSES = {
    # الشحن والتوصيل
    "شحن": "🚚 الشحن بياخد من 3 لـ 5 أيام عمل. التوصيل مجاني للطلبات فوق 500 جنيه.",
    "توصيل": "🚚 نوصل لكل محافظات مصر. التوصيل خلال 3-5 أيام عمل.",
    " delivery": "🚚 Shipping takes 3-5 business days. Free shipping on orders over 500 EGP.",
    
    # الاستبدال والإرجاع
    "استبدال": "🔄 تقدر تستبدل المنتج خلال 14 يوم من الاستلام بشرط أن يكون بحالة جديدة.",
    "إرجاع": "🔄 سياسة الإرجاع 14 يوم. تواصل مع خدمة العملاء لمساعدتك.",
    "مرتجع": "💰 يتم استرداد المبلغ خلال 7-14 يوم بعد استلام المنتج.",
    
    # الدفع
    "دفع": "💳 تقدر تدفع كاش عند الاستلام، أو ببطاقة ائتمان، أو تحويل بنكي.",
    "payment": "💳 Cash on delivery, credit card, or bank transfer available.",
    "كاش": "💵 الدفع كاش عند الاستلام متوفر لكل محافظات مصر.",
    
    # الضمان
    "ضمان": "🛡️ جميع المنتجات عليها ضمان سنة ضد عيوب الصناعة.",
    "warranty": "🛡️ 1-year warranty against manufacturing defects.",
    
    # المنتجات
    "نظارة طبية": "👓 عندنا تشكيلة واسعة من النظارات الطبية بأحدث الموديلات.",
    "نظارة شمس": "🕶️ النظارات الشمسية متوفرة بدرجات حماية مختلفة UV400.",
    "عدسات": "👁️ نوفر خدمة تركيب العدسات الطبية بجميع أنواعها.",
    
    # التواصل
    "ساعات العمل": "🕘 السبت للخميس: 10ص - 10م، الجمعة: 2م - 10م",
    "العنوان": "📍 فروعنا في القاهرة، الإسكندرية، والجيزة.",
    
    # عام
    "شكرا": "🙏 شكراً لك! دايماً في خدمتك.",
    "thank": "🙏 You're welcome! Always here to help."
}


def get_faq_response(user_message):
    """التحقق من الأسئلة الشائعة والرد بسرعة (بدون AI)"""
    user_message_lower = user_message.lower()
    
    for keyword, response in FAQ_RESPONSES.items():
        if keyword in user_message_lower:
            return response
    
    return None


def search_products_by_keyword(keyword):
    """البحث عن منتجات حسب كلمة مفتاحية"""
    products = Product.objects.filter(
        name__icontains=keyword,
        is_active=True
    )[:5]
    return products


def format_product_message(products):
    """تنسيق رسالة المنتجات مع صور"""
    if not products:
        return None
    
    message = "🔍 **المنتجات اللي طلبتها:**\n\n"
    for p in products:
        price = p.get_current_price()
        message += f"**{p.name}**\n"
        message += f"💰 {price} ج.م\n"
        message += f"[عرض المنتج]({p.get_absolute_url()})\n\n"
    message += "✨ تقدر تشوف التفاصيل أكتر من خلال المتجر"
    return message


def get_order_status(user):
    """جلب حالة آخر طلب للمستخدم"""
    if not user or not user.is_authenticated:
        return "🔐 يرجى تسجيل الدخول أولاً لعرض حالة طلبك."
    
    last_order = Order.objects.filter(user=user).order_by('-created_at').first()
    if not last_order:
        return "📭 ليس لديك أي طلبات حالياً. جرب تتسوق دلوقتي!"
    
    status_map = {
        'pending': '⏳ قيد المراجعة',
        'confirmed': '✅ تم التأكيد',
        'preparing': '🔧 جاري التجهيز',
        'shipped': '🚚 تم الشحن',
        'delivered': '📦 تم التسليم',
        'cancelled': '❌ ملغي'
    }
    
    status_text = status_map.get(last_order.status, last_order.status)
    return f"📋 **طلب رقم #{last_order.id}**\n📅 التاريخ: {last_order.created_at.strftime('%Y-%m-%d')}\n🚦 الحالة: {status_text}\n💰 الإجمالي: {last_order.total_price} ج.م"


def get_or_create_session(request):
    """الحصول على جلسة المحادثة أو إنشائها"""
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    user = request.user if request.user.is_authenticated else None
    
    session, created = ChatSession.objects.get_or_create(
        session_key=session_key,
        defaults={'user': user}
    )
    
    if not created and session.user is None and user is not None:
        session.user = user
        session.save()
    
    return session


def save_message(session, is_user, message):
    """حفظ رسالة في قاعدة البيانات"""
    ChatMessage.objects.create(
        session=session,
        is_user=is_user,
        message=message
    )


def get_chat_response(user_message, session):
    """الحصول على رد مع دعم المنتجات والطلبات"""
    
    user_message_lower = user_message.lower()
    user = session.user if session.user else None
    
    # ✅ 1. البحث عن منتجات
    search_keywords = ["عايز", "دور", "بحث", "product", "نظارة", "شمسي", "طبية", "عدسة", "نضارة"]
    if any(word in user_message_lower for word in search_keywords):
        # استخراج كلمة البحث
        search_term = user_message
        for kw in search_keywords:
            search_term = search_term.replace(kw, "")
        
        products = search_products_by_keyword(search_term.strip() or user_message)
        if products:
            response = format_product_message(products)
            save_message(session, True, user_message)
            save_message(session, False, response)
            return response
        else:
            response = "🔍 لم أجد منتجات تطابق بحثك. جرب كلمات مختلفة أو تصفح المتجر يدوياً.\n\nhttps://viona.com/shop/"
            save_message(session, True, user_message)
            save_message(session, False, response)
            return response
    
    # ✅ 2. التحقق من حالة الطلب
    order_keywords = ["حالة طلبي", "وصل طلبي", "order status", "طلبي وصل", "طلبى", "اوردر"]
    if any(word in user_message_lower for word in order_keywords):
        response = get_order_status(user)
        save_message(session, True, user_message)
        save_message(session, False, response)
        return response
    
    # ✅ 3. الأسئلة الشائعة (FAQ)
    faq_response = get_faq_response(user_message)
    if faq_response:
        save_message(session, True, user_message)
        save_message(session, False, faq_response)
        return faq_response
    
    # ✅ 4. AI للأسئلة المعقدة
    recent_messages = session.messages.order_by('-created_at')[:5]
    context = ""
    for msg in reversed(recent_messages):
        role = "المستخدم" if msg.is_user else "البوت"
        context += f"{role}: {msg.message}\n"
    
    prompt = f"""أنت مساعد ودود لمتجر VIONA للنظارات.
    
سجل المحادثة السابقة:
{context}

المستخدم: {user_message}

البوت:"""
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:1b",
                "prompt": prompt,
                "stream": False,
                "temperature": 0.7,
                "max_tokens": 150
            },
            timeout=60
        )
        
        if response.status_code == 200:
            reply = response.json().get("response", "عذراً، حدث خطأ")
            save_message(session, True, user_message)
            save_message(session, False, reply)
            return reply
        else:
            error_msg = f"عذراً، حدث خطأ: {response.status_code}"
            save_message(session, True, user_message)
            save_message(session, False, error_msg)
            return error_msg
            
    except Exception as e:
        error_msg = f"عذراً، حدث خطأ في الاتصال: {str(e)}"
        save_message(session, True, user_message)
        save_message(session, False, error_msg)
        return error_msg