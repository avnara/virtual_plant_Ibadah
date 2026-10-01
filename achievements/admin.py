from django.contrib import admin
from .models import Achievement, HarvestLog, UserAchievement

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('kode', 'nama')
    search_fields = ('kode', 'nama')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'diperoleh_saat')
    list_filter = ('achievement',)

@admin.register(HarvestLog)
class HarvestLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'tanggal_panen')