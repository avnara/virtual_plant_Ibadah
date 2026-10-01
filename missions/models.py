from django.conf import settings
from django.db import models


class PrayerMission(models.Model):
    NAMA_CHOICES = [
        ('subuh', 'Subuh'),
        ('dzuhur', 'Dzuhur'),
        ('ashar', 'Ashar'),
        ('maghrib', 'Maghrib'),
        ('isya', 'Isya'),
        ('mengaji', 'Mengaji'),
    ]
    nama = models.CharField(max_length=20, choices=NAMA_CHOICES, unique=True)
    poin_reward = models.PositiveIntegerField(default=5)

    def __str__(self):
        return self.get_nama_display()


class DalilReminder(models.Model):
    """Ayat/hadis random yang muncul saat user pilih 'Tidak' mengerjakan sholat."""
    teks_arab = models.TextField(blank=True, null=True)
    terjemahan = models.TextField()
    sumber = models.CharField(max_length=100)  # contoh: "QS. An-Nisa: 103" / "HR. Bukhari"

    def __str__(self):
        return self.sumber


class DailyMissionLog(models.Model):
    STATUS_CHOICES = [
        ('belum', 'Belum Dikerjakan'),
        ('selesai', 'Selesai'),
        ('tidak', 'Tidak Dikerjakan'),
    ]
    ALASAN_CHOICES = [
        ('sibuk', 'Sibuk'),
        ('lupa', 'Lupa'),
        ('haid', 'Haid'),  # hanya relevan untuk user female
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mission_logs')
    mission = models.ForeignKey(PrayerMission, on_delete=models.CASCADE)
    tanggal = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='belum')
    alasan = models.CharField(max_length=10, choices=ALASAN_CHOICES, blank=True, null=True)
    poin_didapat = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'mission', 'tanggal')  # 1 log per misi per hari per user

    def __str__(self):
        return f"{self.user.username} - {self.mission.nama} - {self.tanggal}"