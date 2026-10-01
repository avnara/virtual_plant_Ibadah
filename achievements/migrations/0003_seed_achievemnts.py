from django.db import migrations


def seed_achievements(apps, schema_editor):
    Achievement = apps.get_model('achievements', 'Achievement')

    data = [
        ('tunas_pertama', 'Tunas Pertama', 'Menyelesaikan misi pertama kali sejak daftar.'),
        ('panen_pertama', 'Panen Pertama', 'Berhasil menyelesaikan 1 siklus penuh (30,4 hari) dan memanen tanaman.'),
        ('sebulan_penuh', 'Panen Sempurna', 'Konsisten 30 hari penuh tanpa terlewat sekali pun.'),
        ('penjaga_subuh', 'Penjaga Subuh', 'Berhasil panen dengan kedisiplinan sholat subuh yang konsisten.'),
        ('lima_waktu_30x', 'Bulan Cahaya', 'Sholat 5 waktu lengkap selama 30 hari.'),
        ('isya_konsisten', 'Penjaga Malam', 'Sholat Isya tepat waktu 10 hari berturut-turut.'),
        ('ngaji_30x', "Sahabat Al-Qur'an", 'Ngaji 30 hari dalam sebulan.'),
        ('panen_12x', 'Petani Setahun', 'Berhasil panen 12 kali (setara 1 tahun siklus).'),
        ('nutrisi_maksimal', 'Nutrisi Sempurna', 'Mencapai nutrisi maksimal dalam satu siklus.'),
        ('bangkit_dari_layu', 'Tumbuh Kembali', 'Tanaman sempat layu, lalu berhasil dirawat kembali hingga sehat dan dipanen.'),
        ('kembali_setelah_absen', 'Jangan Menyerah', 'Kembali aktif setelah absen lebih dari 3 hari.'),
        ('pengguna_1_bulan', 'Kebun Pertama', 'Sudah menggunakan aplikasi selama 1 bulan.'),
        ('pengguna_1_tahun', 'Setahun Bersama Tumbuh', 'Sudah menggunakan aplikasi selama 1 tahun penuh.'),
    ]

    for kode, nama, deskripsi in data:
        Achievement.objects.get_or_create(kode=kode, defaults={'nama': nama, 'deskripsi': deskripsi})


def hapus_achievements(apps, schema_editor):
    Achievement = apps.get_model('achievements', 'Achievement')
    Achievement.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('achievements', '0002_remove_harvestlog_achievement_achievement_kode_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_achievements, hapus_achievements),
    ]