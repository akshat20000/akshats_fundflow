import { useState, useEffect } from 'react';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';
import { GroupItem, SectionHeader } from '@/components/Shared';
import { Card, CardHeader, Modal, Alert, EmptyState, Spinner } from '@/components/ui';
import { formatUSD } from '@/utils/format';

export default function GroupsSection() {
  const {
    groups, contacts, balance, loadingGroups,
    createGroup, contributeToGroup, withdrawFromGroup,
    fetchGroups, findUserByEmail,
  } = useWalletStore();
  const { user } = useAuthStore();

  //////////////////////

  // Inside GroupsSection.jsx
useEffect(() => {
  if (user?.id) {
    fetchGroups(user.id);
  }
}, [user?.id, fetchGroups]);

  /////////////////////////

  // ── Create modal state ──
  const [createOpen,    setCreateOpen]    = useState(false);
  const [createForm,    setCreateForm]    = useState({ name: '' });
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [memberOptions, setMemberOptions] = useState([]); // { id, label }
  const [loadingMembers,setLoadingMembers]= useState(false);
  const [createErr,     setCreateErr]     = useState('');
  const [creating,      setCreating]      = useState(false);

  // ── Contribute modal state ──
  const [contributeGroup, setContributeGroup] = useState(null);
  const [contribAmount,   setContribAmount]   = useState('');
  const [contribErr,      setContribErr]      = useState('');
  const [contributing,    setContributing]    = useState(false);

  // ── Withdraw modal state ──
  const [withdrawGroup,      setWithdrawGroup]      = useState(null);
  const [withdrawContrib,    setWithdrawContrib]    = useState(0);
  const [withdrawAmount,     setWithdrawAmount]     = useState('');
  const [withdrawErr,        setWithdrawErr]        = useState('');
  const [withdrawing,        setWithdrawing]        = useState(false);

  // Resolve contact emails → user IDs when create modal opens
  async function openCreateModal() {
    setCreateForm({ name: '' });
    setSelectedIds([]);
    setCreateErr('');
    setCreateOpen(true);
    setLoadingMembers(true);

    const options = [];
    for (const contact of contacts) {
      if (!contact?.detail) continue;
      const found = await findUserByEmail(contact.detail);
      if (found && found.id !== user?.id) {
        options.push({ id: found.id, label: `${contact.name} (${contact.detail})` });
      }
    }
    setMemberOptions(options);
    setLoadingMembers(false);
  }

  function toggleMember(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.name.trim()) { setCreateErr('Group name is required.'); return; }
    setCreating(true);
    setCreateErr('');
    const res = await createGroup(createForm.name.trim(), selectedIds);
    if (res.success) {
      setCreateOpen(false);
    } else {
      setCreateErr(res.error || 'Failed to create group.');
    }
    setCreating(false);
  }

  // ── Contribute ──
  function openContribute(group) {
    setContributeGroup(group);
    setContribAmount('');
    setContribErr('');
  }

  async function handleContribute(e) {
    e.preventDefault();
    const amount = parseFloat(contribAmount);
    if (!amount || amount <= 0) { setContribErr('Enter a valid amount.'); return; }
    if (amount > balance)        { setContribErr(`Insufficient balance (${formatUSD(balance)} available).`); return; }
    setContributing(true);
    setContribErr('');
    const res = await contributeToGroup(contributeGroup.id, amount);
    if (res.success) {
      setContributeGroup(null);
    } else {
      setContribErr(res.error || 'Failed to contribute.');
    }
    setContributing(false);
  }

  // ── Withdraw ──
  function openWithdraw(group, myContribution) {
    setWithdrawGroup(group);
    setWithdrawContrib(myContribution);
    setWithdrawAmount('');
    setWithdrawErr('');
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0)         { setWithdrawErr('Enter a valid amount.'); return; }
    if (amount > withdrawContrib)       { setWithdrawErr(`Cannot exceed your contribution (${formatUSD(withdrawContrib)}).`); return; }
    setWithdrawing(true);
    setWithdrawErr('');
    const res = await withdrawFromGroup(withdrawGroup.id, amount);
    if (res.success) {
      setWithdrawGroup(null);
    } else {
      setWithdrawErr(res.error || 'Failed to withdraw.');
    }
    setWithdrawing(false);
  }

  return (
    <div>
      <SectionHeader title="Groups" subtitle="Pool funds and split expenses with others">
        <button onClick={openCreateModal} className="btn-primary text-sm">
          <i className="fas fa-plus" />
          Create Group
        </button>
      </SectionHeader>

      {loadingGroups ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Spinner size="md" className="text-cyan" />
          <span className="text-secondary-text text-sm">Loading groups...</span>
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon="fa-users"
            message="No groups yet. Create one to start pooling funds with friends."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {groups.map(group => (
            <GroupItem
              key={group.id}
              group={group}
              onContribute={openContribute}
              onWithdraw={openWithdraw}
            />
          ))}
        </div>
      )}

      {/* ── Create Group Modal ── */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Group" icon="fa-users-cog">
        <form onSubmit={handleCreate} noValidate>
          <div className="mb-5">
            <label className="ff-label">Group Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={e => { setCreateForm(f => ({ ...f, name: e.target.value })); setCreateErr(''); }}
              placeholder="e.g. Trip to Goa"
              className="ff-input"
              disabled={creating}
            />
          </div>

          {/* Member selector */}
          <div className="mb-6">
            <label className="ff-label">
              Add Members
              <span className="text-muted-text normal-case ml-1 tracking-normal font-normal">
                (from your contacts)
              </span>
            </label>

            {loadingMembers ? (
              <div className="flex items-center gap-2 py-4 text-secondary-text text-sm">
                <Spinner size="sm" className="text-cyan" />
                Resolving contacts...
              </div>
            ) : memberOptions.length === 0 ? (
              <p className="text-muted-text text-xs py-3 italic">
                No contacts available. Add contacts first.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto rounded-lg
                border border-white/[0.07] bg-elevated p-2">
                {memberOptions.map(opt => {
                  const checked = selectedIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleMember(opt.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                        border transition-all duration-100 cursor-pointer bg-transparent
                        ${checked
                          ? 'border-cyan/30 bg-cyan/[0.07] text-primary-text'
                          : 'border-transparent hover:bg-surface2 text-secondary-text'
                        }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                        border transition-all duration-100
                        ${checked ? 'bg-cyan border-cyan' : 'border-white/20 bg-surface'}`}>
                        {checked && <i className="fas fa-check text-void text-[0.55rem]" />}
                      </div>
                      <span className="text-sm truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedIds.length > 0 && (
              <p className="text-2xs text-cyan mt-1.5">
                {selectedIds.length} member{selectedIds.length !== 1 ? 's' : ''} selected (+ you)
              </p>
            )}
          </div>

          {createErr && <Alert message={createErr} variant="danger" className="mb-4" />}

          <button
            type="submit"
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 bg-cyan text-void
              font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={!creating ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
          >
            {creating ? (
              <><i className="fas fa-spinner animate-spin-slow" /> Creating...</>
            ) : (
              <><i className="fas fa-check" /> Create Group</>
            )}
          </button>
        </form>
      </Modal>

      {/* ── Contribute Modal ── */}
      <Modal
        isOpen={!!contributeGroup}
        onClose={() => setContributeGroup(null)}
        title={`Contribute to ${contributeGroup?.name || ''}`}
        icon="fa-donate"
      >
        <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-elevated border border-white/[0.06]">
          <span className="text-2xs text-muted-text uppercase tracking-wider font-semibold">Wallet Balance</span>
          <span className="font-display font-bold text-sm text-positive">{formatUSD(balance)}</span>
        </div>

        <form onSubmit={handleContribute} noValidate>
          <div className="mb-6">
            <label className="ff-label">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm font-mono pointer-events-none">$</span>
              <input
                type="number"
                value={contribAmount}
                onChange={e => { setContribAmount(e.target.value); setContribErr(''); }}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className={`ff-input pl-7 ${contribErr ? 'border-negative/50' : ''}`}
                disabled={contributing}
              />
            </div>
            {contribErr && <p className="mt-1.5 text-xs text-negative">{contribErr}</p>}
          </div>

          <button
            type="submit"
            disabled={contributing}
            className="w-full flex items-center justify-center gap-2 bg-cyan text-void
              font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={!contributing ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
          >
            {contributing ? (
              <><i className="fas fa-spinner animate-spin-slow" /> Contributing...</>
            ) : (
              <><i className="fas fa-donate" /> Confirm Contribution</>
            )}
          </button>
        </form>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal
        isOpen={!!withdrawGroup}
        onClose={() => setWithdrawGroup(null)}
        title={`Withdraw from ${withdrawGroup?.name || ''}`}
        icon="fa-hand-holding-usd"
      >
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-elevated border border-white/[0.06] text-center">
            <p className="text-2xs text-muted-text uppercase tracking-wider font-semibold mb-1">Your Contribution</p>
            <p className="font-display font-bold text-sm text-positive">{formatUSD(withdrawContrib)}</p>
          </div>
          <div className="p-3 rounded-lg bg-elevated border border-white/[0.06] text-center">
            <p className="text-2xs text-muted-text uppercase tracking-wider font-semibold mb-1">Wallet Balance</p>
            <p className="font-display font-bold text-sm text-primary-text">{formatUSD(balance)}</p>
          </div>
        </div>

        <form onSubmit={handleWithdraw} noValidate>
          <div className="mb-6">
            <label className="ff-label">Amount to Withdraw (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm font-mono pointer-events-none">$</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => { setWithdrawAmount(e.target.value); setWithdrawErr(''); }}
                placeholder="0.00"
                min="0.01"
                max={withdrawContrib}
                step="0.01"
                className={`ff-input pl-7 ${withdrawErr ? 'border-negative/50' : ''}`}
                disabled={withdrawing}
              />
            </div>
            {withdrawErr && <p className="mt-1.5 text-xs text-negative">{withdrawErr}</p>}
            <p className="text-2xs text-muted-text mt-1.5">
              Max: {formatUSD(withdrawContrib)}
            </p>
          </div>

          <button
            type="submit"
            disabled={withdrawing}
            className="w-full flex items-center justify-center gap-2 bg-cyan text-void
              font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={!withdrawing ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
          >
            {withdrawing ? (
              <><i className="fas fa-spinner animate-spin-slow" /> Withdrawing...</>
            ) : (
              <><i className="fas fa-hand-holding-usd" /> Confirm Withdrawal</>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}