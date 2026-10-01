let achievementQueue = [];
let achievementCache = null;

function injectAchievementModal() {
  if (document.getElementById('achModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'ach-modal-overlay';
  overlay.id = 'achModalOverlay';
  overlay.innerHTML = `
    <div class="ach-modal-box">
      <div class="ach-modal-eyebrow">Pencapaian Baru</div>
      <div class="ach-modal-icon">🏆</div>
      <div class="ach-modal-name" id="achModalName">-</div>
      <div class="ach-modal-desc" id="achModalDesc">-</div>
      <div class="ach-modal-counter" id="achModalCounter"></div>
      <button class="ach-modal-btn" id="achModalNextBtn">Keren!</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('achModalNextBtn').addEventListener('click', showNextAchievement);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) showNextAchievement();
  });
}

async function getAchievementDetail(kode) {
  if (!achievementCache) {
    const res = await apiFetch('/achievements/list/');
    achievementCache = (res && res.ok) ? res.data : [];
  }
  return achievementCache.find(a => a.kode === kode) || { nama: kode, deskripsi: '' };
}

async function showAchievementModal(kodeList) {
  if (!kodeList || kodeList.length === 0) return;
  injectAchievementModal();

  achievementQueue = [...kodeList];
  await showNextAchievement();
}

async function showNextAchievement() {
  const overlay = document.getElementById('achModalOverlay');

  if (achievementQueue.length === 0) {
    overlay.classList.remove('show');
    return;
  }

  const kode = achievementQueue.shift();
  const detail = await getAchievementDetail(kode);

  document.getElementById('achModalName').textContent = detail.nama;
  document.getElementById('achModalDesc').textContent = detail.deskripsi;

  const counterEl = document.getElementById('achModalCounter');
  counterEl.textContent = achievementQueue.length > 0
    ? `${achievementQueue.length} pencapaian lagi menunggu`
    : '';

  const nextBtn = document.getElementById('achModalNextBtn');
  nextBtn.textContent = achievementQueue.length > 0 ? 'Lanjut →' : 'Keren!';

  overlay.classList.add('show');
}