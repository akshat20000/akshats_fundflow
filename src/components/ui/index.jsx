// src/components/ui/index.jsx
// All reusable primitives in one file — import what you need
import { useEffect } from 'react';

// ── Button ──────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer border-none transition-all duration-200 whitespace-nowrap';

  const variants = {
    primary:   'bg-cyan text-void rounded-md hover:bg-[#1adbff] active:scale-[0.98] disabled:bg-surface2 disabled:text-muted-text disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
    secondary: 'bg-surface2 text-primary-text border border-white/[0.07] rounded-md hover:border-cyan/40 hover:text-cyan hover:bg-cyan/10 disabled:opacity-40 disabled:cursor-not-allowed',
    ghost:     'bg-transparent border border-white/[0.07] text-secondary-text rounded-md hover:border-white/[0.14] hover:text-primary-text',
    danger:    'bg-transparent border border-white/[0.07] text-secondary-text rounded-md hover:border-negative/40 hover:text-negative hover:bg-negative/[0.08]',
    orange:    'bg-gradient-to-br from-[#f6851b] to-[#e8780a] text-white rounded-md hover:from-[#ff9530] hover:to-[#f39c12] disabled:bg-surface2 disabled:text-muted-text disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'text-xs px-3 py-[7px]',
    md: 'text-sm px-5 py-[10px]',
    lg: 'text-base px-6 py-[13px]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variant === 'primary' && !disabled ? undefined : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="mb-5 text-left">
      {label && <label className="ff-label">{label}</label>}
      <input
        className={`ff-input ${error ? 'border-negative/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-negative">{error}</p>}
    </div>
  );
}

// ── Select ──────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="mb-5 text-left">
      {label && <label className="ff-label">{label}</label>}
      <select
        className={`ff-select ${error ? 'border-negative/50' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-negative">{error}</p>}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`ff-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, icon, children }) {
  return (
    <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.07]">
      <h3 className="flex items-center gap-2.5 text-base font-semibold text-primary-text m-0">
        {icon && <i className={`fas ${icon} text-cyan text-sm`} />}
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, icon, children, maxWidth = 'max-w-[480px]' }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal-box ${maxWidth}`}>
        {/* Top accent line */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,153,187,0.5), transparent)' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center text-muted-text hover:text-negative hover:bg-negative/10 rounded-md transition-all duration-150 text-lg leading-none bg-transparent border-none cursor-pointer"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Title */}
        {title && (
          <h2 className="flex items-center justify-center gap-2.5 text-[1.15rem] font-bold text-primary-text text-center mb-6">
            {icon && <i className={`fas ${icon} text-cyan text-[0.95em]`} />}
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────
export function Badge({ children, variant = 'cyan' }) {
  const styles = {
    cyan:    'badge-cyan',
    success: 'badge-success',
    danger:  'badge-danger',
    warning: 'badge-warning',
  };
  return <span className={styles[variant]}>{children}</span>;
}

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'sm', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg
      className={`animate-spin-slow ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, message }) {
  return (
    <div className="text-center py-8 text-muted-text text-sm italic">
      {icon && <i className={`fas ${icon} text-2xl mb-3 block opacity-40`} />}
      {message}
    </div>
  );
}

// ── Alert ──────────────────────────────────────────────────
export function Alert({ message, variant = 'danger', className = '' }) {
  if (!message) return null;
  const styles = {
    danger:  'bg-negative/[0.08] border-l-2 border-negative text-negative',
    success: 'bg-positive/[0.08] border-l-2 border-positive text-positive',
    warning: 'bg-warning/[0.08] border-l-2 border-warning text-warning',
    info:    'bg-cyan/[0.08] border-l-2 border-cyan text-cyan',
  };
  return (
    <div className={`${styles[variant]} rounded-md px-3 py-2 text-xs font-medium ${className}`}>
      {message}
    </div>
  );
}

// ── Section Header ──────────────────────────────────────────
export function SectionHeader({ title, children }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      <div className="flex items-center gap-2.5 flex-wrap">{children}</div>
    </div>
  );
}