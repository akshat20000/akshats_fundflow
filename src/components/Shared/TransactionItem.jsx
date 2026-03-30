import { getTxMeta, formatUSD, formatDateTime, formatTimeAgo } from '@/utils/format';

export default function TransactionItem({ tx, compact = false }) {
  const { icon, color, sign } = getTxMeta(tx.type);
  const isIncome = tx.type === 'income';

  const statusStyles = {
    completed: 'bg-positive/10 text-positive border-positive/20',
    pending:   'bg-warning/10 text-warning border-warning/20',
    failed:    'bg-negative/10 text-negative border-negative/20',
  };

  const status = tx.status?.toLowerCase() || 'completed';

  if (compact) {
    // ── Compact row (used in HomeSection recent list) ──
    return (
      <div className="list-row group">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mr-3
          ${isIncome ? 'bg-positive/10' : 'bg-negative/10'}`}>
          <i className={`fas ${icon} text-xs ${color}`} />
        </div>

        {/* Description */}
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-sm font-medium text-primary-text truncate leading-tight">
            {tx.description || tx.type}
          </p>
          <p className="text-2xs text-muted-text mt-0.5">
            {tx.timestamp ? formatTimeAgo(tx.timestamp) : 'No date'}
          </p>
        </div>

        {/* Amount */}
        <span className={`font-display font-bold text-sm flex-shrink-0 ${isIncome ? 'text-positive' : 'text-negative'}`}>
          {sign}{formatUSD(Math.abs(tx.amount))}
        </span>
      </div>
    );
  }

  // ── Full row (used in ActivitySection) ──
  return (
    <div className="list-row group items-start py-4">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mr-4 mt-0.5
        ${isIncome ? 'bg-positive/10 border border-positive/15' : 'bg-negative/10 border border-negative/15'}`}>
        <i className={`fas ${icon} text-xs ${color}`} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-semibold text-primary-text leading-tight mb-1">
          {tx.description || tx.type}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-2xs text-muted-text font-mono">
            {tx.timestamp ? formatDateTime(tx.timestamp) : 'No date'}
          </p>
          <span className="text-muted-text text-2xs">·</span>
          <p className="text-2xs text-muted-text font-mono truncate max-w-[160px]">
            {tx.id}
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`font-display font-bold text-sm ${isIncome ? 'text-positive' : 'text-negative'}`}>
          {sign}{formatUSD(Math.abs(tx.amount))}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider border ${statusStyles[status] || statusStyles.completed}`}>
          {status}
        </span>
      </div>
    </div>
  );
}