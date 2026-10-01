from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Info Tambahan', {'fields': ('gender', 'provinsi', 'display_name', 'foto_profil')}),
    )
    list_display = ('username', 'display_name', 'gender', 'provinsi', 'is_staff')


admin.site.register(User, CustomUserAdmin)