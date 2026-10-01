requireAuth();

async function loadRiwayat() {
  const [achRes, harvestRes] = await Promise.all([
    apiFetch('/achievements/list/'),
    apiFetch('/achievements/history/'),
  ]);

  if (achRes && achRes.ok) {
    renderAchievements(achRes.data);
  }
  if (harvestRes && harvestRes.ok) {
    renderHarvest(harvestRes.data);
  }
}

function renderAchievements(list) {
  const wrap = document.getElementById('achList');
  wrap.innerHTML = '';
  list.forEach(a => {
    const card = document.createElement('div');
    card.className = 'ach-card' + (a.didapat ? ' unlocked' : '');
    card.innerHTML = `
      <div class="ach-icon">${a.didapat ? '🏆' : '🔒'}</div>
      <div class="ach-name">${a.nama}</div>
      <div class="ach-desc">${a.deskripsi}</div>
    `;
    wrap.appendChild(card);
  });
}

function renderHarvest(list) {
  const wrap = document.getElementById('harvestList');
  wrap.innerHTML = '';
  if (list.length === 0) {
    wrap.innerHTML = '<p style="font-size:12.5px; color:#9fb3a8;">Belum ada riwayat panen.</p>';
    return;
  }
  list.forEach(h => {
    const row = document.createElement('div');
    row.className = 'harvest-row';
    const tgl = new Date(h.tanggal_panen);
    row.innerHTML = `<span>🌾 Panen berhasil</span><b>${tgl.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</b>`;
    wrap.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', loadRiwayat);