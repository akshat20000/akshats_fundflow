import { SectionHeader } from '@/components/Shared';
import { Card, CardHeader } from '@/components/ui';

const BILL_CATEGORIES = [
  { icon: 'fa-bolt',         label: 'Electricity',   desc: 'Pay electricity bills',      color: '#ffb347' },
  { icon: 'fa-tint',         label: 'Water',         desc: 'Pay water utility bills',    color: '#60a5fa' },
  { icon: 'fa-wifi',         label: 'Internet',      desc: 'Broadband & fiber payments', color: '#00d4ff' },
  { icon: 'fa-mobile-alt',   label: 'Mobile',        desc: 'Recharge your mobile',       color: '#00e5a0' },
  { icon: 'fa-tv',           label: 'DTH / Cable',   desc: 'TV & cable subscriptions',   color: '#a78bfa' },
  { icon: 'fa-gas-pump',     label: 'Gas',           desc: 'LPG & piped gas payments',   color: '#fb923c' },
  { icon: 'fa-university',   label: 'Insurance',     desc: 'Premium & policy payments',  color: '#34d399' },
  { icon: 'fa-credit-card',  label: 'Credit Card',   desc: 'Card bill payments',         color: '#f472b6' },
];

export default function BillsSection() {
  return (
    <div>
      <SectionHeader title="Bills & Recharge" subtitle="Pay bills and recharge services" />

      {/* Coming soon banner */}
      <div className="relative rounded-xl border border-warning/20 bg-warning/[0.06] p-5 mb-6 flex items-center gap-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 10% 50%, rgba(255,179,71,0.08) 0%, transparent 60%)' }} />
        <div className="w-9 h-9 rounded-lg bg-warning/15 border border-warning/25 flex items-center justify-center flex-shrink-0">
          <i className="fas fa-tools text-warning text-sm" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-text">Bill payments are coming soon</p>
          <p className="text-xs text-muted-text mt-0.5">
            This section is a UI preview. Real payment integrations will be added in a future update.
          </p>
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {BILL_CATEGORIES.map(({ icon, label, desc, color }) => (
          <button
            key={label}
            disabled
            className="group relative bg-surface border border-white/[0.07] rounded-xl p-5
              text-center cursor-not-allowed opacity-70
              transition-all duration-200 hover:border-white/[0.14] hover:opacity-90 hover:-translate-y-0.5"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 0%, ${color}10 0%, transparent 70%)` }}
            />
            <div className="relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
              >
                <i className={`fas ${icon} text-lg`} style={{ color }} />
              </div>
              <h4 className="font-display font-bold text-sm text-primary-text mb-1">{label}</h4>
              <p className="text-2xs text-muted-text leading-tight">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Autopay section */}
      <Card>
        <CardHeader title="Autopay" icon="fa-sync-alt" />
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface2 border border-white/[0.07] flex items-center justify-center mb-4">
            <i className="fas fa-sync-alt text-muted-text text-lg" />
          </div>
          <p className="text-secondary-text text-sm mb-1 font-medium">No autopay schedules set</p>
          <p className="text-muted-text text-xs">
            Autopay for recurring bills will be available in a future update.
          </p>
        </div>
      </Card>
    </div>
  );
}