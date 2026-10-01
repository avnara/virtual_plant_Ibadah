from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from plants.models import Plant
from missions.models import DailyMissionLog


class Command(BaseCommand):
    help = 'Turunkan kesehatan tanaman untuk user yang absen total (tidak buka app) di hari-hari terlewat.'

    def handle(self, *args, **options):
        today = timezone.localdate()
        plants = Plant.objects.filter(status__in=['hidup', 'layu'])
        total_terdampak = 0

        for plant in plants:
            cursor = plant.terakhir_cek_kesehatan + timedelta(days=1)
            berubah = False

            while cursor < today:
                ada_aktivitas = DailyMissionLog.objects.filter(
                    user=plant.user, tanggal=cursor
                ).exists()

                if not ada_aktivitas:
                    plant.kurangi_kesehatan(1)
                    berubah = True

                cursor += timedelta(days=1)

            plant.terakhir_cek_kesehatan = today

            if berubah:
                total_terdampak += 1
            plant.save()

        self.stdout.write(self.style.SUCCESS(
            f'Selesai. {total_terdampak} tanaman terdampak dari {plants.count()} tanaman dicek.'
        ))