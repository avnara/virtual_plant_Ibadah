from django.conf import settings
from django.db import models


class Achievement(models.Model):
    kode = models.SlugField(max_length=50, unique=True)
    nama = models.CharField(max_length=100)
    deskripsi = models.TextField()
    icon = models.ImageField(upload_to='achievements/', blank=True, null=True)

    def __str__(self):
        return f"{self.kode} - {self.nama}"


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    diperoleh_saat = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.username} - {self.achievement.kode}"


class HarvestLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='harvests')
    tanggal_panen = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} panen pada {self.tanggal_panen.date()}"