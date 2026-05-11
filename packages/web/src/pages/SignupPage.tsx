import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, ChevronRight, Shield, Lock, Globe, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { AppSelect } from '../components/AppSelect';

const LogoMark = () => (
  <img src="/sg.jpeg" alt="Stonegate" width={28} height={28}
    style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
);

const COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Canada', 'Denmark', 'Finland', 'France',
  'Germany', 'Ghana', 'Ireland', 'Italy', 'Japan', 'Kenya', 'Netherlands',
  'New Zealand', 'Norway', 'Portugal', 'Saudi Arabia', 'Singapore', 'South Africa',
  'Spain', 'Sweden', 'Switzerland', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Other',
];

const SOURCE_OF_FUNDS = [
  'Employment / Salary', 'Business income', 'Investments / Savings',
  'Freelance / Consulting', 'Rental income', 'Pension / Retirement',
  'Gift or inheritance', 'Other',
];

type Step = 1 | 2;

const inputClass = `w-full px-4 py-3 rounded-xl text-[14px]
  bg-white dark:bg-white/[0.04]
  border border-stone-200 dark:border-white/[0.08]
  text-stone-900 dark:text-white
  placeholder-stone-400 dark:placeholder-white/20
  focus:outline-none focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40
  transition-colors`;

