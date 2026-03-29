// ── Currency ──
export function formatUSD(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatUSDCompact(amount) {
  const num = parseFloat(amount) || 0;
  if (Math.abs(num) >= 1000) {
    return '$' + (num / 1000).toFixed(1) + 'k';
  }
  return formatUSD(num);
}

// ── ETH ──
export function formatETH(amount, decimals = 6) {
  const num = parseFloat(amount) || 0;
  return num.toFixed(decimals) + ' ETH';
}

// ── Dates ──
export function formatDate(date) {
  if (!date) return 'No date';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return 'Invalid date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return 'No date';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return 'Invalid date';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeAgo(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)return `${Math.floor(seconds / 3600)}h ago`;
  return formatDate(d);
}

// ── Address ──
export function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ── Transaction icon + color ──
export function getTxMeta(type) {
  switch (type) {
    case 'income':   return { icon: 'fa-arrow-down',         color: 'text-positive', sign: '+' };
    case 'expense':  return { icon: 'fa-arrow-up',           color: 'text-negative', sign: '-' };
    case 'bill':     return { icon: 'fa-file-invoice',       color: 'text-negative', sign: '-' };
    case 'recharge': return { icon: 'fa-mobile-alt',         color: 'text-negative', sign: '-' };
    default:         return { icon: 'fa-exchange-alt',       color: 'text-secondary-text', sign: '' };
  }
}