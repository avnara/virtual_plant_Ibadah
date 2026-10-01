requireAuth();

async function loadDashboard() {
  const [plantRes, meRes] = await Promise.all([
    apiFetch('/plants/me/'),
    apiFetch('/auth/me/'),
  ]);

  if (!plantRes || !plantRes.ok) return;

  const plant = plantRes.data;
  const me = meRes && meRes.ok ? meRes.data : null;

  if (me) {
    document.getElementById('userName').textContent = me.display_name || me.username;
  }

  document.getElementById('tahapLabel').textContent = capitalize(plant.tahap);
  document.getElementById('poinNutrisi').textContent = plant.poin_nutrisi;
  document.getElementById('hariBerjalan').textContent = plant.hari_sejak_mulai;
  document.getElementById('totalPanen').textContent = plant.total_dipanen;

  const sisaHari = Math.max(30 - plant.hari_sejak_mulai, 0);
  const harvestBtn = document.getElementById('harvestBtn');
  if (sisaHari === 0 && plant.poin_nutrisi >= 200) {
    harvestBtn.disabled = false;
    harvestBtn.textContent = 'Panen Sekarang';
  } else {
    harvestBtn.disabled = true;
    harvestBtn.textContent = `Terkunci (${sisaHari} hari)`;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener('DOMContentLoaded', loadDashboard);