// ============================================
// NÚMEROS E MOEDA
// ============================================

export function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export function formatCurrency(n) {
  return Number(n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatCurrencyCompact(n) {
  const num = Number(n || 0);
  if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1).replace('.', ',')}M`;
  if (num >= 1000)    return `R$ ${(num / 1000).toFixed(1).replace('.', ',')}k`;
  return formatCurrency(num);
}

// ============================================
// DATAS E HORAS
// ============================================

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const hoje = new Date();
  const mesmoDia = d.toDateString() === hoje.toDateString();
  const hora = formatTime(iso);

  if (mesmoDia) return `Hoje · ${hora}`;

  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (d.toDateString() === ontem.toDateString()) return `Ontem · ${hora}`;

  return `${formatDateShort(iso)} · ${hora}`;
}

// ============================================
// DURAÇÃO
// ============================================

export function formatDuration(days) {
  const d = Number(days || 0);
  if (d === 30)  return '1 mês';
  if (d === 60)  return '2 meses';
  if (d === 90)  return '3 meses';
  if (d === 180) return '6 meses';
  if (d === 365) return '1 ano';
  return `${d} dia${d === 1 ? '' : 's'}`;
}

export function daysBetween(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

export function daysUntil(iso) {
  return daysBetween(new Date(), new Date(iso));
}

// ============================================
// STRINGS
// ============================================

export function initials(name) {
  if (!name) return '··';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function firstName(name) {
  if (!name) return '';
  return name.trim().split(/\s+/)[0];
}

export function roleLabel(role) {
  return {
    ADMIN:     'Administrador',
    PROFESSOR: 'Professor',
    RECEPCAO:  'Recepção',
    ALUNO:     'Aluno',
  }[role] || role || '—';
}

// ============================================
// VALIDAÇÃO
// ============================================

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

// ============================================
// UTILS
// ============================================

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}