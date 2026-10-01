from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, MeView, LoginView, UpdateLocationView, MyStatsView, UpdateProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='login-refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('location/', UpdateLocationView.as_view(), name='update-location'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('stats/', MyStatsView.as_view(), name='my-stats'),
]