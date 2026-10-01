import calendar
from datetime import timedelta, date
from django.utils import timezone
from .models import PrayerMission, DailyMissionLog

HARI_LABEL = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
BULAN_LABEL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']


def get_weekly_stats(user, reference_date=None):
    """Statistik minggu ini (Senin-Minggu) sesuai tanggal referensi."""
    if reference_date is None:
        reference_date = timezone.localdate()

    monday = reference_date - timedelta(days=reference_date.weekday())
    week_dates = [monday + timedelta(days=i) for i in range(7)]
    missions = list(PrayerMission.objects.all().order_by('id'))

    per_hari = []
    total_selesai = 0
    best_day = None
    best_count = -1

    for d in week_dates:
        hari_label = HARI_LABEL[d.weekday()]
        row = {'hari': hari_label, 'tanggal': d.isoformat()}
        completed_count = 0
        for m in missions:
            log = DailyMissionLog.objects.filter(user=user, mission=m, tanggal=d).first()
            done = 1 if log and log.status == 'selesai' else 0
            row[m.nama] = done
            completed_count += done
        row['total_selesai'] = completed_count
        total_selesai += completed_count
        if completed_count > best_count:
            best_count = completed_count
            best_day = hari_label
        per_hari.append(row)

    total_slot = len(week_dates) * len(missions)
    persentase = round((total_selesai / total_slot) * 100) if total_slot else 0

    ringkasan_per_sholat = []
    for m in missions:
        cnt = sum(row[m.nama] for row in per_hari)
        pct = round((cnt / len(week_dates)) * 100) if week_dates else 0
        ringkasan_per_sholat.append({
            'mission': m.nama, 'nama': m.get_nama_display(),
            'selesai': cnt, 'total': len(week_dates), 'persentase': pct,
        })

    return {
        'selesai': total_selesai,
        'total': total_slot,
        'persentase': persentase,
        'terbaik': {'hari': best_day, 'jumlah': best_count, 'dari': len(missions)},
        'per_hari': per_hari,
        'ringkasan_per_sholat': ringkasan_per_sholat,
    }


def get_monthly_stats(user, jumlah_bulan=8):
    """Statistik N bulan terakhir (default 8), untuk grafik bulanan."""
    today = timezone.localdate()
    missions = list(PrayerMission.objects.all().order_by('id'))

    bulan_list = []
    y, m = today.year, today.month
    for _ in range(jumlah_bulan):
        bulan_list.append((y, m))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    bulan_list.reverse()

    per_bulan = []
    total_selesai_per_mission = {m.nama: 0 for m in missions}
    total_hari = 0

    for (y, m) in bulan_list:
        awal = date(y, m, 1)
        akhir_hari = calendar.monthrange(y, m)[1]
        akhir = date(y, m, akhir_hari)
        # jangan hitung hari yang belum terjadi (untuk bulan berjalan)
        if akhir > today:
            akhir = today

        row = {'bulan': BULAN_LABEL[m - 1]}
        for mission in missions:
            cnt = DailyMissionLog.objects.filter(
                user=user, mission=mission, tanggal__gte=awal, tanggal__lte=akhir, status='selesai'
            ).count()
            row[mission.nama] = cnt
            total_selesai_per_mission[mission.nama] += cnt
        per_bulan.append(row)
        total_hari += (akhir - awal).days + 1

    ringkasan_per_sholat = []
    for mission in missions:
        cnt = total_selesai_per_mission[mission.nama]
        pct = round((cnt / total_hari) * 100) if total_hari else 0
        ringkasan_per_sholat.append({
            'mission': mission.nama, 'nama': mission.get_nama_display(),
            'selesai': cnt, 'total': total_hari, 'persentase': pct,
        })

    return {
        'per_bulan': per_bulan,
        'ringkasan_per_sholat': ringkasan_per_sholat,
        'jumlah_bulan': jumlah_bulan,
    }