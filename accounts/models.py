from django.contrib.auth.models import AbstractUser
from django.db import models

PROVINSI_CHOICES = [
    ('aceh', 'Aceh'), ('sumut', 'Sumatera Utara'), ('sumbar', 'Sumatera Barat'),
    ('riau', 'Riau'), ('kepri', 'Kepulauan Riau'), ('jambi', 'Jambi'),
    ('sumsel', 'Sumatera Selatan'), ('bengkulu', 'Bengkulu'), ('lampung', 'Lampung'),
    ('babel', 'Kepulauan Bangka Belitung'), ('dki', 'DKI Jakarta'),
    ('jabar', 'Jawa Barat'), ('jateng', 'Jawa Tengah'), ('diy', 'DI Yogyakarta'),
    ('jatim', 'Jawa Timur'), ('banten', 'Banten'), ('bali', 'Bali'),
    ('ntb', 'Nusa Tenggara Barat'), ('ntt', 'Nusa Tenggara Timur'),
    ('kalbar', 'Kalimantan Barat'), ('kalteng', 'Kalimantan Tengah'),
    ('kalsel', 'Kalimantan Selatan'), ('kaltim', 'Kalimantan Timur'),
    ('kaltara', 'Kalimantan Utara'), ('sulut', 'Sulawesi Utara'),
    ('sulteng', 'Sulawesi Tengah'), ('sulsel', 'Sulawesi Selatan'),
    ('sultra', 'Sulawesi Tenggara'), ('gorontalo', 'Gorontalo'),
    ('sulbar', 'Sulawesi Barat'), ('maluku', 'Maluku'), ('malut', 'Maluku Utara'),
    ('papua', 'Papua'), ('papbar', 'Papua Barat'), ('papsel', 'Papua Selatan'),
    ('paptgh', 'Papua Tengah'), ('pappeg', 'Papua Pegunungan'),
    ('papbrd', 'Papua Barat Daya'),
]


class User(AbstractUser):
    GENDER_CHOICES = [
        ('male', 'Laki-laki'),
        ('female', 'Perempuan'),
    ]

    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    provinsi = models.CharField(max_length=20, choices=PROVINSI_CHOICES, blank=True, null=True)
    display_name = models.CharField(max_length=100, blank=True, null=True)
    foto_profil = models.ImageField(upload_to='profil/', blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    # Lokasi GPS user, dikirim dari device via frontend (browser Geolocation API)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    timezone = models.CharField(max_length=50, default='Asia/Jakarta')  # contoh: "Asia/Jakarta", "Asia/Makassar"

    def __str__(self):
        return self.username