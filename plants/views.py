from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Plant


class MyPlantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plant, _ = Plant.objects.get_or_create(user=request.user)
        return Response({
            'poin_nutrisi': plant.poin_nutrisi,
            'tahap': plant.tahap,
            'kesehatan': plant.kesehatan,
            'status': plant.status,
            'pernah_layu': plant.pernah_layu,
            'tanggal_mulai_siklus': plant.tanggal_mulai_siklus,
            'terakhir_cek_kesehatan': plant.terakhir_cek_kesehatan,
            'total_dipanen': plant.total_dipanen,
            'hari_sejak_mulai': plant.hari_sejak_mulai(),
        })