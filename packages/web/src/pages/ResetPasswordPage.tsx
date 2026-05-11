import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [show,      setShow]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [done,      setDone]      = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 4
    : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#C9A84C]', 'bg-emerald-400'][strength];

  // Supabase embeds the recovery token in the URL hash; getSession picks it up automatically
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const valid = password.length >= 8 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 2500);
    }
  };

  const inputCls = cn(
    'w-full px-4 py-3 rounded-xl border text-[14px] outline-none transition-colors pr-11',
    'bg-stone-50 dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.08]',
    'text-stone-900 dark:text-white',
    'placeholder:text-stone-300 dark:placeholder:text-white/20',
    'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
  );

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-[#F5F3EF] dark:bg-[#0C0C0D] px-4">

      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <img src="/sg.jpeg" alt="Stonegate" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-[15px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white">
            Stonegate
          </span>
        </div>

        <div className={cn(
          'rounded-2xl border p-7',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.08]',
          'shadow-xl shadow-black/[0.04] dark:shadow-black/30'
        )}>

          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10
                flex items-center justify-center mx-auto mb-5
                ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <p className="text-[18px] font-bold text-stone-900 dark:text-white mb-1">
                Password updated
              </p>
              <p className="text-[13px] text-stone-400 dark:text-white/30">
                Redirecting you to the dashboard…
              </p>
            </div>
          ) : (
            <>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
                text-stone-400 dark:text-white/25">
                Security
              </p>
              <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-6"
                style={{ fontSize: '26px', letterSpacing: '-0.4px' }}>
                Set new password
              </h1>

              {!hasSession && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border mb-5
                  bg-amber-50 dark:bg-amber-500/[0.06] border-amber-200 dark:border-amber-500/20">
                  <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-600 dark:text-amber-400">
                    This link may have expired. Please request a new password reset from the login page.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoFocus
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2
                        text-stone-300 dark:text-white/20 hover:text-stone-500 transition-colors"
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(s => (
                          <div key={s} className={cn(
                            'flex-1 h-1 rounded-full transition-colors',
                            s <= strength ? strengthColor : 'bg-stone-200 dark:bg-white/[0.08]'
                          )} />
                        ))}
                      </div>
                      <p className="text-[10px] font-mono text-stone-400 dark:text-white/30">
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                    Confirm password
                  </label>
                  <input
                    type={show ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    className={cn(inputCls, confirm && password !== confirm && 'border-red-300 dark:border-red-500/30')}
                  />
                  {confirm && password !== confirm && (
                    <p className="text-[11px] font-bold text-red-400 mt-1.5">Passwords don&apos;t match</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl border
                    bg-red-50 dark:bg-red-500/[0.06] border-red-200 dark:border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-500 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!valid || loading || !hasSession}
                  className={cn(
                    'w-full py-3.5 rounded-xl text-[14px] font-bold transition-all',
                    valid && !loading && hasSession
                      ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20'
                      : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating…
                    </span>
                  ) : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
