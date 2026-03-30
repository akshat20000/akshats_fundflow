import { useState } from 'react';
import Sidebar from './Sidebar';
import { formatUSD } from '@/utils/format';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';
import AddMoneyModal from '@/components/Modals/AddMoneyModal';

export default function DashboardLayout({ activeSection, onNavigate, children }) {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const { balance } = useWalletStore();
  const { profile } = useAuthStore();

  // Section display names for the topbar breadcrumb
  const SECTION_LABELS = {
    home:     'Dashboard',
    payments: 'Payments',
    contacts: 'Contacts',
    groups:   'Groups',
    bills:    'Bills & Recharge',
    activity: 'Activity',
    settings: 'Settings',
  };

  return (
    <div className="flex h-screen bg-main overflow-hidden">

      {/* ── Sidebar ── */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="flex-shrink-0 flex items-center justify-between
          px-6 lg:px-8 py-4 bg-secondary border-b border-white/[0.07] relative z-10">

          <div className="flex items-center gap-4">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center
                bg-surface border border-white/[0.07] rounded-lg text-secondary-text
                hover:text-primary-text hover:border-white/[0.14]
                transition-all duration-150 cursor-pointer"
              aria-label="Open menu"
            >
              <i className="fas fa-bars text-sm" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-text hidden sm:inline">FundFlow</span>
              <span className="text-muted-text hidden sm:inline">/</span>
              <span className="font-semibold text-primary-text">
                {SECTION_LABELS[activeSection] || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Add money shortcut */}
            <button
              onClick={() => setAddMoneyOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-cyan text-void font-bold text-xs
                px-3.5 py-2 rounded-lg border-none cursor-pointer transition-all duration-150
                hover:bg-[#1adbff]"
              style={{ boxShadow: '0 2px 12px rgba(0,212,255,0.25)' }}
            >
              <i className="fas fa-plus text-[0.75rem]" />
              Add Money
            </button>
            {/* Balance chip — hidden on small screens */}
            <div className="hidden md:flex items-center gap-2 bg-surface border border-white/[0.07]
              rounded-full px-4 py-1.5">
              <span className="text-2xs text-muted-text uppercase tracking-wider font-semibold">Balance</span>
              <span className="font-display font-bold text-sm text-primary-text">
                {formatUSD(balance)}
              </span>
            </div>

            {/* Notification bell (cosmetic) */}
            <button className="w-9 h-9 flex items-center justify-center
              bg-surface border border-white/[0.07] rounded-lg text-muted-text
              hover:text-primary-text hover:border-white/[0.14]
              transition-all duration-150 cursor-pointer relative">
              <i className="fas fa-bell text-sm" />
              {/* Unread dot */}
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan"
                style={{ boxShadow: '0 0 5px rgba(0,212,255,0.8)' }} />
            </button>

            {/* Avatar / profile shortcut */}
            <button
              onClick={() => onNavigate('settings')}
              className="w-9 h-9 rounded-full bg-cyan/10 border border-cyan/25
                flex items-center justify-center cursor-pointer
                hover:border-cyan/50 transition-all duration-150"
              title="Settings"
            >
              <span className="font-display font-bold text-sm text-cyan uppercase">
                {(profile?.full_name || profile?.username || 'U').charAt(0)}
              </span>
            </button>
          </div>
        </header>

        {/* ── Scrollable content area ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      <AddMoneyModal isOpen={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
    </div>
  );
}