const labelClass = `block text-[11px] font-bold tracking-[0.12em] uppercase
  text-stone-500 dark:text-white/35 mb-1.5`;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-stone-200 dark:bg-white/10', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= score ? colors[score] : 'bg-stone-200 dark:bg-white/10')} />
        ))}
        <span className={cn('text-[10px] font-bold ml-1 shrink-0', score >= 4 ? 'text-emerald-500' : score >= 3 ? 'text-yellow-500' : score >= 2 ? 'text-amber-500' : 'text-red-400')}>
          {labels[score]}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={cn('flex items-center gap-1 text-[10px]', c.pass ? 'text-emerald-500' : 'text-stone-400 dark:text-white/25')}>
            <Check size={9} className={c.pass ? 'opacity-100' : 'opacity-30'} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [step, setStep]               = useState<Step>(1);
  const [firstName,  setFirstName]    = useState('');
  const [lastName,   setLastName]     = useState('');
  const [dob,        setDob]          = useState('');
  const [nationality, setNationality] = useState('');
  const [loading,    setLoading]      = useState(false);
  const [error,      setError]        = useState<string | null>(null);
  const [phone,      setPhone]        = useState('');
  const [email,      setEmail]        = useState('');
  const [country,    setCountry]      = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [password,   setPassword]     = useState('');
  const [confirm,    setConfirm]      = useState('');
  const [showPass,   setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms,      setTerms]        = useState(false);
  const [marketing,  setMarketing]    = useState(false);

  const step1Valid = firstName && lastName && dob && nationality && phone;
  const passwordsMatch = password === confirm && confirm.length > 0;
  const step2Valid = email && country && sourceOfFunds && password.length >= 8 && passwordsMatch && terms;

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0C0C0D] flex flex-col">

      {/* Nav strip */}
      <header className="px-6 sm:px-10 h-[60px] flex items-center justify-between
        border-b border-stone-200 dark:border-white/[0.06] shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white">
            Stonegate
          </span>
        </Link>
        <p className="text-[13px] text-stone-500 dark:text-white/40">
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-[#C9A84C] hover:text-[#D4B558] transition-colors">
            Sign in
          </Link>
        </p>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-start justify-center px-5 py-10 lg:py-16">
        <div className="w-full max-w-[480px]">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {([1, 2] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all',
                  s < step
                    ? 'bg-emerald-500 text-white'
                    : s === step
                    ? 'bg-[#C9A84C] text-[#0C0C0D]'
                    : 'bg-stone-200 dark:bg-white/10 text-stone-400 dark:text-white/30'
                )}>
                  {s < step ? <Check size={11} /> : s}
                </div>
                <span className={cn(
                  'text-[11px] font-medium hidden sm:block',
                  s === step ? 'text-stone-700 dark:text-white/70' : 'text-stone-400 dark:text-white/25'
                )}>
                  {s === 1 ? 'Personal details' : 'Account setup'}
                </span>
                {s < 2 && <ChevronRight size={12} className="text-stone-300 dark:text-white/15 mx-1" />}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
              leading-tight mb-2"
              style={{ fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.5px' }}>
              {step === 1 ? 'Open your account' : 'Secure your account'}
            </h1>
            <p className="text-[14px] text-stone-500 dark:text-white/40">
              {step === 1
                ? 'Step 1 of 2 — Tell us about yourself'
                : 'Step 2 of 2 — Set up login & preferences'}
            </p>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (step1Valid) setStep(2); }}>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Alex" className={inputClass} autoComplete="given-name" />
                </div>
                <div>
                  <label className={labelClass}>Last name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Morgan" className={inputClass} autoComplete="family-name" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Date of birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                  max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]}
                  className={cn(inputClass, 'text-stone-900 dark:text-white')}
                  autoComplete="bday" />
                <p className="text-[10px] text-stone-400 dark:text-white/20 mt-1 px-1">
                  You must be 18 or older to open an account
                </p>
              </div>

              <div>
                <label className={labelClass}>Nationality</label>
                <AppSelect
                  value={nationality}
                  onChange={setNationality}
                  options={COUNTRIES}
                  placeholder="Select nationality"
                  triggerClassName="bg-white dark:bg-white/[0.04]"
                />
              </div>

              <div>
                <label className={labelClass}>Phone number</label>
                <div className="flex gap-2">
                  <div className="shrink-0">
                    <input type="text" placeholder="+1" defaultValue=""
                      className={cn(inputClass, 'w-16 text-center')} />
                  </div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 000-0000" className={inputClass} autoComplete="tel" />
                </div>
                <p className="text-[10px] text-stone-400 dark:text-white/20 mt-1 px-1">
                  Used for security verification and account alerts
                </p>
              </div>

              {/* ID notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl
                bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08]
                border border-[#C9A84C]/20 dark:border-[#C9A84C]/15">
                <Shield size={14} className="text-[#C9A84C] shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-600 dark:text-white/50 leading-relaxed">
                  You'll need a valid government-issued ID (passport, national ID, or driver's licence) to verify your identity after signup.
                </p>
              </div>

              <button
                type="submit"
                disabled={!step1Valid}
                className={cn(
                  'flex items-center justify-center gap-2 w-full py-3.5 rounded-xl mt-2',
                  'text-[14px] font-bold transition-colors',
                  step1Valid
                    ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20'
                    : 'bg-stone-200 dark:bg-white/[0.06] text-stone-400 dark:text-white/20 cursor-not-allowed'
                )}
              >
                Continue <ChevronRight size={15} />
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              if (!step2Valid) return;
              setLoading(true);
              setError(null);
              const { error } = await signUp(email, password, {
                full_name: `${firstName} ${lastName}`,
                phone,
                date_of_birth: dob,
                nationality,
                country_of_residence: country,
                source_of_funds: sourceOfFunds,
              });
              if (error) {
                setError(error.message);
                setLoading(false);
              } else {
                navigate('/dashboard', { replace: true });
              }
            }}>

              <div>
                <label className={labelClass}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputClass} autoComplete="email" />
              </div>

              <div>
                <label className={labelClass}>Country of residence</label>
                <AppSelect
                  value={country}
                  onChange={setCountry}
                  options={COUNTRIES}
                  placeholder="Select country"
                  triggerClassName="bg-white dark:bg-white/[0.04]"
                />
              </div>

              <div>
                <label className={labelClass}>Source of funds</label>
                <AppSelect
                  value={sourceOfFunds}
                  onChange={setSourceOfFunds}
                  options={SOURCE_OF_FUNDS}
                  placeholder="Select source of funds"
                  triggerClassName="bg-white dark:bg-white/[0.04]"
                />
                <p className="text-[10px] text-stone-400 dark:text-white/20 mt-1 px-1">
                  Required for regulatory compliance (anti-money laundering)
                </p>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={cn(inputClass, 'pr-11')}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                      text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/50 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div>
                <label className={labelClass}>Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={cn(
                      inputClass, 'pr-11',
                      confirm && !passwordsMatch && 'border-red-400/50 dark:border-red-400/40'
                    )}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                      text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/50 transition-colors">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirm && !passwordsMatch && (
                  <p className="text-[10px] text-red-400 mt-1 px-1">Passwords do not match</p>
                )}
                {confirm && passwordsMatch && (
                  <p className="text-[10px] text-emerald-500 mt-1 px-1 flex items-center gap-1">
                    <Check size={9} /> Passwords match
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setTerms(!terms)}
                    className={cn(
                      'w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all cursor-pointer',
                      terms
                        ? 'bg-[#C9A84C] border-[#C9A84C]'
                        : 'bg-white dark:bg-white/[0.04] border-stone-300 dark:border-white/[0.12]'
                    )}
                  >
                    {terms && <Check size={9} className="text-[#0C0C0D]" strokeWidth={3} />}
                  </div>
                  <span className="text-[12px] text-stone-500 dark:text-white/40 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="underline text-stone-700 dark:text-white/60 hover:text-[#C9A84C] transition-colors">
                      Terms of Service
                    </Link>,{' '}
                    <Link to="/privacy" target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="underline text-stone-700 dark:text-white/60 hover:text-[#C9A84C] transition-colors">
                      Privacy Policy
                    </Link>, and{' '}
                    <Link to="/account-agreement" target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="underline text-stone-700 dark:text-white/60 hover:text-[#C9A84C] transition-colors">
                      Account Agreement
                    </Link>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => setMarketing(!marketing)}
                    className={cn(
                      'w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all cursor-pointer',
                      marketing
                        ? 'bg-[#C9A84C] border-[#C9A84C]'
                        : 'bg-white dark:bg-white/[0.04] border-stone-300 dark:border-white/[0.12]'
                    )}
                  >
                    {marketing && <Check size={9} className="text-[#0C0C0D]" strokeWidth={3} />}
                  </div>
                  <span className="text-[12px] text-stone-500 dark:text-white/40 leading-relaxed">
                    I'd like to receive product updates, rate alerts and offers from Stonegate (optional)
                  </span>
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl
                  bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/20">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl text-[14px] font-bold transition-colors border
                    bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]
                    text-stone-600 dark:text-white/50 hover:text-stone-900 dark:hover:text-white"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={!step2Valid || loading}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2',
                    'py-3.5 rounded-xl text-[14px] font-bold transition-colors',
                    step2Valid && !loading
                      ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20'
                      : 'bg-stone-200 dark:bg-white/[0.06] text-stone-400 dark:text-white/20 cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating account…
                    </>
                  ) : <><Lock size={13} /> Create account</>}
                </button>
              </div>
            </form>
          )}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            {[
              { icon: Shield, text: 'FCA regulated' },
              { icon: Lock,   text: '256-bit SSL' },
              { icon: Globe,  text: 'FSCS protected' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-[10px] font-mono
                text-stone-400 dark:text-white/20">
                <Icon size={9} className="shrink-0" />
                {text}
              </span>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default SignupPage;
