// Reusable section header — title on the left, action slot on the right
export default function SectionHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-8 pb-6 border-b border-white/[0.07] flex-wrap ${className}`}>
      <div>
        <h2
          className="font-display font-extrabold text-primary-text tracking-tight leading-tight"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', letterSpacing: '-0.03em' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-text mt-1">{subtitle}</p>
        )}
      </div>

      {/* Action slot — buttons, search, etc. */}
      {children && (
        <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}