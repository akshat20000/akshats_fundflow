import { useState, useCallback } from 'react';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';
import useMetaMask, { MM_STATUS } from '@/hooks/useMetaMask';
import { ETH_TO_USD_RATE } from '@/utils/constants';
import { formatUSD } from '@/utils/format';

// ── Stage constants ──
const STAGE = {
  AMOUNT:  'amount',
  METHOD:  'method',
  PAY:     'pay',
  SUCCESS: 'success',
};

// ── Payment methods ──
const METHODS = [
  { id: 'card',       label: 'Credit / Debit Card', icon: 'fa-credit-card',  color: '#60a5fa', simulated: true  },
  { id: 'netbanking', label: 'Net Banking',          icon: 'fa-university',   color: '#34d399', simulated: true  },
  { id: 'paypal',     label: 'PayPal',               icon: 'fa-paypal',       color: '#003087', simulated: true  },
  { id: 'metamask',   label: 'MetaMask (Sepolia)',   icon: 'fa-ethereum',     color: '#f6851b', simulated: false },
];

export default function AddMoneyModal({ isOpen, onClose }) {
  const { addFunds, fetchTransactions, fetchBalance } = useWalletStore();
  const { user } = useAuthStore();
  const mm = useMetaMask();

  const [stage,         setStage]         = useState(STAGE.AMOUNT);
  const [amount,        setAmount]        = useState('');
  const [amountErr,     setAmountErr]     = useState('');
  const [method,        setMethod]        = useState(null);
  const [processing,    setProcessing]    = useState(false);
  const [serverErr,     setServerErr]     = useState('');
  const [addedAmount,   setAddedAmount]   = useState(0);

  const ethAmount = parseFloat(amount) > 0 ? parseFloat(amount) / ETH_TO_USD_RATE : 0;

  // ── Reset on close ──
  function handleClose() {
    if (processing || mm.isLoading) return; // block close while processing
    setStage(STAGE.AMOUNT);
    setAmount('');
    setAmountErr('');
    setMethod(null);
    setProcessing(false);
    setServerErr('');
    mm.reset();
    onClose();
  }

  // ── Stage 1: Validate amount → go to method selection ──
  function handleAmountSubmit(e) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0)   { setAmountErr('Enter a valid amount.'); return; }
    if (val < 1)            { setAmountErr('Minimum amount is $1.00.'); return; }
    if (val > 10000)        { setAmountErr('Maximum amount is $10,000.'); return; }
    setAmountErr('');
    setStage(STAGE.METHOD);
  }

  // ── Stage 2: Select method → go to payment ──
  function handleMethodSelect(m) {
    setMethod(m);
    setServerErr('');
    mm.reset();
    setStage(STAGE.PAY);
  }

  // ── Stage 3a: Simulated payment ──
  async function handleSimulatedPay() {
    setProcessing(true);
    setServerErr('');

    // Fake a 1.5s "processing" delay
    await new Promise(r => setTimeout(r, 1500));

    const res = await addFunds(parseFloat(amount), `Added via ${method.label} (Simulated)`);
    if (res.success) {
      await Promise.all([fetchTransactions(user.id), fetchBalance(user.id)]);
      setAddedAmount(parseFloat(amount));
      setStage(STAGE.SUCCESS);
    } else {
      setServerErr(res.error || 'Payment failed. Please try again.');
    }
    setProcessing(false);
  }

  // ── Stage 3b: MetaMask payment ──
  async function handleMetaMaskConnect() {
    setServerErr('');
    const ok = await mm.connect();
    if (!ok) setServerErr(mm.error || 'Connection failed.');
  }

  async function handleMetaMaskPay() {
    setServerErr('');
    const result = await mm.deposit(parseFloat(amount));

    if (!result.success) {
      setServerErr(result.error || 'Transaction failed.');
      return;
    }

    // Update Supabase balance
    const res = await addFunds(
      parseFloat(amount),
      `MetaMask Deposit (Sepolia) · TX: ${result.txHash?.slice(0, 10)}…`
    );

    if (res.success) {
      await Promise.all([fetchTransactions(user.id), fetchBalance(user.id)]);
      setAddedAmount(parseFloat(amount));
      setStage(STAGE.SUCCESS);
    } else {
      // Blockchain succeeded but DB failed — store for recovery
      localStorage.setItem(
        `pendingUpdate_${result.txHash}`,
        JSON.stringify({ txHash: result.txHash, amount: parseFloat(amount), timestamp: Date.now() })
      );
      setServerErr(`Deposit confirmed on-chain but balance update failed: ${res.error}. Please contact support with TX: ${result.txHash?.slice(0, 10)}`);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-box max-w-[500px]">
        {/* Top accent */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.55), transparent)' }} />

        {/* Close */}
        <button
          onClick={handleClose}
          disabled={processing || mm.isLoading}
          className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center
            text-muted-text hover:text-negative hover:bg-negative/10 rounded-md
            transition-all text-lg bg-transparent border-none cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed"
        >×</button>

        {/* ════════════════════════════════════
            STAGE 1 — Amount input
        ════════════════════════════════════ */}
        {stage === STAGE.AMOUNT && (
          <div>
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl
                bg-cyan/10 border border-cyan/25 mb-4"
                style={{ boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
                <i className="fas fa-plus text-cyan text-lg" />
              </div>
              <h2 className="font-display text-xl font-bold text-primary-text tracking-tight">Add Funds</h2>
              <p className="text-secondary-text text-sm mt-1">How much would you like to add?</p>
            </div>

            <form onSubmit={handleAmountSubmit} noValidate>
              {/* Big amount input */}
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-bold text-2xl text-muted-text pointer-events-none">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setAmountErr(''); }}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  autoFocus
                  className={`w-full pl-10 pr-4 py-5 bg-elevated border rounded-xl
                    font-display font-bold text-3xl text-primary-text placeholder-muted-text
                    outline-none transition-all duration-150
                    ${amountErr ? 'border-negative/50' : 'border-white/[0.07] focus:border-cyan/40'}
                  `}
                  style={!amountErr ? { ':focus': { boxShadow: '0 0 0 3px rgba(0,212,255,0.1)' } } : {}}
                />
              </div>

              {amountErr && (
                <p className="text-xs text-negative mb-4 flex items-center gap-1.5">
                  <i className="fas fa-circle-exclamation" />{amountErr}
                </p>
              )}

              {/* Quick amount chips */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[10, 25, 50, 100, 250].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setAmount(String(v)); setAmountErr(''); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-100 cursor-pointer
                      ${parseFloat(amount) === v
                        ? 'bg-cyan/10 border-cyan/35 text-cyan'
                        : 'bg-surface2 border-white/[0.07] text-secondary-text hover:border-cyan/25 hover:text-cyan'
                      }`}
                  >
                    ${v}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-cyan text-void
                  font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
                  transition-all duration-200 hover:bg-[#1adbff]"
                style={{ boxShadow: '0 4px 20px rgba(0,212,255,0.25)' }}
              >
                Continue
                <i className="fas fa-arrow-right text-[0.85em]" />
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════
            STAGE 2 — Payment method selection
        ════════════════════════════════════ */}
        {stage === STAGE.METHOD && (
          <div>
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStage(STAGE.AMOUNT)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface2
                  border border-white/[0.07] text-secondary-text hover:text-primary-text
                  hover:border-white/[0.14] transition-all bg-transparent cursor-pointer text-sm"
              >
                <i className="fas fa-arrow-left" />
              </button>
              <div>
                <h2 className="font-display text-xl font-bold text-primary-text tracking-tight leading-tight">
                  Payment Method
                </h2>
                <p className="text-secondary-text text-xs">
                  Adding <span className="text-cyan font-semibold">{formatUSD(parseFloat(amount))}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMethodSelect(m)}
                  className="group flex items-center justify-between p-4 rounded-xl border
                    border-white/[0.07] bg-surface2 hover:border-white/[0.18]
                    hover:-translate-y-0.5 transition-all duration-150 cursor-pointer text-left"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${m.color}18`, border: `1px solid ${m.color}30` }}
                    >
                      <i className={`fab ${m.icon} text-base`} style={{ color: m.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-text">{m.label}</p>
                      {m.simulated && (
                        <p className="text-2xs text-muted-text mt-0.5">Simulated (demo only)</p>
                      )}
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-muted-text text-xs group-hover:text-primary-text transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            STAGE 3 — Payment (Simulated)
        ════════════════════════════════════ */}
        {stage === STAGE.PAY && method?.simulated && (
          <SimulatedPayStage
            amount={parseFloat(amount)}
            method={method}
            processing={processing}
            serverErr={serverErr}
            onPay={handleSimulatedPay}
            onBack={() => { setStage(STAGE.METHOD); setServerErr(''); setProcessing(false); }}
          />
        )}

        {/* ════════════════════════════════════
            STAGE 3 — Payment (MetaMask)
        ════════════════════════════════════ */}
        {stage === STAGE.PAY && !method?.simulated && (
          <MetaMaskPayStage
            amount={parseFloat(amount)}
            ethAmount={ethAmount}
            mm={mm}
            serverErr={serverErr}
            onConnect={handleMetaMaskConnect}
            onPay={handleMetaMaskPay}
            onBack={() => { setStage(STAGE.METHOD); setServerErr(''); mm.reset(); }}
            explorerUrl={mm.explorerUrl}
          />
        )}

        {/* ════════════════════════════════════
            STAGE 4 — Success
        ════════════════════════════════════ */}
        {stage === STAGE.SUCCESS && (
          <SuccessStage amount={addedAmount} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────
   Sub-component: Simulated Pay
────────────────────────────────────── */
function SimulatedPayStage({ amount, method, processing, serverErr, onPay, onBack }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} disabled={processing}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface2
            border border-white/[0.07] text-secondary-text hover:text-primary-text
            transition-all bg-transparent cursor-pointer text-sm disabled:opacity-40">
          <i className="fas fa-arrow-left" />
        </button>
        <div>
          <h2 className="font-display text-xl font-bold text-primary-text tracking-tight leading-tight">
            {method.label}
          </h2>
          <p className="text-secondary-text text-xs">Simulated payment (demo)</p>
        </div>
      </div>

      {/* Amount summary */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-elevated border border-white/[0.06] mb-5">
        <span className="text-sm text-secondary-text">Amount to add</span>
        <span className="font-display font-bold text-lg text-primary-text">{formatUSD(amount)}</span>
      </div>

      {/* Demo notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-warning/[0.07] border border-warning/20 mb-5">
        <i className="fas fa-flask text-warning text-sm mt-0.5 flex-shrink-0" />
        <p className="text-xs text-secondary-text leading-relaxed">
          This is a simulated payment for demonstration. No real money is charged.
          Clicking confirm will add <span className="text-warning font-semibold">{formatUSD(amount)}</span> to your FundFlow balance.
        </p>
      </div>

      {serverErr && (
        <div className="mb-4 px-3 py-2.5 rounded-md bg-negative/[0.08] border-l-2 border-negative text-negative text-xs">
          {serverErr}
        </div>
      )}

      <button
        onClick={onPay}
        disabled={processing}
        className="w-full flex items-center justify-center gap-2.5 bg-cyan text-void
          font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
          transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={!processing ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
      >
        {processing ? (
          <><i className="fas fa-spinner animate-spin-slow" /> Processing...</>
        ) : (
          <><i className="fas fa-check" /> Confirm Payment</>
        )}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────
   Sub-component: MetaMask Pay
────────────────────────────────────── */
function MetaMaskPayStage({ amount, ethAmount, mm, serverErr, onConnect, onPay, onBack, explorerUrl }) {
  const statusLabel = {
    [MM_STATUS.IDLE]:       null,
    [MM_STATUS.CONNECTING]: 'Connecting to MetaMask…',
    [MM_STATUS.CONNECTED]:  'Connected!',
    [MM_STATUS.SWITCHING]:  'Switching to Sepolia…',
    [MM_STATUS.ON_SEPOLIA]: 'Ready to pay',
    [MM_STATUS.PROCESSING]: 'Waiting for MetaMask signature…',
    [MM_STATUS.SUBMITTED]:  'Transaction submitted…',
    [MM_STATUS.CONFIRMING]: 'Waiting for confirmation…',
    [MM_STATUS.CONFIRMED]:  'Confirmed!',
    [MM_STATUS.FAILED]:     mm.error,
  }[mm.status];

  const isConnected = mm.isConnected;
  const isLoading   = mm.isLoading;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} disabled={isLoading}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface2
            border border-white/[0.07] text-secondary-text hover:text-primary-text
            transition-all bg-transparent cursor-pointer text-sm disabled:opacity-40">
          <i className="fas fa-arrow-left" />
        </button>
        <div>
          <h2 className="font-display text-xl font-bold text-primary-text tracking-tight leading-tight">
            Pay with MetaMask
          </h2>
          <p className="text-secondary-text text-xs">Ethereum Sepolia Testnet</p>
        </div>
      </div>

      {/* Amount rows */}
      <div className="rounded-xl bg-elevated border border-white/[0.07] overflow-hidden mb-5">
        {[
          { label: 'USD Amount',   value: formatUSD(amount),               accent: false },
          { label: 'ETH Amount',   value: `${ethAmount.toFixed(8)} ETH`,   accent: true  },
          { label: 'Network',      value: 'Sepolia Testnet',               accent: false },
          { label: 'Contract',     value: 'SimpleWallet.sol',              accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] last:border-0">
            <span className="text-xs text-muted-text">{label}</span>
            <span className={`text-xs font-semibold font-mono ${accent ? 'text-cyan' : 'text-primary-text'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Status indicator */}
      {statusLabel && (
        <div className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg mb-4 text-xs font-medium
          ${mm.status === MM_STATUS.FAILED
            ? 'bg-negative/[0.08] border border-negative/20 text-negative'
            : mm.status === MM_STATUS.CONFIRMED || mm.status === MM_STATUS.ON_SEPOLIA
              ? 'bg-positive/[0.08] border border-positive/20 text-positive'
              : 'bg-cyan/[0.07] border border-cyan/20 text-cyan'
          }`}>
          {isLoading && <i className="fas fa-spinner animate-spin-slow flex-shrink-0" />}
          {mm.status === MM_STATUS.FAILED && <i className="fas fa-exclamation-circle flex-shrink-0" />}
          {(mm.status === MM_STATUS.ON_SEPOLIA || mm.status === MM_STATUS.CONFIRMED) && <i className="fas fa-check-circle flex-shrink-0" />}
          <span>{statusLabel}</span>
        </div>
      )}

      {/* Account info when connected */}
      {mm.account && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-surface2 border border-white/[0.07] mb-4">
          <div className="w-2 h-2 rounded-full bg-positive flex-shrink-0"
            style={{ boxShadow: '0 0 6px rgba(0,229,160,0.7)' }} />
          <span className="text-xs text-secondary-text">Connected: </span>
          <span className="text-xs font-mono text-primary-text">
            {mm.account.slice(0, 8)}…{mm.account.slice(-6)}
          </span>
        </div>
      )}

      {/* TX hash link */}
      {mm.txHash && (
        <div className="mb-4 px-3.5 py-3 rounded-lg bg-surface2 border border-white/[0.07]">
          <p className="text-2xs text-muted-text mb-1">Transaction</p>
          <a
            href={explorerUrl(mm.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan font-mono hover:underline break-all"
          >
            {mm.txHash.slice(0, 20)}…{mm.txHash.slice(-8)}
            <i className="fas fa-external-link-alt ml-1.5 text-[0.7rem]" />
          </a>
        </div>
      )}

      {/* Server/DB error */}
      {serverErr && (
        <div className="mb-4 px-3 py-2.5 rounded-md bg-negative/[0.08] border-l-2 border-negative text-negative text-xs">
          {serverErr}
        </div>
      )}

      {/* Action button */}
      {!isConnected ? (
        <button
          onClick={onConnect}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 font-bold text-sm rounded-lg
            py-3.5 border-none cursor-pointer transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style={{
            background: 'linear-gradient(135deg, #f6851b, #e8780a)',
            boxShadow: !isLoading ? '0 4px 20px rgba(246,133,27,0.3)' : 'none',
          }}
          onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = 'linear-gradient(135deg, #ff9530, #f39c12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #f6851b, #e8780a)'; }}
        >
          {isLoading ? (
            <><i className="fas fa-spinner animate-spin-slow" /> Connecting…</>
          ) : (
            <><i className="fab fa-ethereum" /> Connect MetaMask</>
          )}
        </button>
      ) : (
        <button
          onClick={onPay}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 font-bold text-sm rounded-lg
            py-3.5 border-none cursor-pointer transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style={{
            background: isLoading ? '' : 'linear-gradient(135deg, #f6851b, #e8780a)',
            boxShadow: !isLoading ? '0 4px 20px rgba(246,133,27,0.3)' : 'none',
          }}
          onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = 'linear-gradient(135deg, #ff9530, #f39c12)'; }}
          onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = 'linear-gradient(135deg, #f6851b, #e8780a)'; }}
        >
          {isLoading ? (
            <><i className="fas fa-spinner animate-spin-slow" /> {statusLabel || 'Processing…'}</>
          ) : (
            <><i className="fab fa-ethereum" /> Confirm Deposit · {ethAmount.toFixed(6)} ETH</>
          )}
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────
   Sub-component: Success
────────────────────────────────────── */
function SuccessStage({ amount, onClose }) {
  return (
    <div className="text-center py-4">
      {/* Animated checkmark */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'rgba(0,229,160,0.3)' }}
        />
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(0,229,160,0.12)',
            border: '2px solid rgba(0,229,160,0.4)',
            boxShadow: '0 0 24px rgba(0,229,160,0.25)',
          }}
        >
          <i className="fas fa-check text-positive text-2xl"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,160,0.6))' }} />
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold text-primary-text tracking-tight mb-2">
        Payment Successful!
      </h2>
      <p className="text-secondary-text text-sm mb-1">
        <span className="font-display font-bold text-positive text-lg">{formatUSD(amount)}</span>
        {' '}has been added to your wallet.
      </p>
      <p className="text-muted-text text-xs mb-8">Your balance has been updated.</p>

      <button
        onClick={onClose}
        className="inline-flex items-center justify-center gap-2 bg-cyan text-void
          font-bold text-sm rounded-lg py-3 px-8 border-none cursor-pointer
          transition-all duration-200 hover:bg-[#1adbff]"
        style={{ boxShadow: '0 4px 20px rgba(0,212,255,0.25)' }}
      >
        <i className="fas fa-check" />
        Done
      </button>
    </div>
  );
}