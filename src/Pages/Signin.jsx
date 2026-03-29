import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import useWalletStore from '@/store/useWalletStore';
import AuthLayout from '@/components/layout/AuthLayout';
import { Spinner } from '@/components/ui';

export default function SignIn() {
  const navigate  = useNavigate();
  const { signIn } = useAuthStore();
  const { loadAll } = useWalletStore();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  // ── Validation ──
  function validate() {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)        e.password = 'Password is required.';
    return e;
  }

  function handleChange(field) {
    return (ev) => {
      setForm(f => ({ ...f, [field]: ev.target.value }));
      if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
      if (serverErr) setServerErr('');
    };
  }

  // ── Submit ──
  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    setServerErr('');

    const result = await signIn(form.email.trim(), form.password);

    if (!result.success) {
      const msg = result.error?.toLowerCase() || '';
      if (msg.includes('invalid login')) setServerErr('Incorrect email or password.');
      else if (msg.includes('email not confirmed')) setServerErr('Please confirm your email before signing in.');
      else setServerErr(result.error || 'Sign in failed. Please try again.');
      setLoading(false);
      return;
    }

    // Load wallet data then redirect
    const { user } = useAuthStore.getState();
    if (user) await loadAll(user.id);
    navigate('/dashboard', { replace: true });
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[420px] animate-slide-up">

        {/* ── Card ── */}
        <div className="relative bg-surface border border-white/[0.07] rounded-xl p-10 overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset' }}>

          {/* Top accent */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)' }} />

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/25 mb-4"
              style={{ boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
              <i className="fas fa-sign-in-alt text-cyan text-lg" />
            </div>
            <h1 className="font-display text-[1.65rem] font-bold text-primary-text tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-secondary-text text-sm">
              Sign in to your FundFlow account
            </p>
          </div>

          {/* ── Server error ── */}
          {serverErr && (
            <div className="mb-5 px-3 py-2.5 rounded-md bg-negative/[0.08] border-l-2 border-negative text-negative text-xs font-medium flex items-center gap-2">
              <i className="fas fa-exclamation-circle flex-shrink-0" />
              {serverErr}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="mb-5">
              <label className="block mb-2 text-2xs font-semibold text-muted-text uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`ff-input pl-10 ${errors.email ? 'border-negative/50 focus:border-negative/70' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-negative flex items-center gap-1">
                  <i className="fas fa-circle-exclamation text-[0.7rem]" />{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <label className="text-2xs font-semibold text-muted-text uppercase tracking-widest">
                  Password
                </label>
                <button type="button"
                  className="text-2xs text-cyan/70 hover:text-cyan transition-colors bg-transparent border-none cursor-pointer p-0">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`ff-input pl-10 ${errors.password ? 'border-negative/50' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-negative flex items-center gap-1">
                  <i className="fas fa-circle-exclamation text-[0.7rem]" />{errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-cyan text-void font-bold text-sm rounded-md py-3.5 px-5 cursor-pointer border-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              style={!loading ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1adbff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-void" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <i className="fas fa-arrow-right text-[0.85em]" />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-2xs text-muted-text">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* ── Sign up link ── */}
          <p className="text-center text-sm text-secondary-text">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyan font-semibold hover:text-[#1adbff] transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        {/* ── Below card note ── */}
        <p className="text-center mt-5 text-2xs text-muted-text leading-relaxed">
          By signing in you agree to our{' '}
          <span className="text-secondary-text cursor-pointer hover:text-cyan transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-secondary-text cursor-pointer hover:text-cyan transition-colors">Privacy Policy</span>
        </p>
      </div>
    </AuthLayout>
  );
}