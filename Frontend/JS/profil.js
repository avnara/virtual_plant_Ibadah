requireAuth();

async function loadProfil() {
  const res = await apiFetch('/auth/me/');
  if (!res || !res.ok) return;
  const me = res.data;

  document.getElementById('display_name').value = me.display_name || '';
  document.getElementById('provinsi').value = me.provinsi || '';
  const genderInput = document.querySelector(`input[name="gender"][value="${me.gender}"]`);
  if (genderInput) genderInput.checked = true;

  showFoto(me.foto_profil);
}

function showFoto(url) {
  const img = document.getElementById('fotoPreview');
  const placeholder = document.getElementById('fotoPlaceholder');
  if (url) {
    img.src = url;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

document.getElementById('foto_profil').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => showFoto(ev.target.result);
  reader.readAsDataURL(file);
});

async function handleUpdateProfile(event) {
  event.preventDefault();
  const btn = document.getElementById('submitBtn');
  const successBox = document.getElementById('successBox');
  const errorBox = document.getElementById('errorBox');
  successBox.classList.remove('show');
  errorBox.classList.remove('show');

  const display_name = document.getElementById('display_name').value.trim();
  const genderInput = document.querySelector('input[name="gender"]:checked');
  const provinsi = document.getElementById('provinsi').value;
  const fotoFile = document.getElementById('foto_profil').files[0];

  const formData = new FormData();
  formData.append('display_name', display_name);
  if (genderInput) formData.append('gender', genderInput.value);
  formData.append('provinsi', provinsi);
  if (fotoFile) formData.append('foto_profil', fotoFile);

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  const token = getToken();
  try {
    const res = await fetch('http://127.0.0.1:8000/api/auth/update-profile/', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = Object.values(data).flat().join(' ') || 'Gagal menyimpan.';
      errorBox.classList.add('show');
    } else {
      successBox.textContent = 'Profil berhasil diperbarui.';
      successBox.classList.add('show');
      showFoto(data.foto_profil);
    }
  } catch (err) {
    errorBox.textContent = 'Tidak bisa terhubung ke server.';
    errorBox.classList.add('show');
  }

  btn.disabled = false;
  btn.textContent = 'Simpan Perubahan';
}

document.addEventListener('DOMContentLoaded', loadProfil);