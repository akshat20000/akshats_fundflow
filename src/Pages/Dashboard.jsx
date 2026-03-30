import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import useWalletStore from '@/store/useWalletStore';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Spinner } from '@/components/ui';

// Section components (stubs for now, replaced in Section 5)
import {
  HomeSection,
  PaymentsSection,
  ContactsSection,
  GroupsSection,
  BillsSection,
  ActivitySection,
  SettingsSection,
} from '@/components/Dashboard/SectionStubs';

const SECTIONS = {
  home:     HomeSection,
  payments: PaymentsSection,
  contacts: ContactsSection,
  groups:   GroupsSection,
  bills:    BillsSection,
  activity: ActivitySection,
  settings: SettingsSection,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loadAll } = useWalletStore();

  function getSectionFromHash() {
    const hash = window.location.hash.replace('#', '');
    return SECTIONS[hash] ? hash : 'home';
  }

  const [activeSection, setActiveSection] = useState(getSectionFromHash);
  const [dataLoading, setDataLoading]     = useState(true);

  useEffect(() => {
    if (!user) { navigate('/signin', { replace: true }); return; }
    async function bootstrap() {
      setDataLoading(true);
      await loadAll(user.id);
      setDataLoading(false);
    }
    bootstrap();
  }, [user, navigate, loadAll]);

  useEffect(() => {
    function onHashChange() { setActiveSection(getSectionFromHash()); }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
  }, []);

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-14 h-14 rounded-2xl bg-cyan/10 border border-cyan/25 flex items-center justify-center"
            style={{ boxShadow: '0 0 28px rgba(0,212,255,0.2)', animation: 'pulse 2s ease-in-out infinite' }}
          >
            <i className="fas fa-wallet text-cyan text-2xl"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.7))' }} />
          </div>
          <div className="flex items-center gap-3">
            <Spinner size="sm" className="text-cyan" />
            <span className="text-secondary-text text-sm">Loading your wallet...</span>
          </div>
          <div className="flex flex-col gap-2 w-48 mt-2">
            {[100, 75, 88].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-surface"
                style={{ width: `${w}%`, animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ActiveSectionComponent = SECTIONS[activeSection] || HomeSection;

  return (
    <DashboardLayout activeSection={activeSection} onNavigate={handleNavigate}>
      <div key={activeSection} className="animate-fade-in">
        <ActiveSectionComponent onNavigate={handleNavigate} />
      </div>
    </DashboardLayout>
  );
}