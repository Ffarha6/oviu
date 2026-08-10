from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import SiteSettings
from .serializers import SiteSettingsSerializer


@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_site_settings(request):
    """قراءة وتعديل إعدادات الموقع (Singleton)."""
    settings_obj = SiteSettings.load()

    if request.method == 'GET':
        return Response(
            SiteSettingsSerializer(settings_obj, context={'request': request}).data
        )

    # PATCH — تحديث جزئي، أي كارت يبعت الحقول بتاعته بس
    serializer = SiteSettingsSerializer(
        settings_obj,
        data=request.data,
        partial=True,
        context={'request': request}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)