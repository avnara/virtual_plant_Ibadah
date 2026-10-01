requireAuth();

const TAHAP_LABEL = { benih: 'Bibit', kecambah: 'Kecambah', bibit: 'Pohon Muda', remaja: 'Pohon Remaja', dewasa: 'Pohon Dewasa' };
async function loadAkun() {
  const [meRes, statsRes, plantRes] = await Promise.all([
    apiFetch('/auth/me/'),
    apiFetch('/auth/stats/'),
    apiFetch('/plants/me/'),
  ]);

  if (meRes && meRes.ok) {
    const me = meRes.data;
    const nama = me.display_name || me.username;
    document.getElementById('avatarLetter').textContent = nama.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = nama;
    document.getElementById('profileUsername').textContent = me.username;
  }

  if (plantRes && plantRes.ok) {
    document.getElementById('levelBadge').textContent = 'Level ' + (TAHAP_LABEL[plantRes.data.tahap] || '-');
  }

  if (statsRes && statsRes.ok) {
    document.getElementById('statHariAktif').textContent = statsRes.data.hari_aktif;
    document.getElementById('statPanen').textContent = statsRes.data.total_panen;
    document.getElementById('statStreak').textContent = statsRes.data.streak;
  }
}

document.addEventListener('DOMContentLoaded', loadAkun);