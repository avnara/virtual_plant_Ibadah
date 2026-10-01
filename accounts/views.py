from datetime import timedelta
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView

from missions.models import DailyMissionLog
from plants.models import Plant

# Import semua serializer yang digunakan
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    UpdateLocationSerializer,
    UpdateProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        return {'request': self.request}


class LoginView(TokenObtainPairView):
    pass


class UpdateLocationView(generics.UpdateAPIView):
    serializer_class = UpdateLocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UpdateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        return {'request': self.request}


class MyStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        plant, _ = Plant.objects.get_or_create(user=user)

        hari_aktif = DailyMissionLog.objects.filter(
            user=user, status='selesai'
        ).values('tanggal').distinct().count()

        streak = 0
        cursor = timezone.localdate()
        while DailyMissionLog.objects.filter(user=user, tanggal=cursor, status='selesai').exists():
            streak += 1
            cursor -= timedelta(days=1)

        return Response({
            'hari_aktif': hari_aktif,
            'total_panen': plant.total_dipanen,
            'streak': streak,
        })