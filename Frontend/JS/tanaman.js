requireAuth();

const STAGE_ORDER = ['benih', 'kecambah', 'bibit', 'remaja', 'dewasa'];

const STAGE_LABEL = {
  benih: 'Bibit',
  kecambah: 'Kecambah',
  bibit: 'Pohon Muda',
  remaja: 'Pohon Remaja',
  dewasa: 'Pohon Dewasa',
};

const STAGE_DESC = {
  benih: 'Baru ditanam. Ayo mulai rajin beribadah!',
  kecambah: 'Mulai tumbuh. Terus semangat!',
  bibit: 'Makin kokoh, jangan berhenti di sini.',
  remaja: 'Hampir dewasa, sedikit lagi.',
  dewasa: 'Sudah dewasa, siap dipanen.',
};

function updateSky() {
  const now = new Date();
  const hour = now.getHours();
  const jam = String(hour).padStart(2, '0') + '.' + String(now.getMinutes()).padStart(2, '0');

  let periode, sky, showSun;
  if (hour >= 5 && hour < 11) {
    periode = 'PAGI';
    sky = 'sky-pagi';
    showSun = true;
  } else if (hour >= 11 && hour < 15) {
    periode = 'SIANG';
    sky = 'sky-siang';
    showSun = true;
  } else if (hour >= 15 && hour < 18) {
    periode = 'SORE';
    sky = 'sky-sore';
    showSun = true;
  } else {
    periode = 'MALAM';
    sky = 'sky-malam';
    showSun = false;
  }

  const periodeEl = document.getElementById('periodeLabel');
  const jamEl = document.getElementById('jamLabel');
  const skyEl = document.getElementById('skyArea');
  const sunEl = document.getElementById('sunEl');
  const moonEl = document.getElementById('moonEl');
  const starsEl = document.getElementById('starsEl');

  if (periodeEl) periodeEl.textContent = periode;
  if (jamEl) jamEl.textContent = jam;
  if (skyEl) skyEl.className = 'sky ' + sky;

  if (sunEl) sunEl.style.display = showSun ? 'block' : 'none';
  if (moonEl) moonEl.style.display = showSun ? 'none' : 'block';
  if (starsEl) starsEl.style.display = showSun ? 'none' : 'block';
}

function renderStageTrack(tahapAktif) {
  const activeIndex = STAGE_ORDER.indexOf(tahapAktif);
  const track = document.getElementById('stageTrack');
  const labels = document.getElementById('stageLabels');

  if (!track || !labels) return;

  track.innerHTML = '';
  labels.innerHTML = '';

  STAGE_ORDER.forEach((s, i) => {
    const seg = document.createElement('div');
    seg.className = 'seg' + (i <= activeIndex ? ' done' : '');
    track.appendChild(seg);

    const lbl = document.createElement('span');
    lbl.textContent = STAGE_LABEL[s] || s;
    if (i === activeIndex) lbl.className = 'active';
    labels.appendChild(lbl);
  });
}

function renderPlantShape(tahap, status) {
  const container = document.getElementById('plantVisual');
  if (!container) return;

  const layu = status === 'layu' || status === 'mati';
  const stemColor = layu ? 'linear-gradient(180deg,#8a7256,#5c4a35)' : 'linear-gradient(180deg,#57e08a,#2f9a58)';
  const leafColor = layu ? 'linear-gradient(90deg,#a89573,#6b5a3f)' : 'linear-gradient(90deg,#57e08a,#2f9a58)';
  const canopySmall = layu ? '#8a7a5f' : '#4fbd76';
  const canopyMedium = layu ? '#8a7a5f' : '#3fae66';
  const canopyLarge = layu ? '#7a6a4f' : '#2f9a58';
  const trunkColor = layu ? 'linear-gradient(180deg,#8a7256,#5c4a35)' : 'linear-gradient(180deg,#6b4a2f,#4a3221)';
  const droop = layu ? 'transform:rotate(12deg);' : '';

  let inner = '';

  switch (tahap) {
    case 'benih': // Bibit
      inner = `<div class="seed-mound" style="background:${layu ? '#6b5a3f' : '#6b4a2f'}; width:26px; height:14px;"></div>`;
      break;

    case 'kecambah': // Kecambah
      inner = `
        <div class="leaf" style="background:${leafColor}; ${droop} width:38px;"></div>
        <div class="stem" style="background:${stemColor}; height:34px; width:5px;"></div>
        <div class="pot"></div>
      `;
      break;

    case 'bibit': // Pohon Muda — kanopi bulat kecil, silhouette mulai beda dari kecambah
      inner = `
        <div style="background:${canopySmall}; width:48px; height:42px; border-radius:50%; margin-bottom:-4px; ${droop}"></div>
        <div class="stem" style="background:${stemColor}; height:56px; width:7px;"></div>
        <div class="pot"></div>
      `;
      break;

    case 'remaja': // Pohon Remaja — kanopi lebih besar + batang lebih tebal
      inner = `
        <div style="background:${canopyMedium}; width:88px; height:72px; border-radius:50%; margin-bottom:-6px; ${droop}"></div>
        <div class="stem" style="background:${stemColor}; height:78px; width:10px;"></div>
        <div class="pot" style="width:60px;"></div>
      `;
      break;

    case 'dewasa': // Pohon Dewasa — batang kayu (trunk) + kanopi besar + buah
      inner = `
        <div style="background:${canopyLarge}; width:140px; height:114px; border-radius:50%; position:relative; margin-bottom:-6px; ${droop}">
          ${!layu ? '<div class="fruit" style="top:22px; left:28px;"></div><div class="fruit" style="top:46px; left:74px;"></div><div class="fruit" style="top:16px; left:82px;"></div><div class="fruit" style="top:64px; left:44px;"></div>' : ''}
        </div>
        <div class="trunk" style="background:${trunkColor}; height:50px; width:16px;"></div>
        <div class="pot" style="width:72px;"></div>
      `;
      break;
  }

  container.innerHTML = inner;
}

