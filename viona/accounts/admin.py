from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [
        'username', 
        'email', 
        'phone',
        'first_name', 
        'last_name', 
        'is_staff',
        'email_verified'
    ]
    
    list_filter = [
        'is_staff', 
        'is_active', 
        'email_verified',
        'date_joined'
    ]
    
    search_fields = [
        'username', 
        'email', 
        'phone',
        'first_name', 
        'last_name'
    ]
    
    readonly_fields = ['date_joined', 'last_login']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': (
            'first_name', 'last_name', 'email', 'phone', 'address', 'date_of_birth'
        )}),
        (_('Permissions'), {'fields': (
            'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'
        )}),
        (_('Verification'), {'fields': (
            'email_verified', 'verification_code'
        )}),
        (_('Eyewear Specific'), {'fields': (
            'prescription_details',
        )}),
        (_('Important dates'), {'fields': (
            'last_login', 'date_joined'
        )}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone', 'password1', 'password2'),
        }),
    )
    
    ordering = ['-date_joined']