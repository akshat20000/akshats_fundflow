import TransactionItem from './TransactionItem';
import { EmptyState, Spinner } from '@/components/ui';

export default function TransactionList({
  transactions = [],
  loading = false,
  compact = false,
  limit = null,
  emptyMessage = 'No transactions yet.',
  searchTerm = '',
  filterType = 'all',
  className = '',
}) {
  if (loading) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {[...Array(compact ? 4 : 6)].map((_, i) => (
          <SkeletonRow key={i} compact={compact} delay={i * 60} />
        ))}
      </div>
    );
  }

  // ── Filter ──
  let filtered = [...transactions];

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(tx =>
      (tx.description || '').toLowerCase().includes(term) ||
      tx.type.toLowerCase().includes(term) ||
      (tx.id || '').toLowerCase().includes(term)
    );
  }

  if (filterType && filterType !== 'all') {
    filtered = filtered.filter(tx => tx.type === filterType);
  }

  if (limit) {
    filtered = filtered.slice(0, limit);
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon="fa-receipt"
        message={searchTerm ? `No results for "${searchTerm}"` : emptyMessage}
      />
    );
  }

  return (
    <div className={className}>
      {filtered.map(tx => (
        <TransactionItem key={tx.id} tx={tx} compact={compact} />
      ))}
    </div>
  );
}

// ── Skeleton placeholder row ──
function SkeletonRow({ compact, delay }) {
  return (
    <div
      className="flex items-center gap-3 py-3 px-2"
      style={{ animation: `pulse 1.5s ease-in-out ${delay}ms infinite` }}
    >
      <div className={`rounded-lg bg-surface flex-shrink-0 ${compact ? 'w-8 h-8' : 'w-9 h-9'}`} />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3 rounded bg-surface" style={{ width: `${50 + Math.random() * 30}%` }} />
        <div className="h-2 rounded bg-surface w-24" />
      </div>
      <div className="h-4 w-16 rounded bg-surface flex-shrink-0" />
    </div>
  );
}