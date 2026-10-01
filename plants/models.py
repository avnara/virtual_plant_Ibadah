from django.conf import settings
from django.db import models
from django.utils import timezone


class Plant(models.Model):
    STAGE_CHOICES = [
        ('benih', 'Benih'),
        ('kecambah', 'Kecambah'),
        ('bibit', 'Bibit'),
        ('remaja', 'Pohon Muda'),
        ('dewasa', 'Pohon Dewasa'),
    ]
    STATUS_CHOICES = [
        ('hidup', 'Hidup'),
        ('layu', 'Layu'),
        ('mati', 'Mati'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plant')
    poin_nutrisi = models.PositiveIntegerField(default=0)  # 0 - 300
    tahap = models.CharField(max_length=20, choices=STAGE_CHOICES, default='benih')
    kesehatan = models.PositiveIntegerField(default=5)  # 0 - 5, sesuai bar di UI
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='hidup')
    tanggal_mulai_siklus = models.DateField(default=timezone.now)
    total_dipanen = models.PositiveIntegerField(default=0)
    streak_hari = models.PositiveIntegerField(default=0)
    pernah_layu = models.BooleanField(default=False)
    terakhir_cek_kesehatan = models.DateField(default=timezone.now)

    def hitung_tahap(self):
        """Update tahap berdasarkan poin_nutrisi saat ini."""
        p = self.poin_nutrisi
        if p < 100:
            self.tahap = 'benih' if p < 20 else 'kecambah'
        elif p < 150:
            self.tahap = 'bibit'
        elif p < 200:
            self.tahap = 'remaja'
        else:
            self.tahap = 'dewasa'
        return self.tahap

    def hari_sejak_mulai(self):
        return (timezone.now().date() - self.tanggal_mulai_siklus).days

    def save(self, *args, **kwargs):
        self.hitung_tahap()
        super().save(*args, **kwargs)

    def bisa_dipanen(self):
        return self.hari_sejak_mulai() >= 30 and self.poin_nutrisi >= 200 and self.status == 'hidup'

    def tambah_kesehatan(self, jumlah=1):
        """Dipanggil saat user jawab 'Ya' — kesehatan pulih bertahap."""
        self.kesehatan = min(self.kesehatan + jumlah, 5)
        if self.status == 'layu' and self.kesehatan > 0:
            self.status = 'hidup'

    def kurangi_kesehatan(self, jumlah=1, poin_penalti=15):
        """
        Dipanggil saat user jawab 'Tidak' (kecuali alasan haid) atau lewat
        pengecekan absen harian. Kalau kesehatan sudah 0, mulai mengikis
        poin_nutrisi sebagai tahap akhir sebelum tanaman benar-benar mati.
        """
        if self.kesehatan > 0:
            self.kesehatan = max(self.kesehatan - jumlah, 0)
            if self.kesehatan == 0:
                self.status = 'layu'
                self.pernah_layu = True
        else:
            self.poin_nutrisi = max(self.poin_nutrisi - poin_penalti, 0)
            if self.poin_nutrisi == 0:
                self._reset_karena_mati()

    def _reset_karena_mati(self):
        """Tanaman mati total — mulai lagi dari benih dengan siklus baru."""
        self.status = 'hidup'
        self.tahap = 'benih'
        self.kesehatan = 5
        self.poin_nutrisi = 0
        self.pernah_layu = False
        self.tanggal_mulai_siklus = timezone.now().date()

    def __str__(self):
        return f"Tanaman {self.user.username} - {self.tahap}"