from rest_framework import serializers
from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']

    def validate_primary_color(self, value):
        return self._validate_hex(value)

    def validate_secondary_color(self, value):
        return self._validate_hex(value)

    def validate_background_color(self, value):
        return self._validate_hex(value)

    def _validate_hex(self, value):
        import re
        if not re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', value):
            raise serializers.ValidationError('Color must be a valid hex code (e.g., #000000)')
        return value