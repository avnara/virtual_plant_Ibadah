from django.urls import path
from .views import TodayMissionsView, AnswerMissionView, PrayerTimesTodayView, WeeklyStatsView, MonthlyStatsView

urlpatterns = [
    path('today/', TodayMissionsView.as_view(), name='missions-today'),
    path('answer/', AnswerMissionView.as_view(), name='missions-answer'),
    path('prayer-times/', PrayerTimesTodayView.as_view(), name='prayer-times'),
       path('stats/weekly/', WeeklyStatsView.as_view(), name='stats-weekly'),
    path('stats/monthly/', MonthlyStatsView.as_view(), name='stats-monthly'),
]