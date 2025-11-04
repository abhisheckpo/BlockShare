from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('username', 'email')
    readonly_fields = ('created_at', 'updated_at', 'last_login')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('username', 'email', 'password')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Important Dates', {
            'fields': ('created_at', 'updated_at', 'last_login')
        }),
    )

