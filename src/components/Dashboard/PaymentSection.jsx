import { useState, useRef, useEffect } from 'react';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';
import { TransactionList, SectionHeader } from '@/components/shared';
import { Card, CardHeader, Alert } from '@/components/ui';
import { formatUSD } from '@/utils/format';

export default function PaymentsSection({ onNavigate }) {
  const { balance, transactions, contacts, transferFunds, fetchTransactions, fetchBalance } = useWalletStore();
  const { user, profile } = useAuthStore();

  const [form, setForm]       = useState({ recipient: '', amount: '', note: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null); // { success, message, error }

  const recipientRef = useRef(null);

  // Auto-focus recipient if navigated here from a contact send
  useEffect(() => {
    const stored = sessionStorage.getItem('ff_send_to');
    if (stored) {
      setForm(f => ({ ...f, recipient: stored }));
      sessionStorage.removeItem('ff_send_to');
      recipientRef.current?.focus();
    }
  }, []);

  // Payment history = outgoing transactions
  const paymentHistory = transactions.filter(tx => tx.type !== 'income').slice(0, 8);

  function validate() {
    const e = {};
    if (!form.recipient.trim())          e.recipient = 'Recipient is required.';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0)
      e.amount = 'Enter a valid amount.';
    else if (parseFloat(form.amount) > balance)
      e.amount = `Insufficient balance (${formatUSD(balance)} available).`;
    return e;
  }

  function handleChange(field) {
    return (e) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
      if (result) setResult(null);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    // Prevent self-send
    const id = form.recipient.trim().toLowerCase();
    if (id === user?.email?.toLowerCase() || id === profile?.username?.toLowerCase()) {
      setErrors({ recipient: 'You cannot send money to yourself.' });
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await transferFunds(form.recipient.trim(), parseFloat(form.amount), form.note.trim());

    if (res.success) {
      setResult({ success: true, message: `Sent ${formatUSD(parseFloat(form.amount))} successfully!` });
      setForm({ recipient: '', amount: '', note: '' });
      await Promise.all([
        fetchTransactions(user.id),
        fetchBalance(user.id),
      ]);
    } else {
      setResult({ success: false, error: res.error });
    }
    setLoading(false);
  }

  return (
    <div>
      <SectionHeader title="Payments" subtitle="Send money to anyone on FundFlow" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Send Money form — 2 cols ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Send Money" icon="fa-paper-plane" />

            {/* Balance chip */}
            <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-elevated border border-white/[0.06]">
              <span className="text-2xs text-muted-text uppercase tracking-wider font-semibold">Your Balance</span>
              <span className="font-display font-bold text-sm text-positive">{formatUSD(balance)}</span>
            </div>

            {/* Result banner */}
            {result && (
              <div className="mb-4">
                <Alert
                  message={result.success ? result.message : result.error}
                  variant={result.success ? 'success' : 'danger'}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Recipient */}
              <div className="mb-4">
                <label className="ff-label">Recipient (email or username)</label>
                <div className="relative">
                  <i className="fas fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                  <input
                    id="recipient-input"
                    ref={recipientRef}
                    type="text"
                    value={form.recipient}
                    onChange={handleChange('recipient')}
                    placeholder="user@example.com or username"
                    className={`ff-input pl-10 ${errors.recipient ? 'border-negative/50' : ''}`}
                    disabled={loading}
                    list="contacts-datalist"
                  />
                  {/* Datalist for contact suggestions */}
                  <datalist id="contacts-datalist">
                    {contacts.map(c => (
                      <option key={c.id} value={c.detail}>{c.name}</option>
                    ))}
                  </datalist>
                </div>
                {errors.recipient && (
                  <p className="mt-1.5 text-xs text-negative">{errors.recipient}</p>
                )}
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="ff-label">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none font-mono">$</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={handleChange('amount')}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className={`ff-input pl-7 ${errors.amount ? 'border-negative/50' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1.5 text-xs text-negative">{errors.amount}</p>
                )}
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="ff-label">Note (optional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={handleChange('note')}
                  placeholder="What's this for?"
                  className="ff-input"
                  disabled={loading}
                  maxLength={120}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-cyan text-void
                  font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
                  transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={!loading ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1adbff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner animate-spin-slow" />
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" />
                    Send Securely
                  </>
                )}
              </button>
            </form>
          </Card>

          {/* Receive info card */}
          <Card>
            <CardHeader title="Receive Money" icon="fa-qrcode" />
            <div className="text-center py-3">
              <div className="inline-flex items-center gap-2 bg-elevated border border-white/[0.07]
                rounded-lg px-4 py-2.5 mb-3 font-mono text-sm text-primary-text">
                {profile?.username || 'user'}@fundflow
              </div>
              <p className="text-secondary-text text-xs">
                Share your FundFlow ID so others can send you money.
              </p>
            </div>
          </Card>
        </div>

        {/* ── Payment history — 3 cols ── */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="Payment History" icon="fa-history">
              <button
                onClick={() => onNavigate('activity')}
                className="text-2xs text-cyan font-semibold hover:opacity-70 transition-opacity
                  bg-transparent border-none cursor-pointer uppercase tracking-wider"
              >
                Full log →
              </button>
            </CardHeader>
            <TransactionList
              transactions={paymentHistory}
              compact
              emptyMessage="No outgoing payments yet."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}