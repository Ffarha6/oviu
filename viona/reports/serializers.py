from rest_framework import serializers
from .models import GeneratedReport


class GeneratedReportSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    type_display = serializers.ReadOnlyField(source='get_report_type_display')

    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'name', 'report_type', 'type_display', 'file_format',
            'file_url', 'date_from', 'date_to', 'created_at',
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return None