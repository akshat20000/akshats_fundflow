import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import AuthLayout from '@/components/layout/AuthLayout';
import { Spinner } from '@/components/ui';

// Password strength helper
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)         score++;
  if (/[A-Z]/.test(pwd))      score++;
  if (/[0-9]/.test(pwd))      score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: '',        color: '' },
    { label: 'Weak',    color: 'bg-negative' },
    { label: 'Fair',    color: 'bg-warning' },
    { label: 'Good',    color: 'bg-cyan' },
    { label: 'Strong',  color: 'bg-positive' },
  ];
  return { score, ...map[score] };
}

export default function SignUp() {
  const navigate  = useNavigate();
  const { signUp } = useAuthStore();

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '',
  });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [success, setSuccess]   = useState(null); // { email }

  const strength = getStrength(form.password);

  // ── Validation ──
  function validate() {
    const e = {};
    if (!form.username.trim())            e.username = 'Username is required.';
    else if (form.username.length < 3)    e.username = 'Minimum 3 characters.';
    else if (/\s/.test(form.username))    e.username = 'No spaces allowed.';

    if (!form.email.trim())               e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';

    if (!form.password)                   e.password = 'Password is required.';
    else if (form.password.length < 6)   e.password = 'Minimum 6 characters.';

    if (!form.confirm)                    e.confirm = 'Please confirm your password.';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
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

    const result = await signUp(form.email.trim(), form.password, form.username.trim());

    if (!result.success) {
      const msg = result.error?.toLowerCase() || '';
      if (msg.includes('already registered')) setServerErr('This email is already registered.');
      else if (msg.includes('valid email'))   setServerErr('Enter a valid email address.');
      else setServerErr(result.error || 'Sign up failed. Please try again.');
      setLoading(false);
      return;
    }

    if (result.confirmed) {
      // Email confirmation off — already logged in
      navigate('/dashboard', { replace: true });
    } else {
      // Show confirmation screen
      setSuccess({ email: form.email });
    }
    setLoading(false);
  }

  // ── Success screen ──
  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-[420px] animate-slide-up">
          <div className="relative bg-surface border border-white/[0.07] rounded-xl p-10 text-center overflow-hidden"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            <div className="absolute top-0 left-[15%] right-[15%] h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(0,229,160,0.6), transparent)' }} />

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-positive/10 border border-positive/25 mb-5"
              style={{ boxShadow: '0 0 24px rgba(0,229,160,0.15)' }}>
              <i className="fas fa-envelope-open-text text-positive text-2xl" />
            </div>

            <h2 className="font-display text-[1.5rem] font-bold text-primary-text mb-3 tracking-tight">
              Check your inbox
            </h2>
            <p className="text-secondary-text text-sm leading-relaxed mb-1">
              We sent a confirmation link to
            </p>
            <p className="text-cyan font-semibold text-sm mb-6 font-mono">
              {success.email}
            </p>
            <p className="text-muted-text text-xs leading-relaxed mb-8">
              Click the link in the email to activate your account.
              Check your spam folder if you don't see it.
            </p>

            <Link
              to="/signin"
              className="inline-flex items-center justify-center gap-2 bg-cyan text-void font-bold text-sm rounded-md py-3 px-8 no-underline transition-all duration-200 hover:bg-[#1adbff]"
              style={{ boxShadow: '0 4px 20px rgba(0,212,255,0.25)' }}
            >
              <i className="fas fa-sign-in-alt text-[0.85em]" />
              Go to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px] animate-slide-up">
        <div className="relative bg-surface border border-white/[0.07] rounded-xl p-10 overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset' }}>

          {/* Top accent */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)' }} />

          {/* ── Header ── */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/25 mb-4"
              style={{ boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
              <i className="fas fa-user-plus text-cyan text-lg" />
            </div>
            <h1 className="font-display text-[1.65rem] font-bold text-primary-text tracking-tight mb-1">
              Create account
            </h1>
            <p className="text-secondary-text text-sm">
              Start managing your finances with Web3
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

            {/* Username */}
            <div className="mb-4">
              <label className="block mb-2 text-2xs font-semibold text-muted-text uppercase tracking-widest">
                Username
              </label>
              <div className="relative">
                <i className="fas fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                <input
                  type="text"
                  value={form.username}
                  onChange={handleChange('username')}
                  placeholder="yourname"
                  autoComplete="username"
                  className={`ff-input pl-10 ${errors.username ? 'border-negative/50' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-negative flex items-center gap-1">
                  <i className="fas fa-circle-exclamation text-[0.7rem]" />{errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
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
                  className={`ff-input pl-10 ${errors.email ? 'border-negative/50' : ''}`}
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
            <div className="mb-4">
              <label className="block mb-2 text-2xs font-semibold text-muted-text uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={`ff-input pl-10 ${errors.password ? 'border-negative/50' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-negative flex items-center gap-1">
                  <i className="fas fa-circle-exclamation text-[0.7rem]" />{errors.password}
                </p>
              )}
              {/* Strength bar */}
              {form.password && !errors.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-white/[0.08]'}`}
                      />
                    ))}
                  </div>
                  <p className="text-2xs text-muted-text">
                    Strength:{' '}
                    <span className={`font-semibold ${
                      strength.score === 1 ? 'text-negative' :
                      strength.score === 2 ? 'text-warning' :
                      strength.score === 3 ? 'text-cyan' : 'text-positive'
                    }`}>
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-7">
              <label className="block mb-2 text-2xs font-semibold text-muted-text uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <i className="fas fa-shield-halved absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={handleChange('confirm')}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`ff-input pl-10 pr-10 ${errors.confirm ? 'border-negative/50' : form.confirm && form.confirm === form.password ? 'border-positive/40' : ''}`}
                  disabled={loading}
                />
                {/* Match indicator */}
                {form.confirm && (
                  <i className={`fas absolute right-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${
                    form.confirm === form.password ? 'fa-check-circle text-positive' : 'fa-times-circle text-negative'
                  }`} />
                )}
              </div>
              {errors.confirm && (
                <p className="mt-1.5 text-xs text-negative flex items-center gap-1">
                  <i className="fas fa-circle-exclamation text-[0.7rem]" />{errors.confirm}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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

          {/* ── Sign in link ── */}
          <p className="text-center text-sm text-secondary-text">
            Already have an account?{' '}
            <Link to="/signin" className="text-cyan font-semibold hover:text-[#1adbff] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center mt-5 text-2xs text-muted-text leading-relaxed">
          By creating an account you agree to our{' '}
          <span className="text-secondary-text cursor-pointer hover:text-cyan transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-secondary-text cursor-pointer hover:text-cyan transition-colors">Privacy Policy</span>
        </p>
      </div>
    </AuthLayout>
  );
}