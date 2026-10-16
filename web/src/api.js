import axios from 'axios';

// ============================================
// CONFIG
// ============================================
const API_URL = 'https://triadacademiatreino.vercel.app/api/v1';

// ============================================
// CLIENT AXIOS
// ============================================
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---------- Request interceptor: injeta Bearer token ----------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('triad_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response interceptor: 401/403 = logout ----------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    // Só desloga se NÃO for uma tentativa de login (evita loop)
    const isLoginCall = err.config?.url?.includes('/auth/login');

    if ((status === 401 || status === 403) && !isLoginCall) {
      localStorage.removeItem('triad_token');
      localStorage.removeItem('triad_user');
      window.location.href = '/';
    }

    return Promise.reject(err);
  }
);

// ============================================
// SESSION HELPERS
// ============================================
export function getToken() {
  return localStorage.getItem('triad_token');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('triad_user') || 'null');
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem('triad_token', token);
  localStorage.setItem('triad_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('triad_token');
  localStorage.removeItem('triad_user');
}

// ============================================
// ROLE → ROUTE
// ============================================
export function routeForRole(role) {
  return {
    ADMIN:     '/adm/dashboard',
    RECEPCAO:  '/center/dashboard',
    PROFESSOR: '/prof/dashboard',
    ALUNO:     '/aluno/dashboard',
  }[role] || '/aluno/dashboard';
}

// ============================================
// ERROR HELPER
// ============================================
// Extrai mensagem de erro legível de uma exceção do axios
export function getErrorMessage(err, fallback = 'Erro inesperado') {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}