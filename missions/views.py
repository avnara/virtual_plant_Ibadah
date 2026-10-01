from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from .models import PrayerMission, DailyMissionLog, DalilReminder
from .serializers import DailyMissionLogSerializer, AnswerMissionSerializer
from .services import hitung_waktu_sholat
from .stats_service import get_weekly_stats, get_monthly_stats

from plants.models import Plant
from achievements.services import evaluasi_setelah_jawab_misi, evaluasi_saat_buka_app


class TodayMissionsView(generics.ListAPIView):
    """GET: daftar 6 misi hari ini + status masing-masing (belum/selesai/tidak)."""
    serializer_class = DailyMissionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        today = timezone.localdate()
        user = self.request.user

        evaluasi_saat_buka_app(user)  # cek achievement berbasis waktu/absen

        logs = []
        for m in PrayerMission.objects.all():
            log, _ = DailyMissionLog.objects.get_or_create(
                user=user, mission=m, tanggal=today,
                defaults={'status': 'belum'}
            )
            logs.append(log.id)
        return DailyMissionLog.objects.filter(id__in=logs).order_by('mission_id')


class AnswerMissionView(APIView):
    """POST: jawab Ya/Tidak untuk satu misi."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AnswerMissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = request.user
        today = timezone.localdate()

        try:
            mission = PrayerMission.objects.get(id=data['mission_id'])
        except PrayerMission.DoesNotExist:
            return Response({'detail': 'Misi tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)

        if data.get('alasan') == 'haid' and user.gender != 'female':
            return Response(
                {'alasan': 'Pilihan ini hanya berlaku untuk pengguna perempuan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        log, _ = DailyMissionLog.objects.get_or_create(
            user=user, mission=mission, tanggal=today,
            defaults={'status': 'belum'}
        )
        plant, _ = Plant.objects.get_or_create(user=user)
        response_data = {}

        if data['jawaban'] == 'ya':
            log.status = 'selesai'
            log.alasan = None
            log.poin_didapat = mission.poin_reward
            log.save()

            plant.poin_nutrisi = min(plant.poin_nutrisi + mission.poin_reward, 300)
            plant.tambah_kesehatan(1)
            plant.hitung_tahap()
            plant.save()
        else:
            log.status = 'tidak'
            log.alasan = data['alasan']
            log.poin_didapat = 0
            log.save()

            # Alasan "haid" dikecualikan dari penalti kesehatan
            if data['alasan'] != 'haid':
                plant.kurangi_kesehatan(1)
                plant.save()

            dalil = DalilReminder.objects.order_by('?').first()
            if dalil:
                response_data['dalil'] = {
                    'teks_arab': dalil.teks_arab,
                    'terjemahan': dalil.terjemahan,
                    'sumber': dalil.sumber,
                }

        achievement_baru = evaluasi_setelah_jawab_misi(
            user=user, mission_nama=mission.nama, jawaban=data['jawaban'], plant=plant
        )
        if achievement_baru:
            response_data['achievement_baru'] = achievement_baru

        response_data['log'] = DailyMissionLogSerializer(log).data
        response_data['plant'] = {
            'poin_nutrisi': plant.poin_nutrisi,
            'tahap': plant.tahap,
            'kesehatan': plant.kesehatan,
            'status': plant.status,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class PrayerTimesTodayView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.latitude is None or user.longitude is None:
            return Response(
                {'detail': 'Lokasi belum diatur. Kirim latitude & longitude lewat /api/auth/location/ dulu.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        waktu = hitung_waktu_sholat(user.latitude, user.longitude, user.timezone)
        return Response(waktu)


class WeeklyStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = get_weekly_stats(request.user)
        return Response(data)


class MonthlyStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = get_monthly_stats(request.user)
        return Response(data)