import { useState } from 'react';
import { formatUSD } from '@/utils/format';
import useAuthStore from '@/store/useAuthStore';

export default function GroupItem({ group, onContribute, onWithdraw }) {
    console.log(group);
    if (!group || !group.name) return null;
    const { user } = useAuthStore();
    const [membersOpen, setMembersOpen] = useState(false);

    // Compute totals and current user's contribution
    let totalContribution = 0;
    let myContribution = 0;

    (group.group_members || []).forEach(m => {
        const amount = parseFloat(m.contribution_amount || 0);
        totalContribution += amount;
        if (m.user_id === user?.id) myContribution = amount;
    });

    const memberCount = group.group_members?.length || 0;
    const canWithdraw = myContribution > 0;

    // Deterministic color for group
    const COLORS = ['#00d4ff', '#00e5a0', '#ffb347', '#a78bfa', '#fb923c'];
    const color = COLORS[(group.name?.charCodeAt(0) || 0) % COLORS.length];

    return (
        <div
            className="bg-surface2 border border-white/[0.07] rounded-xl p-5 transition-all duration-200 hover:border-white/[0.12]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
        >
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                    {/* Group icon */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                    >
                        <i className="fas fa-users text-sm" style={{ color }} />
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-base text-primary-text leading-tight">
                            {group.name || 'Unnamed Group'}
                        </h4>
                        <p className="text-2xs text-muted-text mt-0.5">
                            {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Total badge */}
                <div
                    className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold font-display"
                    style={{
                        background: `${color}15`,
                        border: `1px solid ${color}25`,
                        color,
                    }}
                >
                    {formatUSD(totalContribution)}
                </div>
            </div>

            {/* ── My contribution bar ── */}
            {myContribution > 0 && totalContribution > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xs text-muted-text">Your share</span>
                        <span className="text-2xs font-semibold text-secondary-text">
                            {formatUSD(myContribution)} of {formatUSD(totalContribution)}
                        </span>
                    </div>
                    <div className="h-1 rounded-full bg-surface overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (myContribution / totalContribution) * 100)}%`,
                                background: `linear-gradient(to right, ${color}, ${color}99)`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── Members toggle ── */}
            <button
                onClick={() => setMembersOpen(o => !o)}
                className="flex items-center gap-2 text-2xs font-semibold text-muted-text hover:text-secondary-text
          bg-transparent border-none cursor-pointer transition-colors mb-3 p-0"
            >
                <i className={`fas fa-chevron-right text-[0.7rem] transition-transform duration-200 ${membersOpen ? 'rotate-90' : ''}`} />
                {membersOpen ? 'Hide' : 'Show'} members
            </button>

            {/* ── Members list ── */}
            {membersOpen && (
                <div className="mb-4 rounded-lg bg-surface border border-white/[0.06] overflow-hidden">
                    {(group.group_members || []).map((member, i) => {
                        //Guard: Skip if member data is missing
                        if (!member) return null;
                        const mp = member.profiles;
                        const name = mp?.username || mp?.email || (member.user_id ? `User ${member.user_id.slice(0, 6)}` : "Unknown User");
                        const isMe = member.user_id === user?.id;
                        const contribution = parseFloat(member.contribution_amount || 0);

                        return (
                            <div
                                key={member.user_id || i}
                                className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.05] last:border-b-0"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-surface2 border border-white/[0.08] flex items-center justify-center">
                                        <span className="text-2xs font-bold text-muted-text uppercase">
                                            {name.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-secondary-text">
                                        {name}
                                        {isMe && <span className="text-cyan ml-1.5 font-semibold">(You)</span>}
                                    </span>
                                </div>
                                <span className="text-xs font-display font-bold text-primary-text">
                                    {formatUSD(contribution)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => onContribute(group)}
                    className="flex items-center gap-1.5 bg-cyan/10 hover:bg-cyan/20
            border border-cyan/25 hover:border-cyan/40 text-cyan
            text-xs font-semibold px-3.5 py-2 rounded-lg
            transition-all duration-150 cursor-pointer"
                >
                    <i className="fas fa-donate text-[0.8rem]" />
                    Contribute
                </button>
                <button
                    onClick={() => canWithdraw && onWithdraw(group, myContribution)}
                    disabled={!canWithdraw}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg
            border transition-all duration-150
            ${canWithdraw
                            ? 'bg-surface2 hover:bg-elevated border-white/[0.07] hover:border-white/[0.14] text-secondary-text hover:text-primary-text cursor-pointer'
                            : 'bg-surface border-white/[0.04] text-muted-text cursor-not-allowed opacity-50'
                        }`}
                >
                    <i className="fas fa-hand-holding-usd text-[0.8rem]" />
                    Withdraw
                </button>
            </div>
        </div>
    );
}