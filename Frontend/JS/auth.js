// Gunakan API_BASE dari api.js jika sudah dideklarasikan, atau buat baru jika dipanggil mandiri
if (typeof API_BASE === 'undefined') {
  var API_BASE = 'http://127.0.0.1:8000/api';
}

// ===== LOGIN =====
async function handleLogin(event) {
  event.preventDefault();
  const errorBox = document.getElementById('errorBox');
  const btn = document.getElementById('submitBtn');
  errorBox.classList.remove('show');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showError('ID Pengguna dan Password wajib diisi.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Memproses...';

  try {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.detail || 'ID Pengguna atau password salah.');
      btn.disabled = false;
      btn.textContent = 'Masuk';
      return;
    }

    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    window.location.href = 'tanaman.html';
  } catch (err) {
    showError('Tidak bisa terhubung ke server. Pastikan backend Django sedang berjalan.');
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
}

// ===== REGISTER =====
async function handleRegister(event) {
  event.preventDefault();
  const errorBox = document.getElementById('errorBox');
  const btn = document.getElementById('submitBtn');
  errorBox.classList.remove('show');

  const username = document.getElementById('username').value.trim();
  const display_name = document.getElementById('display_name').value.trim();
  const genderInput = document.querySelector('input[name="gender"]:checked');
  const provinsi = document.getElementById('provinsi').value;
  const password = document.getElementById('password').value;

  if (!username || !display_name || !genderInput || !provinsi || !password) {
    showError('Semua field wajib diisi.');
    return;
  }
  if (password.length < 8) {
    showError('Password minimal 8 karakter.');
    return;
  }
    const agree = document.getElementById('agreeTerms').checked;
  if (!agree) {
    showError('Kamu harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi terlebih dahulu.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Memproses...';

  try {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        display_name,
        gender: genderInput.value,
        provinsi,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const pesan = Object.values(data).flat().join(' ');
      showError(pesan || 'Pendaftaran gagal, coba lagi.');
      btn.disabled = false;
      btn.textContent = 'Daftar Akun Baru';
      return;
    }

    window.location.href = 'login.html?registered=1';
  } catch (err) {
    showError('Tidak bisa terhubung ke server. Pastikan backend Django sedang berjalan.');
    btn.disabled = false;
    btn.textContent = 'Daftar Akun Baru';
  }
}

function showError(msg) {
  const errorBox = document.getElementById('errorBox');
  errorBox.textContent = msg;
  errorBox.classList.add('show');
}