from django.contrib import admin
from .models import PrayerMission, DalilReminder, DailyMissionLog

@admin.register(PrayerMission)
class PrayerMissionAdmin(admin.ModelAdmin):
    list_display = ('nama', 'poin_reward')

@admin.register(DalilReminder)
class DalilReminderAdmin(admin.ModelAdmin):
    list_display = ('sumber', 'terjemahan')

@admin.register(DailyMissionLog)
class DailyMissionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'mission', 'tanggal', 'status', 'alasan', 'poin_didapat')
    list_filter = ('status', 'tanggal', 'mission')