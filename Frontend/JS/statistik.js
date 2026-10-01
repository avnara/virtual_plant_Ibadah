requireAuth();

const MISSION_COLORS = {
  subuh: '#4ade80',
  dzuhur: '#38bdf8',
  ashar: '#fbbf24',
  maghrib: '#fb923c',
  isya: '#a78bfa',
  mengaji: '#f472b6',
};
const MISSION_LABELS = {
  subuh: 'Subuh', dzuhur: 'Dzuhur', ashar: 'Ashar',
  maghrib: 'Maghrib', isya: 'Isya', mengaji: 'Mengaji',
};

let barChart = null;
let lineChart = null;
let currentMode = 'weekly';

async function loadStats(mode) {
  currentMode = mode;
  document.getElementById('tabWeekly').classList.toggle('active', mode === 'weekly');
  document.getElementById('tabMonthly').classList.toggle('active', mode === 'monthly');

  const endpoint = mode === 'weekly' ? '/missions/stats/weekly/' : '/missions/stats/monthly/';
  const res = await apiFetch(endpoint);
  if (!res || !res.ok) return;

  const data = res.data;

  if (mode === 'weekly') {
    renderSummaryWeekly(data);
    renderBarChart(data.per_hari, 'hari');
    renderLineChart(data.per_hari, 'hari');
    renderRingkasan(data.ringkasan_per_sholat);
  } else {
    renderSummaryMonthly(data);
    renderBarChart(data.per_bulan, 'bulan');
    renderLineChart(data.per_bulan, 'bulan');
    renderRingkasan(data.ringkasan_per_sholat);
  }
}

function renderSummaryWeekly(data) {
  document.getElementById('sumSelesai').textContent = `${data.selesai}/${data.total}`;
  document.getElementById('sumSelesaiLabel').textContent = 'minggu ini';
  document.getElementById('sumPersen').textContent = `${data.persentase}%`;
  document.getElementById('sumTerbaik').textContent = data.terbaik.hari || '-';
  document.getElementById('sumTerbaikLabel').textContent = `${data.terbaik.jumlah}/${data.terbaik.dari} sholat`;
}

function renderSummaryMonthly(data) {
  const totalSelesai = data.ringkasan_per_sholat.reduce((a, b) => a + b.selesai, 0);
  const totalSlot = data.ringkasan_per_sholat.reduce((a, b) => a + b.total, 0);
  const persen = totalSlot ? Math.round((totalSelesai / totalSlot) * 100) : 0;

  document.getElementById('sumSelesai').textContent = totalSelesai;
  document.getElementById('sumSelesaiLabel').textContent = `${data.jumlah_bulan} bulan terakhir`;
  document.getElementById('sumPersen').textContent = `${persen}%`;
  document.getElementById('sumTerbaik').textContent = '-';
  document.getElementById('sumTerbaikLabel').textContent = 'ringkasan bulanan';
}

function renderBarChart(rows, labelKey) {
  const labels = rows.map(r => r[labelKey]);
  const missions = Object.keys(MISSION_LABELS);

  const datasets = missions.map(m => ({
    label: MISSION_LABELS[m],
    data: rows.map(r => r[m] || 0),
    backgroundColor: MISSION_COLORS[m],
    stack: 'stack1',
  }));

  const ctx = document.getElementById('barChart').getContext('2d');
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: '#9fb3a8' } },
        y: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9fb3a8' } },
      },
    },
  });
}

function renderLineChart(rows, labelKey) {
  const labels = rows.map(r => r[labelKey]);
  const missions = Object.keys(MISSION_LABELS);

  const datasets = missions.map(m => ({
    label: MISSION_LABELS[m],
    data: rows.map(r => (r[m] || 0) > 0 ? 1 : 0),
    borderColor: MISSION_COLORS[m],
    backgroundColor: 'transparent',
    tension: 0.4,
    pointRadius: 3,
  }));

  const ctx = document.getElementById('lineChart').getContext('2d');
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9fb3a8' } },
        y: { min: 0, max: 1, ticks: { stepSize: 1, color: '#9fb3a8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      },
    },
  });
}

function renderRingkasan(ringkasan) {
  const wrap = document.getElementById('ringkasanList');
  wrap.innerHTML = '';

  ringkasan.forEach(r => {
    const row = document.createElement('div');
    row.className = 'ringkasan-row';
    row.innerHTML = `
      <span class="ringkasan-label" style="color:${MISSION_COLORS[r.mission]}">${r.nama}</span>
      <div class="ringkasan-bar-bg">
        <div class="ringkasan-bar-fill" style="width:${r.persentase}%; background:${MISSION_COLORS[r.mission]}"></div>
      </div>
      <span class="ringkasan-num">${r.selesai} <small>(${r.persentase}%)</small></span>
    `;
    wrap.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tabWeekly').addEventListener('click', () => loadStats('weekly'));
  document.getElementById('tabMonthly').addEventListener('click', () => loadStats('monthly'));
  loadStats('weekly');
});