from django.urls import path
from .views import MyPlantView

urlpatterns = [
    path('me/', MyPlantView.as_view(), name='plant-me'),
]