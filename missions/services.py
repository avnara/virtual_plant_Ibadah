from datetime import date
from zoneinfo import ZoneInfo
from adhanpy.PrayerTimes import PrayerTimes
from adhanpy.calculation.CalculationMethod import CalculationMethod
from adhanpy.calculation.CalculationParameters import CalculationParameters


def hitung_waktu_sholat(latitude, longitude, tz_name='Asia/Jakarta', tanggal=None):
    if tanggal is None:
        tanggal = date.today()

    params = CalculationParameters(method=CalculationMethod.MUSLIM_WORLD_LEAGUE)

    prayer_times = PrayerTimes(
        coordinates=(latitude, longitude),
        date=tanggal,
        calculation_parameters=params,
    )

    tz = ZoneInfo(tz_name)

    def fmt(dt_utc):
        return dt_utc.astimezone(tz).strftime('%H:%M')

    return {
        'subuh': fmt(prayer_times.fajr),
        'dzuhur': fmt(prayer_times.dhuhr),
        'ashar': fmt(prayer_times.asr),
        'maghrib': fmt(prayer_times.maghrib),
        'isya': fmt(prayer_times.isha),
    }