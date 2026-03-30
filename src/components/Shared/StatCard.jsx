import { formatUSD } from '@/utils/format';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';

export default function BalanceCard({ onAddMoney, onSendMoney }) {
  const { balance, transactions } = useWalletStore();
  const { profile } = useAuthStore();

  // Quick stats from transactions
  const now = new Date();
  const thisMonth = transactions.filter(tx => {
    if (!tx.timestamp) return false;
    const d = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome  = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = thisMonth.filter(t => t.type !== 'income').reduce((s, t) => s + t.amount, 0);

  const displayName = profile?.full_name || profile?.username || 'User';
  const upiId = `${profile?.username || 'user'}@fundflow`;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/[0.08] mb-6"
      style={{
        background: 'linear-gradient(135deg, #111e33 0%, #162035 50%, #1a2640 100%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 65%)' }}
      />
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative p-7 lg:p-8">
        <div className="flex flex-wrap gap-6 items-start justify-between">

          {/* ── Left: balance ── */}
          <div>
            <p className="text-2xs text-muted-text uppercase tracking-widest font-semibold mb-1">
              Available Balance
            </p>
            <p
              className="font-display font-extrabold text-primary-text leading-none mb-1"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              {formatUSD(balance)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-positive"
                style={{ boxShadow: '0 0 6px rgba(0,229,160,0.8)' }} />
              <p className="text-xs text-secondary-text font-mono">{upiId}</p>
            </div>
          </div>

          {/* ── Right: user + actions ── */}
          <div className="flex flex-col items-end gap-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-primary-text leading-tight">{displayName}</p>
                <p className="text-2xs text-muted-text">{profile?.email}</p>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 0 14px rgba(0,212,255,0.15)' }}
              >
                <span className="font-display font-bold text-sm text-cyan uppercase">
                  {displayName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onAddMoney}
                className="flex items-center gap-2 bg-cyan text-void font-bold text-xs px-4 py-2.5 rounded-lg
                  border-none cursor-pointer transition-all duration-200 hover:bg-[#1adbff] hover:-translate-y-0.5"
                style={{ boxShadow: '0 4px 16px rgba(0,212,255,0.3)' }}
              >
                <i className="fas fa-plus" />
                Add Money
              </button>
              <button
                onClick={onSendMoney}
                className="flex items-center gap-2 bg-surface2 text-primary-text font-semibold text-xs px-4 py-2.5 rounded-lg
                  border border-white/[0.1] cursor-pointer transition-all duration-200
                  hover:border-white/[0.2] hover:-translate-y-0.5"
              >
                <i className="fas fa-paper-plane" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom stats row ── */}
        <div className="mt-6 pt-5 border-t border-white/[0.07] grid grid-cols-3 gap-4">
          <StatPill
            label="This Month In"
            value={formatUSD(monthIncome)}
            icon="fa-arrow-down"
            positive
          />
          <StatPill
            label="This Month Out"
            value={formatUSD(monthExpense)}
            icon="fa-arrow-up"
            positive={false}
          />
          <StatPill
            label="Transactions"
            value={thisMonth.length}
            icon="fa-receipt"
            neutral
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, icon, positive, neutral }) {
  const color = neutral ? 'text-secondary-text' : positive ? 'text-positive' : 'text-negative';
  const bg    = neutral ? 'bg-surface2'         : positive ? 'bg-positive/10' : 'bg-negative/10';
  const iconC = neutral ? 'text-muted-text'     : positive ? 'text-positive'  : 'text-negative';

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-5 h-5 rounded-md ${bg} flex items-center justify-center`}>
          <i className={`fas ${icon} text-[0.6rem] ${iconC}`} />
        </div>
        <p className="text-2xs text-muted-text uppercase tracking-wider font-semibold">{label}</p>
      </div>
      <p className={`font-display font-bold text-base ${color} leading-tight`}>{value}</p>
    </div>
  );
}