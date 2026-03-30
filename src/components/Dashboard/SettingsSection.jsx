import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { SectionHeader } from '@/components/Shared';
import { Card, CardHeader, Alert } from '@/components/ui';

export default function SettingsSection() {
  const { profile, user, updateProfile } = useAuthStore();

  const [form,    setForm]    = useState({ full_name: '', phone_number: '' });
  const [saving,  setSaving]  = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  // Seed form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        full_name:    profile.full_name    || '',
        phone_number: profile.phone_number || '',
      });
    }
  }, [profile]);

  function handleChange(field) {
    return (e) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
      if (result) setResult(null);
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const res = await updateProfile({
      full_name:    form.full_name.trim()    || null,
      phone_number: form.phone_number.trim() || null,
    });

    if (res.success) {
      setResult({ success: true, message: 'Profile updated successfully.' });
    } else {
      setResult({ success: false, message: res.error || 'Failed to update profile.' });
    }
    setSaving(false);
  }

  const displayName = profile?.full_name || profile?.username || 'User';

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Manage your profile and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Personal Info ── */}
        <div>
          <Card>
            <CardHeader title="Personal Information" icon="fa-user-edit" />

            {/* Profile overview */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-elevated border border-white/[0.06]">
              <div className="w-14 h-14 rounded-full bg-cyan/10 border-2 border-cyan/30 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 0 16px rgba(0,212,255,0.15)' }}>
                <span className="font-display font-bold text-xl text-cyan uppercase">
                  {displayName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-display font-bold text-base text-primary-text">{displayName}</p>
                <p className="text-xs text-muted-text font-mono mt-0.5">{user?.email}</p>
                <p className="text-xs text-muted-text font-mono">{profile?.username}@fundflow</p>
              </div>
            </div>

            {result && (
              <div className="mb-5">
                <Alert message={result.message} variant={result.success ? 'success' : 'danger'} />
              </div>
            )}

            <form onSubmit={handleSave} noValidate>
              {/* Read-only fields */}
              <div className="mb-4">
                <label className="ff-label">Username</label>
                <div className="relative">
                  <i className="fas fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="ff-input pl-10 opacity-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-2xs text-muted-text mt-1">Username cannot be changed after registration.</p>
              </div>

              <div className="mb-4">
                <label className="ff-label">Email Address</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="ff-input pl-10 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Editable fields */}
              <div className="mb-4">
                <label className="ff-label">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={handleChange('full_name')}
                  placeholder="Your full name"
                  className="ff-input"
                  disabled={saving}
                />
              </div>

              <div className="mb-6">
                <label className="ff-label">Phone Number</label>
                <div className="relative">
                  <i className="fas fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={handleChange('phone_number')}
                    placeholder="+91 XXXXX XXXXX"
                    className="ff-input pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-cyan text-void
                  font-bold text-sm rounded-lg py-3 px-6 border-none cursor-pointer
                  transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={!saving ? { boxShadow: '0 4px 16px rgba(0,212,255,0.25)' } : {}}
              >
                {saving ? (
                  <><i className="fas fa-spinner animate-spin-slow" /> Saving...</>
                ) : (
                  <><i className="fas fa-check" /> Save Changes</>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div>
          {/* Security card */}
          <Card>
            <CardHeader title="Security" icon="fa-shield-halved" />
            <div className="flex flex-col gap-1">
              {[
                { label: 'Email Verified',      icon: 'fa-envelope-circle-check', status: true,  note: user?.email_confirmed_at ? 'Confirmed' : 'Pending confirmation' },
                { label: 'Password Protection', icon: 'fa-lock',                 status: true,  note: 'Managed by Supabase Auth' },
                { label: 'Two-Factor Auth',     icon: 'fa-mobile-screen',        status: false, note: 'Not enabled (coming soon)' },
              ].map(({ label, icon, status, note }) => (
                <div key={label} className="flex items-center justify-between py-3.5 border-b border-white/[0.06] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                      ${status ? 'bg-positive/10 border border-positive/20' : 'bg-surface2 border border-white/[0.07]'}`}>
                      <i className={`fas ${icon} text-xs ${status ? 'text-positive' : 'text-muted-text'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-text">{label}</p>
                      <p className="text-2xs text-muted-text">{note}</p>
                    </div>
                  </div>
                  <span className={`text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                    ${status
                      ? 'bg-positive/10 text-positive border border-positive/20'
                      : 'bg-surface2 text-muted-text border border-white/[0.07]'
                    }`}>
                    {status ? 'Active' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Web3 / Wallet info card */}
          <Card>
            <CardHeader title="Web3 Wallet" icon="fa-ethereum" />
            <div className="flex flex-col gap-1">
              {[
                { label: 'Network',         value: 'Sepolia Testnet',  accent: '#00d4ff' },
                { label: 'Smart Contract',  value: 'SimpleWallet.sol', accent: '#a78bfa' },
                { label: 'Deposits via',    value: 'MetaMask',         accent: '#f6851b' },
              ].map(({ label, value, accent }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
                  <span className="text-sm text-secondary-text">{label}</span>
                  <span className="text-xs font-semibold font-mono px-2.5 py-1 rounded-md"
                    style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-2xs text-muted-text mt-4 leading-relaxed">
              FundFlow uses a non-custodial approach for Web3 deposits — your MetaMask wallet signs every transaction directly. We never hold your private keys.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}