import { NAV_ITEMS } from '@/utils/constants';
import { formatUSD } from '@/utils/format';
import useAuthStore from '@/store/useAuthStore';
import useWalletStore from '@/store/useWalletStore';

export default function Sidebar({ activeSection, onNavigate, isOpen, onClose }) {
  const { profile, signOut } = useAuthStore();
  const { balance } = useWalletStore();

  const displayName = profile?.full_name || profile?.username || profile?.email?.split('@')[0] || 'User';
  const upiId = `${profile?.username || 'user'}@fundflow`;

  async function handleSignOut() {
    await signOut();
  }

  return (
    <>
      {/* ── Mobile overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[260px] z-50
          bg-secondary border-r border-white/[0.07]
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-out-expo
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          boxShadow: isOpen ? '20px 0 60px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Right edge glow line */}
        <div
          className="absolute top-0 right-0 w-px h-full pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.2), transparent)' }}
        />

        {/* ── Header / Logo ── */}
        <div className="flex items-center gap-3 px-6 py-7 border-b border-white/[0.07] flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '0 0 14px rgba(0,212,255,0.15)' }}
          >
            <i
              className="fas fa-wallet text-cyan text-sm"
              style={{ filter: 'drop-shadow(0 0 5px rgba(0,212,255,0.7))' }}
            />
          </div>
          <span className="font-display font-extrabold text-lg text-primary-text tracking-tight">
            Fund<span className="text-cyan">Flow</span>
          </span>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden w-7 h-7 flex items-center justify-center text-muted-text hover:text-primary-text bg-transparent border-none cursor-pointer rounded-md hover:bg-white/[0.05] transition-all"
            aria-label="Close menu"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* ── User mini-card ── */}
        <div className="mx-4 mt-4 mb-2 p-3.5 rounded-lg bg-surface border border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-cyan/10 border border-cyan/25 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-sm text-cyan uppercase">
                {displayName.charAt(0)}
              </span>
            </div>
            {/* Info */}
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-text truncate leading-tight">
                {displayName}
              </p>
              <p className="text-2xs text-muted-text truncate font-mono mt-0.5">
                {upiId}
              </p>
            </div>
          </div>
          {/* Balance pill */}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-2xs text-muted-text uppercase tracking-wider font-semibold">Balance</span>
            <span className="font-display font-bold text-sm text-positive">
              {formatUSD(balance)}
            </span>
          </div>
        </div>

        {/* ── Nav links ── */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-[10px] rounded-lg text-left
                  text-sm font-medium border transition-all duration-150 cursor-pointer
                  bg-transparent
                  ${isActive
                    ? 'text-primary-text border-cyan/30 font-semibold'
                    : 'text-muted-text border-transparent hover:text-primary-text hover:bg-elevated hover:border-white/[0.07]'
                  }
                `}
                style={isActive ? { background: 'rgba(0,212,255,0.09)' } : {}}
              >
                <i
                  className={`fas ${item.icon} w-[18px] text-center text-[0.95em] flex-shrink-0 transition-all duration-150`}
                  style={isActive ? {
                    color: '#00d4ff',
                    filter: 'drop-shadow(0 0 5px rgba(0,212,255,0.65))',
                  } : {}}
                />
                {item.label}

                {/* Active indicator dot */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan flex-shrink-0"
                    style={{ boxShadow: '0 0 6px rgba(0,212,255,0.8)' }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="px-4 pb-5 pt-3 border-t border-white/[0.07] flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
              text-secondary-text text-sm font-medium border border-white/[0.07]
              hover:border-negative/40 hover:text-negative hover:bg-negative/[0.07]
              transition-all duration-150 bg-transparent cursor-pointer"
          >
            <i className="fas fa-sign-out-alt text-[0.9em]" />
            Sign Out
          </button>
          <p className="text-center text-2xs text-muted-text mt-3">
            © 2025 FundFlow
          </p>
        </div>
      </aside>
    </>
  );
}