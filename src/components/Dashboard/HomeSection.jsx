import { useState } from 'react';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';
import { BalanceCard, TransactionList, ContactItem, StatCard, SectionHeader } from '@/components/Shared';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import AddMoneyModal from '@/components/Modals/AddMoneyModal';

export default function HomeSection({ onNavigate }) {
  const { transactions, contacts, loadingTransactions, loadingContacts } = useWalletStore();
  const { profile } = useAuthStore();

  const [addMoneyOpen,  setAddMoneyOpen]  = useState(false);

  // Navigate to payments with send pre-selected
  function handleSendMoney() { onNavigate('payments'); }
  function handleAddMoney()  { setAddMoneyOpen(true); }

  // Quick stats
  const now = new Date();
  const thisMonth = transactions.filter(tx => {
    if (!tx.timestamp) return false;
    const d = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalIn  = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = thisMonth.filter(t => t.type !== 'income').reduce((s, t) => s + t.amount, 0);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = profile?.full_name || profile?.username || 'there';

  return (
    <div>
      {/* ── Greeting ── */}
      <div className="mb-6">
        <p className="text-muted-text text-sm mb-0.5">{greeting},</p>
        <h2
          className="font-display font-extrabold text-primary-text tracking-tight"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', letterSpacing: '-0.03em' }}
        >
          {displayName} 👋
        </h2>
      </div>

      {/* ── Balance Card ── */}
      <BalanceCard
        onAddMoney={handleAddMoney}
        onSendMoney={handleSendMoney}
      />

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Month Income"
          value={`$${totalIn.toFixed(2)}`}
          icon="fa-arrow-down"
          accent="positive"
        />
        <StatCard
          label="Month Spend"
          value={`$${totalOut.toFixed(2)}`}
          icon="fa-arrow-up"
          accent="negative"
        />
        <StatCard
          label="Transactions"
          value={thisMonth.length}
          icon="fa-receipt"
          accent="cyan"
        />
        <StatCard
          label="Contacts"
          value={contacts.length}
          icon="fa-users"
          accent="warning"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent activity — takes 2 cols */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Recent Activity" icon="fa-history">
              <button
                onClick={() => onNavigate('activity')}
                className="text-2xs text-cyan font-semibold hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer uppercase tracking-wider"
              >
                View all →
              </button>
            </CardHeader>
            <TransactionList
              transactions={transactions}
              loading={loadingTransactions}
              compact
              limit={6}
              emptyMessage="No transactions yet. Add money to get started."
            />
          </Card>
        </div>

        {/* Quick contacts */}
        <div>
          <Card>
            <CardHeader title="Quick Send" icon="fa-bolt">
              <button
                onClick={() => onNavigate('contacts')}
                className="text-2xs text-cyan font-semibold hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer uppercase tracking-wider"
              >
                All →
              </button>
            </CardHeader>

            {loadingContacts ? (
              <div className="flex flex-col gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-2"
                    style={{ animation: `pulse 1.5s ease-in-out ${i * 100}ms infinite` }}>
                    <div className="w-9 h-9 rounded-full bg-surface flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3 rounded bg-surface w-24" />
                      <div className="h-2 rounded bg-surface w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <EmptyState icon="fa-user-plus" message="No contacts yet. Add one from the Contacts section." />
            ) : (
              <div>
                {contacts.slice(0, 5).map(c => (
                  <ContactItem
                    key={c.id}
                    contact={c}
                    compact
                    onSend={(contact) => {
                      onNavigate('payments');
                      // Pre-fill recipient after navigation
                      setTimeout(() => {
                        const el = document.getElementById('recipient-input');
                        if (el) { el.value = contact.detail; el.focus(); }
                      }, 100);
                    }}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Quick actions card */}
          <Card>
            <CardHeader title="Quick Actions" icon="fa-zap" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Money',    icon: 'fa-plus-circle',      onClick: handleAddMoney,                   accent: 'cyan' },
                { label: 'Send Money',   icon: 'fa-paper-plane',      onClick: handleSendMoney,                  accent: 'positive' },
                { label: 'Groups',       icon: 'fa-users',            onClick: () => onNavigate('groups'),       accent: 'warning' },
                { label: 'Activity',     icon: 'fa-list-alt',         onClick: () => onNavigate('activity'),    accent: 'cyan' },
              ].map(({ label, icon, onClick, accent }) => {
                const accentMap = {
                  cyan:     { bg: 'bg-cyan/10',     border: 'border-cyan/20',     text: 'text-cyan',     hover: 'hover:bg-cyan/20' },
                  positive: { bg: 'bg-positive/10', border: 'border-positive/20', text: 'text-positive', hover: 'hover:bg-positive/20' },
                  warning:  { bg: 'bg-warning/10',  border: 'border-warning/20',  text: 'text-warning',  hover: 'hover:bg-warning/20' },
                };
                const a = accentMap[accent];
                return (
                  <button
                    key={label}
                    onClick={onClick}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                      ${a.bg} ${a.border} ${a.hover} border
                      transition-all duration-150 cursor-pointer text-center`}
                  >
                    <i className={`fas ${icon} text-lg ${a.text}`} />
                    <span className={`text-2xs font-semibold ${a.text}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Money Modal */}
      <AddMoneyModal isOpen={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
    </div>
  );
}