from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Achievement, HarvestLog, UserAchievement
from .serializers import HarvestLogSerializer, AchievementSerializer, UserAchievementSerializer
from .services import evaluasi_saat_panen
from plants.models import Plant


class HarvestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            plant = Plant.objects.get(user=user)
        except Plant.DoesNotExist:
            return Response({'detail': 'Tanaman tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)

        if not plant.bisa_dipanen():
            return Response({
                'detail': 'Belum bisa dipanen.',
                'hari_berjalan': plant.hari_sejak_mulai(),
                'hari_dibutuhkan': 30,
                'poin_nutrisi': plant.poin_nutrisi,
                'poin_dibutuhkan': 200,
                'status': plant.status,
            }, status=status.HTTP_400_BAD_REQUEST)

        harvest = HarvestLog.objects.create(user=user)
        plant.total_dipanen += 1

        achievement_baru = evaluasi_saat_panen(user, plant, plant.total_dipanen)

        plant.poin_nutrisi = 0
        plant.tahap = 'benih'
        plant.kesehatan = 5
        plant.status = 'hidup'
        plant.pernah_layu = False
        plant.tanggal_mulai_siklus = timezone.now().date()
        plant.save()

        return Response({
            'detail': 'Panen berhasil!',
            'harvest_id': harvest.id,
            'achievement_baru': achievement_baru,
            'plant': {'poin_nutrisi': plant.poin_nutrisi, 'tahap': plant.tahap, 'total_dipanen': plant.total_dipanen}
        }, status=status.HTTP_200_OK)


class HarvestHistoryView(generics.ListAPIView):
    serializer_class = HarvestLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HarvestLog.objects.filter(user=self.request.user).order_by('-tanggal_panen')


class MyAchievementsView(generics.ListAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.all().order_by('id')

    def list(self, request, *args, **kwargs):
        semua = self.get_queryset()
        dimiliki_ids = set(UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True))
        hasil = []
        for a in semua:
            hasil.append({
                'id': a.id, 'kode': a.kode, 'nama': a.nama, 'deskripsi': a.deskripsi,
                'didapat': a.id in dimiliki_ids,
            })
        return Response(hasil)