from datetime import timedelta
from django.utils import timezone
from .models import Achievement, UserAchievement
from missions.models import DailyMissionLog


def award(user, kode):
    """Kasih achievement ke user kalau belum pernah dapat. Return True kalau baru saja didapat."""
    try:
        achievement = Achievement.objects.get(kode=kode)
    except Achievement.DoesNotExist:
        return False

    _, created = UserAchievement.objects.get_or_create(user=user, achievement=achievement)
    return created


def _hitung_status_di_rentang(user, mission_nama, tanggal_mulai, tanggal_akhir):
    logs = DailyMissionLog.objects.filter(
        user=user, mission__nama=mission_nama,
        tanggal__gte=tanggal_mulai, tanggal__lte=tanggal_akhir
    )
    selesai = logs.filter(status='selesai').count()
    tidak = logs.filter(status='tidak').count()
    return selesai, tidak


def evaluasi_setelah_jawab_misi(user, mission_nama, jawaban, plant):
    baru = []

    if jawaban == 'ya':
        total_selesai = DailyMissionLog.objects.filter(user=user, status='selesai').count()
        if total_selesai == 1:
            if award(user, 'tunas_pertama'):
                baru.append('tunas_pertama')

    if plant.poin_nutrisi >= 300:
        if award(user, 'nutrisi_maksimal'):
            baru.append('nutrisi_maksimal')

    if mission_nama == 'isya' and jawaban == 'ya':
        streak = 0
        cursor = timezone.localdate()
        while True:
            log = DailyMissionLog.objects.filter(
                user=user, mission__nama='isya', tanggal=cursor, status='selesai'
            ).first()
            if not log:
                break
            streak += 1
            cursor -= timedelta(days=1)
        if streak >= 10:
            if award(user, 'isya_konsisten'):
                baru.append('isya_konsisten')

    if mission_nama == 'mengaji' and jawaban == 'ya':
        akhir = timezone.localdate()
        awal = akhir - timedelta(days=29)
        selesai, tidak = _hitung_status_di_rentang(user, 'mengaji', awal, akhir)
        if selesai >= 30 and tidak == 0:
            if award(user, 'ngaji_30x'):
                baru.append('ngaji_30x')

    lima_waktu = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']
    akhir = timezone.localdate()
    awal = akhir - timedelta(days=29)
    semua_lengkap = True
    for nama in lima_waktu:
        selesai, tidak = _hitung_status_di_rentang(user, nama, awal, akhir)
        if selesai < 30 or tidak > 0:
            semua_lengkap = False
            break
    if semua_lengkap:
        if award(user, 'lima_waktu_30x'):
            baru.append('lima_waktu_30x')

    return baru


def evaluasi_saat_buka_app(user):
    baru = []

    log_terakhir = DailyMissionLog.objects.filter(user=user).exclude(
        tanggal=timezone.localdate()
    ).order_by('-tanggal').first()
    if log_terakhir:
        gap = (timezone.localdate() - log_terakhir.tanggal).days
        if gap > 3:
            if award(user, 'kembali_setelah_absen'):
                baru.append('kembali_setelah_absen')

    umur_akun = (timezone.now() - user.date_joined).days
    if umur_akun >= 30:
        if award(user, 'pengguna_1_bulan'):
            baru.append('pengguna_1_bulan')

    if umur_akun >= 365:
        if award(user, 'pengguna_1_tahun'):
            baru.append('pengguna_1_tahun')

    return baru


def evaluasi_saat_panen(user, plant, total_panen_sekarang):
    baru = []

    if total_panen_sekarang == 1:
        if award(user, 'panen_pertama'):
            baru.append('panen_pertama')

    if total_panen_sekarang >= 12:
        if award(user, 'panen_12x'):
            baru.append('panen_12x')

    awal_siklus = plant.tanggal_mulai_siklus
    akhir_siklus = timezone.localdate()

    total_tidak = DailyMissionLog.objects.filter(
        user=user, tanggal__gte=awal_siklus, tanggal__lte=akhir_siklus, status='tidak'
    ).count()
    total_selesai = DailyMissionLog.objects.filter(
        user=user, tanggal__gte=awal_siklus, tanggal__lte=akhir_siklus, status='selesai'
    ).count()
    if total_tidak == 0 and total_selesai >= 180:
        if award(user, 'sebulan_penuh'):
            baru.append('sebulan_penuh')

    selesai_subuh, tidak_subuh = _hitung_status_di_rentang(user, 'subuh', awal_siklus, akhir_siklus)
    if tidak_subuh == 0 and selesai_subuh >= 30:
        if award(user, 'penjaga_subuh'):
            baru.append('penjaga_subuh')

    if plant.pernah_layu:
        if award(user, 'bangkit_dari_layu'):
            baru.append('bangkit_dari_layu')

    return baru