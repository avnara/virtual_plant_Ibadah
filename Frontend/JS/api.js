const API_BASE = 'http://127.0.0.1:8000/api';

function getToken() {
  return localStorage.getItem('access_token');
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = 'login.html';
    return null;
  }

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = 'index.html';
}

function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation tidak didukung browser ini.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      err => reject(err.message || 'Gagal mendapatkan lokasi.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function saveLocation(latitude, longitude, timezone) {
  return apiFetch('/auth/location/', {
    method: 'PATCH',
    body: JSON.stringify({ latitude, longitude, timezone }),
  });
}