import { Link } from 'react-router-dom';

const GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E")`;

// ── Feature card data ──
const FEATURES = [
  {
    icon: 'fa-bolt',
    title: 'Instant Transfers',
    desc: 'Send money to anyone on FundFlow instantly using email or username.',
  },
  {
    icon: 'fa-users',
    title: 'Group Wallets',
    desc: 'Pool funds with friends, track contributions, and withdraw your share anytime.',
  },
  {
    icon: 'fa-ethereum',
    title: 'Web3 Deposits',
    desc: 'Add funds directly via MetaMask on the Ethereum Sepolia testnet.',
  },
  {
    icon: 'fa-shield-halved',
    title: 'Secure by Design',
    desc: 'Row-level security, server-side RPC functions, and non-custodial Web3 keys.',
  },
];

// ── Tech stack badges ──
const TECH = [
  { label: 'React 18', icon: 'fa-react', color: '#61dafb' },
  { label: 'Supabase', icon: 'fa-database', color: '#3ecf8e' },
  { label: 'Ethereum', icon: 'fa-ethereum', color: '#627eea' },
  { label: 'MetaMask', icon: 'fa-wallet', color: '#f6851b' },
  { label: 'Tailwind CSS', icon: 'fa-wind', color: '#38bdf8' },
  { label: 'Vite', icon: 'fa-bolt', color: '#a855f7' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-main text-primary-text relative overflow-x-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ backgroundImage: GRID_SVG }} />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(0,212,255,0.08) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle at 30% 80%, rgba(0,212,255,0.05) 0%, transparent 60%)' }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(0,212,255,0.15)' }}>
            <i className="fas fa-wallet text-cyan" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.6))' }} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Fund<span className="text-cyan">Flow</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/signin"
            className="text-secondary-text hover:text-primary-text text-sm font-medium transition-colors px-4 py-2 no-underline">
            Sign In
          </Link>
          <Link to="/signup"
            className="flex items-center gap-2 bg-cyan text-void text-sm font-bold px-5 py-2.5 rounded-lg no-underline transition-all duration-200 hover:bg-[#1adbff]"
            style={{ boxShadow: '0 4px 16px rgba(0,212,255,0.25)' }}>
            Get Started
            <i className="fas fa-arrow-right text-[0.8em]" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-cyan/[0.08] border border-cyan/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
          <span className="text-xs font-semibold text-cyan tracking-wide uppercase">
            Now live on Sepolia Testnet
          </span>
        </div>

        <h1 className="font-display text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05]">
          Digital finance,{' '}
          <br />
          <span className="text-gradient-cyan">reimagined.</span>
        </h1>

        <p className="text-secondary-text text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          FundFlow combines a modern digital wallet with real Ethereum blockchain
          integration. Send money, split expenses, and deposit funds via MetaMask —
          all in one place.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup"
            className="flex items-center gap-2.5 bg-cyan text-void font-bold text-base px-7 py-4 rounded-xl no-underline transition-all duration-200 hover:bg-[#1adbff] hover:-translate-y-0.5"
            style={{ boxShadow: '0 6px 24px rgba(0,212,255,0.3)' }}>
            <i className="fas fa-rocket" />
            Create Free Account
          </Link>
          <Link to="/signin"
            className="flex items-center gap-2.5 bg-surface border border-white/[0.08] text-primary-text font-semibold text-base px-7 py-4 rounded-xl no-underline transition-all duration-200 hover:border-white/[0.16] hover:-translate-y-0.5"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            Sign In
          </Link>
        </div>

        {/* Hero stats */}
        <div className="flex items-center justify-center gap-10 mt-16 flex-wrap">
          {[
            { value: 'Web3', label: 'Powered' },
            { value: '100%', label: 'Open Source' },
            { value: 'Sepolia', label: 'Testnet' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-extrabold text-primary-text mb-0.5">{value}</p>
              <p className="text-xs text-muted-text uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 px-6 lg:px-16 pb-24 max-w-6xl mx-auto">
        {/* Section label */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-cyan uppercase tracking-widest mb-3">Features</p>
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight">
            Everything you need
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title}
              className="group relative bg-surface border border-white/[0.07] rounded-xl p-6 overflow-hidden transition-all duration-300 hover:border-cyan/25 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />

              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-4">
                  <i className={`fas ${icon} text-cyan text-sm`} />
                </div>
                <h3 className="font-display font-bold text-base text-primary-text mb-2">{title}</h3>
                <p className="text-secondary-text text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="relative z-10 px-6 lg:px-16 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-muted-text uppercase tracking-widest mb-3">Built with</p>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Modern tech stack</h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {TECH.map(({ label, icon, color }) => (
              <div key={label}
                className="flex items-center gap-2.5 bg-surface border border-white/[0.07] rounded-lg px-4 py-2.5 text-sm font-medium text-secondary-text transition-all duration-200 hover:border-white/[0.14] hover:text-primary-text">
                <i className={`fab ${icon}`} style={{ color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-surface border border-white/[0.07] rounded-2xl p-12 text-center overflow-hidden"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(0,212,255,0.05)' }}>

            {/* Glow decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)' }} />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />

            <div className="relative">
              <h2 className="font-display text-3xl font-extrabold tracking-tight mb-4">
                Ready to get started?
              </h2>
              <p className="text-secondary-text mb-8 leading-relaxed">
                Create your free FundFlow account in under a minute.<br />
                No credit card required.
              </p>
              <Link to="/signup"
                className="inline-flex items-center gap-2.5 bg-cyan text-void font-bold text-base px-8 py-4 rounded-xl no-underline transition-all duration-200 hover:bg-[#1adbff] hover:-translate-y-0.5"
                style={{ boxShadow: '0 6px 24px rgba(0,212,255,0.3)' }}>
                <i className="fas fa-user-plus" />
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-wallet text-cyan text-sm" />
            <span className="font-display font-bold text-sm">Fund<span className="text-cyan">Flow</span></span>
          </div>
          <p className="text-xs text-muted-text">
            © 2025 FundFlow. Built with React, Supabase & Ethereum.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/akshat20000/FundFlow" target="_blank" rel="noopener noreferrer"
              className="text-muted-text hover:text-primary-text text-sm transition-colors flex items-center gap-1.5 no-underline">
              <i className="fab fa-github" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}