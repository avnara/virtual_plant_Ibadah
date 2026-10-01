let currentGender = null;
let pendingMissionId = null;

async function loadMissions() {
  const [meRes, missionsRes] = await Promise.all([
    apiFetch('/auth/me/'),
    apiFetch('/missions/today/'),
  ]);

  if (meRes && meRes.ok) {
    currentGender = meRes.data.gender;
  }

  if (!missionsRes || !missionsRes.ok) return;

  renderMissions(missionsRes.data);
}

function renderMissions(missions) {
  const list = document.getElementById('misiList');
  list.innerHTML = '';

  missions.forEach(m => {
    const statusClass = m.status === 'selesai' ? 'hijau' : m.status === 'tidak' ? 'merah' : 'abu';
    const div = document.createElement('div');
    div.className = `misi-item ${statusClass}`;

    const sudahDijawab = m.status !== 'belum';

    div.innerHTML = `
      <div>
        <div class="misi-name">${m.mission_nama}</div>
        <div class="misi-time">${m.status === 'selesai' ? '+' + m.poin_didapat + ' poin' : m.status === 'tidak' ? 'Alasan: ' + (m.alasan || '-') : 'Belum dijawab'}</div>
      </div>
      <div class="misi-actions">
        <button class="btn-ya" data-id="${m.mission_id}" ${sudahDijawab ? 'disabled' : ''}>Ya</button>
        <button class="btn-tidak" data-id="${m.mission_id}" ${sudahDijawab ? 'disabled' : ''}>Tidak</button>
      </div>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll('.btn-ya').forEach(btn => {
    btn.addEventListener('click', () => submitAnswer(btn.dataset.id, 'ya'));
  });
  list.querySelectorAll('.btn-tidak').forEach(btn => {
    btn.addEventListener('click', () => openAlasanModal(btn.dataset.id));
  });
}

function openAlasanModal(missionId) {
  pendingMissionId = missionId;
  document.getElementById('haidBtn').style.display = currentGender === 'female' ? 'block' : 'none';
  document.getElementById('alasanModal').classList.add('show');
}

function closeModal() {
  document.getElementById('alasanModal').classList.remove('show');
  pendingMissionId = null;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.alasan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      submitAnswer(pendingMissionId, 'tidak', btn.dataset.alasan);
      closeModal();
    });
  });
});

async function submitAnswer(missionId, jawaban, alasan = null) {
  const body = { mission_id: parseInt(missionId), jawaban };
  if (alasan) body.alasan = alasan;

  const res = await apiFetch('/missions/answer/', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res || !res.ok) {
    alert(res && res.data && res.data.detail ? res.data.detail : 'Gagal menyimpan jawaban.');
    return;
  }

  if (res.data.dalil) {
    showDalil(res.data.dalil);
  }

    if (res.data.achievement_baru && res.data.achievement_baru.length > 0) {
    setTimeout(() => showAchievementModal(res.data.achievement_baru), 500);
  }

  loadMissions();
  if (typeof loadDashboard === 'function') loadDashboard();
}

function showDalil(dalil) {
  const toast = document.getElementById('dalilToast');
  toast.textContent = `${dalil.terjemahan} — ${dalil.sumber}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 6000);
}

document.addEventListener('DOMContentLoaded', loadMissions);