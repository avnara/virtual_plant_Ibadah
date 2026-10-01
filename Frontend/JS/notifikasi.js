requireAuth();

const MISSION_LABELS = { subuh: 'Subuh', dzuhur: 'Dzuhur', ashar: 'Ashar', maghrib: 'Maghrib', isya: 'Isya' };
let scheduledTimers = [];

function getSetting(key) { 
  return localStorage.getItem('notif_' + key) === 'true'; 
}

function setSetting(key, value) { 
  localStorage.setItem('notif_' + key, value); 
}

function getManualTime(key) { 
  return localStorage.getItem('notif_time_' + key) || ''; 
}

function setManualTime(key, value) { 
  localStorage.setItem('notif_time_' + key, value); 
}

async function loadNotifikasi() {
  const permStatus = document.getElementById('permStatus');
  if (!('Notification' in window)) {
    permStatus.textContent = 'Browser ini tidak mendukung notifikasi.';
    return;
  }
  permStatus.textContent = 'Status izin: ' + Notification.permission;

  Object.keys(MISSION_LABELS).forEach(m => {
    const toggleEl = document.getElementById('toggle_' + m);
    if (toggleEl) toggleEl.checked = getSetting(m);
    
    const timeEl = document.getElementById('time_' + m);
    const manual = getManualTime(m);
    if (timeEl && manual) timeEl.value = manual;
  });

  const res = await apiFetch('/missions/prayer-times/');
  const infoEl = document.getElementById('jadwalInfo');
  
  if (res && res.ok) {
    if (infoEl) infoEl.textContent = 'Jam otomatis terisi dari lokasimu — bisa diedit manual kapan saja.';
    Object.keys(MISSION_LABELS).forEach(m => {
      const input = document.getElementById('time_' + m);
      if (input && !input.value && res.data[m]) {
        input.value = res.data[m];
      }
    });
  } else {
    if (infoEl) infoEl.textContent = 'Lokasi belum diatur. Atur jam manual di bawah, atau deteksi lokasi dulu.';
  }

  scheduleAlarms();
}

async function deteksiLokasi() {
  const infoEl = document.getElementById('jadwalInfo');
  if (infoEl) infoEl.textContent = 'Mendeteksi lokasi...';
  try {
    const loc = await detectLocation();
    await saveLocation(loc.latitude, loc.longitude, loc.timezone);
    if (infoEl) infoEl.textContent = 'Lokasi berhasil diperbarui.';
    loadNotifikasi();
  } catch (err) {
    if (infoEl) infoEl.textContent = 'Gagal mendeteksi lokasi: ' + err;
  }
}

async function requestPermission() {
  const perm = await Notification.requestPermission();
  const permStatus = document.getElementById('permStatus');
  if (permStatus) permStatus.textContent = 'Status izin: ' + perm;
  if (perm === 'granted') scheduleAlarms();
}

function toggleAlarm(mission) {
  const toggleEl = document.getElementById('toggle_' + mission);
  if (toggleEl) {
    setSetting(mission, toggleEl.checked);
    scheduleAlarms();
  }
}

function updateManualTime(mission) {
  const timeEl = document.getElementById('time_' + mission);
  if (timeEl) {
    setManualTime(mission, timeEl.value);
    scheduleAlarms();
  }
}

function scheduleAlarms() {
  scheduledTimers.forEach(t => clearTimeout(t));
  scheduledTimers = [];

  if (Notification.permission !== 'granted') return;

  Object.keys(MISSION_LABELS).forEach(mission => {
    if (!getSetting(mission)) return;
    
    const timeEl = document.getElementById('time_' + mission);
    if (!timeEl || !timeEl.value) return;

    const jamStr = timeEl.value;
    const [h, m] = jamStr.split(':').map(Number);
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    
    if (target < now) target.setDate(target.getDate() + 1);

    const timer = setTimeout(() => {
      new Notification('Waktunya ' + MISSION_LABELS[mission], {
        body: 'Jangan lupa laksanakan sholat ' + MISSION_LABELS[mission] + ' ya 🌱',
      });
    }, target - now);
    
    scheduledTimers.push(timer);
  });
}

document.addEventListener('DOMContentLoaded', loadNotifikasi);