async function loadTanaman() {
  const res = await apiFetch('/plants/me/');
  if (!res || !res.ok) return;

  const plant = res.data;

  renderStageTrack(plant.tahap);
  renderPlantShape(plant.tahap, plant.status);

  const tahapNameEl = document.getElementById('tahapName');
  const tahapDescEl = document.getElementById('tahapDesc');
  const nutrisiValEl = document.getElementById('nutrisiVal');

  if (tahapNameEl) tahapNameEl.textContent = (STAGE_LABEL[plant.tahap] || plant.tahap) + ' 🌱';
  if (tahapDescEl) tahapDescEl.textContent = STAGE_DESC[plant.tahap] || '';
  if (nutrisiValEl) nutrisiValEl.textContent = plant.poin_nutrisi;

  const kesehatanDots = document.getElementById('kesehatanDots');
  if (kesehatanDots) {
    kesehatanDots.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('span');
      dot.className = i < plant.kesehatan ? 'dot-on' : 'dot-off';
      kesehatanDots.appendChild(dot);
    }
  }

  const statusMap = { 5: 'Sempurna ✨', 4: 'Baik', 3: 'Cukup', 2: 'Waspada', 1: 'Kritis', 0: 'Layu' };
  const kesehatanStatusEl = document.getElementById('kesehatanStatus');
  if (kesehatanStatusEl) {
    kesehatanStatusEl.textContent = statusMap[plant.kesehatan] || '-';
  }

  const nextMilestone = plant.poin_nutrisi < 20
    ? 20
    : (Math.floor(plant.poin_nutrisi / 20) + 1) * 20;
  const prevMilestone = nextMilestone - 20;
  const percent = Math.min(((plant.poin_nutrisi - prevMilestone) / 20) * 100, 100);

  const minEl = document.getElementById('milestoneMin');
  const maxEl = document.getElementById('milestoneMax');
  const progressEl = document.getElementById('progressFill');

  if (minEl) minEl.textContent = prevMilestone;
  if (maxEl) maxEl.textContent = nextMilestone;
  if (progressEl) progressEl.style.width = percent + '%';

  const sisa = Math.max(nextMilestone - plant.poin_nutrisi, 0);
  const nutrisiInfoEl = document.getElementById('nutrisiInfo');
  if (nutrisiInfoEl) {
    nutrisiInfoEl.textContent = sisa > 0 ? `+${sisa} nutrisi lagi` : 'Sudah maksimal di level ini';
  }

  const today = new Date();
  const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
  const bulanIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ][today.getMonth()];

  const tanggalLabelEl = document.getElementById('tanggalLabel');
  if (tanggalLabelEl) {
    tanggalLabelEl.textContent = `${hariIndo}, ${today.getDate()} ${bulanIndo}`;
  }
}
const MISSION_LABELS_SHORT = { subuh: 'Subuh', dzuhur: 'Dzuhur', ashar: 'Ashar', maghrib: 'Maghrib', isya: 'Isya' };

async function loadPrayerTimes() {
  const wrap = document.getElementById('prayerTimesList');
  const res = await apiFetch('/missions/prayer-times/');

  if (!res || !res.ok) {
    wrap.innerHTML = `<span style="font-size:12px; color:#9fb3a8;">Lokasi belum diatur. Atur lewat Menu → Kompas Kiblat.</span>`;
    return;
  }

  const waktu = res.data;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const entries = Object.entries(MISSION_LABELS_SHORT).map(([key, label]) => {
    const jam = waktu[key];
    const [h, m] = (jam || '00:00').split(':').map(Number);
    return { key, label, jam, totalMinutes: h * 60 + m };
  });

  // Cari sholat "aktif" = yang jamnya sudah lewat tapi paling dekat dengan sekarang, sebelum sholat berikutnya
  let activeKey = entries[0].key;
  for (const e of entries) {
    if (nowMinutes >= e.totalMinutes) activeKey = e.key;
  }

  wrap.innerHTML = '';
  entries.forEach(e => {
    const div = document.createElement('div');
    div.className = 'prayer-time-item' + (e.key === activeKey ? ' active' : '');
    div.innerHTML = `<div class="prayer-time-name">${e.label}</div><div class="prayer-time-value">${e.jam || '-'}</div>`;
    wrap.appendChild(div);
  });
}

updateSky();
setInterval(updateSky, 30000);
document.addEventListener('DOMContentLoaded', () => {
  loadTanaman();
  loadPrayerTimes();
});