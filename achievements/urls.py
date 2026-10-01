from django.urls import path
from .views import HarvestView, HarvestHistoryView,  MyAchievementsView

urlpatterns = [
    path('harvest/', HarvestView.as_view(), name='harvest'),
    path('history/', HarvestHistoryView.as_view(), name='harvest-history'),
    path('list/', MyAchievementsView.as_view(), name='achievement-list'),
]