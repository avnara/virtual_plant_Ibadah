const TAHAP_LABEL_MP = { benih: 'Bibit', kecambah: 'Kecambah', bibit: 'Pohon Muda', remaja: 'Pohon Remaja', dewasa: 'Pohon Dewasa' };

function injectMenuPanel() {
  if (document.getElementById('menuOverlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  overlay.id = 'menuOverlay';

  const panel = document.createElement('div');
  panel.className = 'menu-panel';
  panel.id = 'menuPanel';
  panel.innerHTML = `
    <div class="menu-panel-head">
      <h2 class="serif">Akun Saya</h2>
      <button class="menu-close-btn" id="menuCloseBtn">✕</button>
    </div>
    <div class="mp-profile-row">
      <div class="mp-avatar" id="mpAvatar">-</div>
      <div>
        <div class="mp-name" id="mpName">...</div>
        <div class="mp-username" id="mpUsername">...</div>
        <div class="mp-level" id="mpLevel">-</div>
      </div>
    </div>
    <div class="mp-stat-row">
      <div class="mp-stat-card"><b id="mpHariAktif">-</b><span>Hari Aktif</span></div>
      <div class="mp-stat-card"><b id="mpPanen">-</b><span>Panen</span></div>
      <div class="mp-stat-card"><b id="mpStreak">-</b><span>Streak 🔥</span></div>
    </div>
    <div class="mp-menu-list">
      <a href="profil.html" class="mp-menu-item">
        <div class="mp-menu-icon" style="background:rgba(139,92,246,.15); color:#a78bfa;">👤</div>
        <div><div class="mp-menu-title">Edit Profil</div><div class="mp-menu-desc">Ubah nama & data diri</div></div>
        <span class="mp-menu-arrow">›</span>
      </a>
      <a href="notifikasi.html" class="mp-menu-item">
        <div class="mp-menu-icon" style="background:rgba(245,166,35,.15); color:#f5a623;">🔔</div>
        <div><div class="mp-menu-title">Notifikasi</div><div class="mp-menu-desc">Atur alarm waktu sholat</div></div>
        <span class="mp-menu-arrow">›</span>
      </a>
      <a href="riwayat.html" class="mp-menu-item">
        <div class="mp-menu-icon" style="background:rgba(74,222,128,.15); color:#4ade80;">📊</div>
        <div><div class="mp-menu-title">Riwayat</div><div class="mp-menu-desc">Pencapaian & riwayat panen</div></div>
        <span class="mp-menu-arrow">›</span>
      </a>
      <a href="kiblat.html" class="mp-menu-item">
        <div class="mp-menu-icon" style="background:rgba(56,189,248,.15); color:#38bdf8;">🧭</div>
        <div><div class="mp-menu-title">Kompas Kiblat</div><div class="mp-menu-desc">Temukan arah kiblat akurat</div></div>
        <span class="mp-menu-arrow">›</span>
      </a>
    </div>
    <button class="mp-logout-btn" id="mpLogoutBtn">⏻ Keluar</button>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  overlay.addEventListener('click', closeMenuPanel);
  document.getElementById('menuCloseBtn').addEventListener('click', closeMenuPanel);
  document.getElementById('mpLogoutBtn').addEventListener('click', logout);
}

function openMenuPanel() {
  injectMenuPanel();
  document.getElementById('menuOverlay').classList.add('show');
  document.getElementById('menuPanel').classList.add('show');
  loadMenuPanelData();
}

function closeMenuPanel() {
  const overlay = document.getElementById('menuOverlay');
  const panel = document.getElementById('menuPanel');
  if (overlay) overlay.classList.remove('show');
  if (panel) panel.classList.remove('show');
}

async function loadMenuPanelData() {
  const [meRes, statsRes, plantRes] = await Promise.all([
    apiFetch('/auth/me/'),
    apiFetch('/auth/stats/'),
    apiFetch('/plants/me/'),
  ]);

  if (meRes && meRes.ok) {
    const nama = meRes.data.display_name || meRes.data.username;
    const avatarEl = document.getElementById('mpAvatar');
    if (meRes.data.foto_profil) {
      avatarEl.innerHTML = `<img src="${meRes.data.foto_profil}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      avatarEl.textContent = nama.charAt(0).toUpperCase();
    }
    document.getElementById('mpName').textContent = nama;
    document.getElementById('mpUsername').textContent = meRes.data.username;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('navMenuBtn');
  if (menuBtn) menuBtn.addEventListener('click', openMenuPanel);
});