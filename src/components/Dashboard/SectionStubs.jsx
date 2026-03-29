// Temporary stubs for all dashboard sections.
// Each will be replaced with a full component in Section 5.

function SectionStub({ title, icon, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div
        className="w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-5"
        style={{ boxShadow: '0 0 24px rgba(0,212,255,0.1)' }}
      >
        <i className={`fas ${icon} text-cyan text-2xl`} />
      </div>
      <h2 className="font-display text-2xl font-bold text-primary-text mb-2 tracking-tight">
        {title}
      </h2>
      <p className="text-secondary-text text-sm max-w-xs leading-relaxed">
        {description || 'This section is coming in Section 5.'}
      </p>
    </div>
  );
}

export function HomeSection() {
  return <SectionStub title="Dashboard" icon="fa-home" description="Your balance, recent activity, and quick actions — coming in Section 5." />;
}

export function PaymentsSection() {
  return <SectionStub title="Payments" icon="fa-exchange-alt" description="Send money to contacts and manage linked accounts — coming in Section 5." />;
}

export function ContactsSection() {
  return <SectionStub title="Contacts" icon="fa-address-book" description="Your saved contacts for quick transfers — coming in Section 5." />;
}

export function GroupsSection() {
  return <SectionStub title="Groups" icon="fa-users" description="Create shared wallets and split expenses with friends — coming in Section 5." />;
}

export function BillsSection() {
  return <SectionStub title="Bills & Recharge" icon="fa-file-invoice-dollar" description="Pay bills and recharge services — coming in Section 5." />;
}

export function ActivitySection() {
  return <SectionStub title="Activity" icon="fa-list-alt" description="Your full transaction history — coming in Section 5." />;
}

export function SettingsSection() {
  return <SectionStub title="Settings" icon="fa-cog" description="Manage your profile and preferences — coming in Section 5." />;
}