import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LogoMark = () => (
  <img src="/sg.jpeg" alt="Stonegate" width={28} height={28}
    style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
);

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { signIn } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-[14px]
    bg-white dark:bg-white/[0.04]
    border border-stone-200 dark:border-white/[0.08]
    text-stone-900 dark:text-white
    placeholder-stone-400 dark:placeholder-white/20
    focus:outline-none focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40
    transition-colors disabled:opacity-50`;

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0C0C0D] flex flex-col">

      <header className="px-6 sm:px-10 h-[60px] flex items-center justify-between
        border-b border-stone-200 dark:border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white">
            Stonegate
          </span>
        </Link>
        <p className="text-[13px] text-stone-500 dark:text-white/40">
          No account?{' '}
          <Link to="/signup" className="font-semibold text-[#C9A84C] hover:text-[#D4B558] transition-colors">
            Sign up
          </Link>
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[400px]">

          <div className="mb-8">
            <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
              leading-tight mb-2"
              style={{ fontSize: 'clamp(26px, 4vw, 34px)', letterSpacing: '-0.6px' }}>
              Welcome back
            </h1>
            <p className="text-[14px] text-stone-500 dark:text-white/40">
              Sign in to your Stonegate account
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 mb-4 p-3.5 rounded-xl
              bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/20">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.12em] uppercase
                text-stone-500 dark:text-white/35 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-[0.12em] uppercase
                  text-stone-500 dark:text-white/35">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-[12px] text-[#C9A84C]/80 hover:text-[#C9A84C] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className={`${inputClass} pr-11`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                    text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/50 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl mt-2
                bg-[#C9A84C] text-[#0C0C0D] text-[14px] font-bold
                hover:bg-[#D4B558] transition-colors shadow-md shadow-[#C9A84C]/20
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[11px] font-mono text-stone-400 dark:text-white/20 mt-6">
            FCA regulated · 256-bit SSL encrypted
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
