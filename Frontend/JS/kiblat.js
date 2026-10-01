requireAuth();

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

function hitungArahKiblat(lat, lng) {
  const phiK = toRad(KAABA_LAT);
  const lambdaK = toRad(KAABA_LNG);
  const phi = toRad(lat);
  const lambda = toRad(lng);

  const psi = Math.atan2(
    Math.sin(lambdaK - lambda),
    Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
  );

  let bearing = toDeg(psi);
  if (bearing < 0) bearing += 360;
  return bearing;
}

function hitungJarakKm(lat, lng) {
  const R = 6371;
  const dLat = toRad(KAABA_LAT - lat);
  const dLng = toRad(KAABA_LNG - lng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

let qiblaBearing = 0;

async function loadKiblat() {
  const res = await apiFetch('/auth/me/');
  if (!res || !res.ok) return;

  const { latitude, longitude } = res.data;
  if (latitude == null || longitude == null) {
    document.getElementById('kiblatInfo').textContent = 'Lokasi belum diatur di akun kamu.';
    return;
  }

  qiblaBearing = hitungArahKiblat(latitude, longitude);
  const jarak = hitungJarakKm(latitude, longitude);

  document.getElementById('derajatVal').textContent = Math.round(qiblaBearing) + '°';
  document.getElementById('jarakVal').textContent = jarak.toLocaleString('id-ID') + ' km';

  document.getElementById('needle').style.transform = `rotate(${qiblaBearing}deg)`;
}

function aktifkanSensor() {
  const statusEl = document.getElementById('sensorStatus');

  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(perm => {
      if (perm === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation);
        statusEl.textContent = 'Sensor aktif — putar perangkatmu.';
      } else {
        statusEl.textContent = 'Izin sensor ditolak.';
      }
    }).catch(() => {
      statusEl.textContent = 'Sensor tidak tersedia di perangkat ini.';
    });
  } else if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', handleOrientation);
    statusEl.textContent = 'Sensor aktif — putar perangkatmu.';
  } else {
    statusEl.textContent = 'Perangkat ini tidak punya sensor kompas. Gunakan derajat manual di bawah.';
  }
}

function handleOrientation(event) {
  const heading = event.webkitCompassHeading !== undefined ? event.webkitCompassHeading : (360 - event.alpha);
  const relative = qiblaBearing - heading;
  document.getElementById('needle').style.transform = `rotate(${relative}deg)`;
  document.getElementById('compassRose').style.transform = `rotate(${-heading}deg)`;
}

document.addEventListener('DOMContentLoaded', loadKiblat);

async function deteksiLokasi() {
  const infoEl = document.getElementById('kiblatInfo');
  infoEl.textContent = 'Mendeteksi lokasi...';
  try {
    const loc = await detectLocation();
    await saveLocation(loc.latitude, loc.longitude, loc.timezone);
    infoEl.textContent = 'Lokasi berhasil diperbarui.';
    loadKiblat();
  } catch (err) {
    infoEl.textContent = 'Gagal mendeteksi lokasi: ' + err;
  }
}