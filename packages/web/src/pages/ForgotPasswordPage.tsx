import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, Shield, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LogoMark = () => (
  <img src="/sg.jpeg" alt="Stonegate" width={28} height={28}
    style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
);

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const inputClass = `w-full pl-10 pr-4 py-3 rounded-xl text-[14px]
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
        <Link to="/login"
          className="flex items-center gap-1.5 text-[13px] text-stone-500 dark:text-white/40
            hover:text-stone-700 dark:hover:text-white/60 transition-colors">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[400px]">

          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08]
                flex items-center justify-center mb-6">
                <Lock size={20} className="text-[#C9A84C]" />
              </div>

              <div className="mb-8">
                <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
                  leading-tight mb-2"
                  style={{ fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.5px' }}>
                  Reset your password
                </h1>
                <p className="text-[14px] text-stone-500 dark:text-white/40 leading-relaxed">
                  Enter your account email and we'll send a secure reset link.
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
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                      text-stone-400 dark:text-white/25 pointer-events-none" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" disabled={loading}
                      className={inputClass} />
                  </div>
                </div>

                <button type="submit" disabled={loading || !email}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl mt-2
                    text-[14px] font-bold transition-colors
                    bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20
                    disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending…
                    </>
                  ) : 'Send reset link'}
                </button>
              </form>

              <div className="flex items-start gap-2.5 mt-6 p-3.5 rounded-xl
                bg-stone-100 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.06]">
                <Shield size={13} className="text-stone-400 dark:text-white/25 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-500 dark:text-white/35 leading-relaxed">
                  Reset links expire after 15 minutes and can only be used once. Never share your link with anyone.
                </p>
              </div>

              <p className="text-center text-[12px] text-stone-400 dark:text-white/25 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-[#C9A84C] hover:text-[#D4B558] transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10
                flex items-center justify-center mx-auto mb-6
                ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
                <CheckCircle2 size={30} className="text-emerald-500" />
              </div>

              <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
                leading-tight mb-3"
                style={{ fontSize: 'clamp(22px, 4vw, 28px)', letterSpacing: '-0.4px' }}>
                Check your inbox
              </h1>
              <p className="text-[14px] text-stone-500 dark:text-white/40 leading-relaxed mb-2">
                A reset link was sent to
              </p>
              <p className="text-[14px] font-semibold text-stone-800 dark:text-white/80 mb-8 break-all">
                {email}
              </p>

              <div className="space-y-3 text-left mb-8">
                {[
                  "Check your spam or junk folder if you don't see the email",
                  'The reset link expires in 15 minutes',
                  'You can only use the link once — request a new one if it expires',
                ].map(tip => (
                  <div key={tip} className="flex items-start gap-2.5 text-[12px]
                    text-stone-500 dark:text-white/35">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-stone-400 dark:bg-white/25 shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>

              <button onClick={() => { setSent(false); setEmail(''); }}
                className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-colors border mb-3
                  bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]
                  text-stone-700 dark:text-white/60 hover:text-stone-900 dark:hover:text-white">
                Use a different email
              </button>
              <Link to="/login"
                className="block w-full py-3.5 rounded-xl text-center text-[14px] font-bold transition-colors
                  bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
                Back to sign in
              </Link>
            </div>
          )}

          <p className="text-center text-[10px] font-mono text-stone-400 dark:text-white/20 mt-8">
            FCA regulated · 256-bit SSL encrypted · FSCS protected
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
