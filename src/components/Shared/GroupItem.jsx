export default function ContactItem({ contact, onSend, compact = false }) {
  const initials = contact.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Deterministic color from name
  const COLORS = [
    '#00d4ff', '#00e5a0', '#ffb347', '#ff4d6d',
    '#a78bfa', '#34d399', '#fb923c', '#60a5fa',
  ];
  const colorIndex = contact.name.charCodeAt(0) % COLORS.length;
  const accentColor = COLORS[colorIndex];

  if (compact) {
    // ── Quick contact chip (used in HomeSection) ──
    return (
      <div className="flex items-center gap-3 py-2.5 px-2 rounded-lg
        hover:bg-white/[0.02] transition-colors group">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-xs"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
          }}
        >
          {initials}
        </div>

        {/* Name + detail */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary-text truncate leading-tight">
            {contact.name}
          </p>
          <p className="text-2xs text-muted-text truncate mt-0.5">
            {contact.detail}
          </p>
        </div>

        {/* Send button */}
        {onSend && (
          <button
            onClick={() => onSend(contact)}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5
              bg-cyan/10 hover:bg-cyan/20 border border-cyan/25 hover:border-cyan/40
              text-cyan text-2xs font-semibold px-2.5 py-1.5 rounded-md
              transition-all duration-150 cursor-pointer flex-shrink-0"
          >
            <i className="fas fa-paper-plane text-[0.7rem]" />
            Send
          </button>
        )}
      </div>
    );
  }

  // ── Full contact row (used in ContactsSection) ──
  return (
    <div className="list-row group items-center">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3.5 font-display font-bold text-sm"
        style={{
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
        }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary-text truncate leading-tight">
          {contact.name}
        </p>
        <p className="text-2xs text-muted-text truncate mt-0.5 font-mono">
          {contact.detail}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {onSend && (
          <button
            onClick={() => onSend(contact)}
            className="flex items-center gap-1.5 bg-cyan/10 hover:bg-cyan/20
              border border-cyan/25 hover:border-cyan/40 text-cyan
              text-2xs font-semibold px-3 py-1.5 rounded-md
              transition-all duration-150 cursor-pointer"
          >
            <i className="fas fa-paper-plane text-[0.7rem]" />
            Send
          </button>
        )}
        <button
          className="flex items-center gap-1.5 bg-surface2 hover:bg-elevated
            border border-white/[0.07] hover:border-white/[0.14] text-secondary-text hover:text-primary-text
            text-2xs font-medium px-3 py-1.5 rounded-md
            transition-all duration-150 cursor-pointer"
        >
          <i className="fas fa-ellipsis text-[0.7rem]" />
          Details
        </button>
      </div>
    </div>
  );
}