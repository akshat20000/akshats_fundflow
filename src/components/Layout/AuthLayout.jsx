import { Link } from 'react-router-dom';

// Shared background grid pattern as inline SVG data URI
const GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E")`;

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-main flex flex-col relative overflow-hidden">

      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: GRID_SVG }} />

        {/* Top-right cyan orb */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)' }}
        />
        {/* Bottom-left dim orb */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }}
        />

        {/* Horizontal scan line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-px opacity-20"
          style={{ background: 'linear-gradient(to right, transparent 0%, #00d4ff 30%, #00d4ff 70%, transparent 100%)' }}
        />
      </div>

      {/* ── Nav ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-md bg-cyan/10 border border-cyan/30 flex items-center justify-center">
            <i className="fas fa-wallet text-cyan text-sm" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.6))' }} />
          </div>
          <span className="font-display font-bold text-lg text-primary-text tracking-tight">
            Fund<span className="text-cyan">Flow</span>
          </span>
        </Link>
      </header>

      {/* ── Content ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center pb-6 text-2xs text-muted-text">
        © 2025 FundFlow. All rights reserved.
      </footer>
    </div>
  );
}