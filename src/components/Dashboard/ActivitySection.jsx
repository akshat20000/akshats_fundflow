import { useState, useMemo } from 'react';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';
import { TransactionList, SectionHeader, SearchInput, StatCard } from '@/components/shared';
import { Card, CardHeader, Modal, Alert } from '@/components/ui';
import { formatUSD } from '@/utils/format';

const TYPE_OPTIONS = [
  { value: 'all',      label: 'All Types' },
  { value: 'income',   label: 'Income' },
  { value: 'expense',  label: 'Expense' },
  { value: 'bill',     label: 'Bills' },
  { value: 'recharge', label: 'Recharge' },
];

export default function ActivitySection() {
  const { transactions, loadingTransactions, logTransaction, fetchTransactions, fetchBalance } = useWalletStore();
  const { user } = useAuthStore();

  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [logOpen,     setLogOpen]     = useState(false);
  const [logForm,     setLogForm]     = useState({ type: '', amount: '', description: '' });
  const [logErr,      setLogErr]      = useState({});
  const [logging,     setLogging]     = useState(false);
  const [logResult,   setLogResult]   = useState(null);

  // ── Stats ──
  const totalIncome  = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type !== 'income').reduce((s, t) => s + t.amount, 0), [transactions]);

  // ── Log transaction ──
  function openLog() {
    setLogForm({ type: '', amount: '', description: '' });
    setLogErr({});
    setLogResult(null);
    setLogOpen(true);
  }

  function validateLog() {
    const e = {};
    if (!logForm.type)   e.type   = 'Select a type.';
    const amt = parseFloat(logForm.amount);
    if (!amt || amt <= 0) e.amount = 'Enter a valid amount.';
    return e;
  }

  async function handleLog(e) {
    e.preventDefault();
    const v = validateLog();
    if (Object.keys(v).length) { setLogErr(v); return; }
    setLogging(true);
    setLogResult(null);

    const res = await logTransaction(logForm.type, parseFloat(logForm.amount), logForm.description.trim());
    if (res.success) {
      setLogResult({ success: true, message: 'Transaction logged successfully.' });
      await Promise.all([fetchTransactions(user.id), fetchBalance(user.id)]);
      setTimeout(() => setLogOpen(false), 1000);
    } else {
      setLogResult({ success: false, message: res.error });
    }
    setLogging(false);
  }

  return (
    <div>
      <SectionHeader title="Activity" subtitle={`${transactions.length} total transaction${transactions.length !== 1 ? 's' : ''}`}>
        <button onClick={openLog} className="btn-primary text-sm">
          <i className="fas fa-plus" />
          Log Transaction
        </button>
      </SectionHeader>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Income"       value={formatUSD(totalIncome)}  icon="fa-arrow-down" accent="positive" />
        <StatCard label="Total Expenses"     value={formatUSD(totalExpense)} icon="fa-arrow-up"   accent="negative" />
        <StatCard label="Total Transactions" value={transactions.length}     icon="fa-receipt"    accent="cyan"     />
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search transactions..." className="flex-1 min-w-[200px]" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                ${typeFilter === opt.value
                  ? 'bg-cyan/10 border-cyan/35 text-cyan'
                  : 'bg-surface2 border-white/[0.07] text-secondary-text hover:border-white/[0.14] hover:text-primary-text'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transaction list ── */}
      <Card>
        <CardHeader title="Full Statement" icon="fa-list-ul" />
        <TransactionList
          transactions={transactions}
          loading={loadingTransactions}
          compact={false}
          searchTerm={search}
          filterType={typeFilter}
          emptyMessage="No transactions yet."
        />
      </Card>

      {/* ── Log Transaction Modal ── */}
      <Modal isOpen={logOpen} onClose={() => setLogOpen(false)} title="Log Transaction" icon="fa-edit">
        {logResult && (
          <div className="mb-4">
            <Alert message={logResult.message} variant={logResult.success ? 'success' : 'danger'} />
          </div>
        )}

        <form onSubmit={handleLog} noValidate>
          <div className="mb-4">
            <label className="ff-label">Transaction Type</label>
            <select
              value={logForm.type}
              onChange={e => { setLogForm(f => ({ ...f, type: e.target.value })); setLogErr(er => ({ ...er, type: '' })); }}
              className={`ff-select ${logErr.type ? 'border-negative/50' : ''}`}
              disabled={logging}
            >
              <option value="">-- Select Type --</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            {logErr.type && <p className="mt-1.5 text-xs text-negative">{logErr.type}</p>}
          </div>

          <div className="mb-4">
            <label className="ff-label">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm font-mono pointer-events-none">$</span>
              <input
                type="number"
                value={logForm.amount}
                onChange={e => { setLogForm(f => ({ ...f, amount: e.target.value })); setLogErr(er => ({ ...er, amount: '' })); }}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className={`ff-input pl-7 ${logErr.amount ? 'border-negative/50' : ''}`}
                disabled={logging}
              />
            </div>
            {logErr.amount && <p className="mt-1.5 text-xs text-negative">{logErr.amount}</p>}
          </div>

          <div className="mb-6">
            <label className="ff-label">Description (optional)</label>
            <input
              type="text"
              value={logForm.description}
              onChange={e => setLogForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Groceries, Salary"
              className="ff-input"
              disabled={logging}
              maxLength={120}
            />
          </div>

          <button
            type="submit"
            disabled={logging}
            className="w-full flex items-center justify-center gap-2 bg-cyan text-void
              font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={!logging ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
          >
            {logging ? (
              <><i className="fas fa-spinner animate-spin-slow" /> Logging...</>
            ) : (
              <><i className="fas fa-check" /> Log Transaction</>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}