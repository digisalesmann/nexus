import { useState, useRef } from 'react';
import {
  User,
  Shield,
  Bell,
  Globe,
  CreditCard,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Lock,
  Key,
  Trash2,
  Download,
  Link2,
  Unlink,
  Moon,
  Sun,
  Volume2,
  Mail,
  MessageSquare,
  Zap,
  Camera,
  Edit3,
  X,
  Check,
  Copy,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SectionRule = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 mb-4 mt-8 first:mt-0">
    <span className="text-[9px] font-bold tracking-[0.2em] uppercase shrink-0
      text-stone-400 dark:text-white/25">
      {label}
    </span>
    <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={cn(
      'relative rounded-full shrink-0 transition-colors duration-200',
      checked ? 'bg-[#C9A84C]' : 'bg-stone-200 dark:bg-white/[0.10]'
    )}
    style={{ width: 40, height: 22 }}
  >
    <span
      className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
      style={{ left: checked ? 20 : 3 }}
    />
  </button>
);

const SettingRow = ({
  icon: Icon,
  iconBg = 'bg-stone-100 dark:bg-white/[0.06]',
  iconColor = 'text-stone-500 dark:text-white/40',
  label,
  sub,
  right,
  onClick,
  danger = false,
  noBorder = false,
}: {
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  noBorder?: boolean;
}) => (
  <div
    onClick={onClick}
    className={cn(
      'flex items-center gap-3.5 px-4 py-3.5 transition-colors',
      !noBorder && 'border-b border-stone-100 dark:border-white/[0.04] last:border-0',
      onClick && 'cursor-pointer',
      onClick && !danger && 'hover:bg-stone-50 dark:hover:bg-white/[0.02]',
      onClick && danger && 'hover:bg-red-50 dark:hover:bg-red-500/[0.05]'
    )}
  >
    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
      <Icon size={15} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn(
        'text-[13px] font-semibold leading-none tracking-[-0.1px]',
        danger ? 'text-red-500 dark:text-red-400' : 'text-stone-800 dark:text-white/80'
      )}>
        {label}
      </p>
      {sub && (
        <p className="text-[11px] mt-0.5 text-stone-400 dark:text-white/25 truncate">{sub}</p>
      )}
    </div>
    {right !== undefined ? right : (
      onClick && !danger && (
        <ChevronRight size={14} className="text-stone-300 dark:text-white/20 shrink-0" />
      )
    )}
  </div>
);

const SettingCard = ({ children }: { children: React.ReactNode }) => (
  <div className={cn(
    'rounded-2xl border overflow-hidden',
    'bg-white dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.07]'
  )}>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EDITABLE FIELD
// ─────────────────────────────────────────────────────────────────────────────

const EditableField = ({
  label, value, type = 'text', onSave,
}: {
  label: string; value: string; type?: string; onSave: (v: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState(value);
  const inputRef              = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSave = () => { onSave(val); setEditing(false); };
  const handleCancel = () => { setVal(value); setEditing(false); };

  return (
    <div className="flex items-center gap-3 px-4 py-3.5
      border-b border-stone-100 dark:border-white/[0.04] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          {label}
        </p>
        {editing ? (
          <input
            ref={inputRef}
            type={type}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-full bg-transparent text-[13px] font-medium outline-none
              text-stone-900 dark:text-white
              border-b border-[#C9A84C]/50 pb-0.5"
          />
        ) : (
          <p className="text-[13px] font-medium text-stone-800 dark:text-white/75 truncate">{val}</p>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={handleSave}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] transition-colors">
            <Check size={12} />
          </button>
          <button onClick={handleCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              bg-stone-100 dark:bg-white/[0.06] text-stone-500 dark:text-white/40
              hover:bg-stone-200 dark:hover:bg-white/[0.10] transition-colors">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button onClick={handleEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
            text-stone-300 dark:text-white/20
            hover:text-stone-500 dark:hover:text-white/45
            hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors">
          <Edit3 size={13} />
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD SHEET
// ─────────────────────────────────────────────────────────────────────────────

const PasswordSheet = ({ onClose }: { onClose: () => void }) => {
  const [show,    setShow]    = useState(false);
  const [step,    setStep]    = useState<'form' | 'done'>('form');
  const [current, setCurrent] = useState('');
  const [next,    setNext]    = useState('');
  const [confirm, setConfirm] = useState('');

  const valid = current.length >= 6 && next.length >= 8 && next === confirm;

  const strength = next.length === 0 ? 0
    : next.length < 6 ? 1
    : next.length < 10 ? 2
    : /[A-Z]/.test(next) && /[0-9]/.test(next) && /[^a-zA-Z0-9]/.test(next) ? 4
    : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#C9A84C]', 'bg-emerald-400'][strength];

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={cn(
          'fixed z-[160] bg-white dark:bg-[#161618]',
          '[&::-webkit-scrollbar]:hidden',
          'border-stone-200 dark:border-white/[0.08]',
          'bottom-0 left-0 right-0 rounded-t-2xl border-t',
          'p-5 pb-10 max-h-[90vh] overflow-y-auto',
          'lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2',
          'lg:w-[440px] lg:rounded-2xl lg:border lg:max-h-[85vh]'
        )}
      >
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10]
          mx-auto mb-5 lg:hidden" />

        <div className="flex items-center justify-between mb-5">
          <p className="text-[15px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white">
            Change password
          </p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        {step === 'done' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10
              flex items-center justify-center mx-auto mb-4
              ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
              <CheckCircle2 size={26} className="text-emerald-500" />
            </div>
            <p className="text-[14px] font-bold text-stone-900 dark:text-white mb-1">
              Password updated
            </p>
            <p className="text-[12px] text-stone-400 dark:text-white/30 mb-5">
              Your password has been changed successfully.
            </p>
            <button onClick={onClose}
              className="w-full py-3.5 rounded-xl text-[13px] font-bold
                bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] transition-colors">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'Current password', val: current, set: setCurrent, showToggle: true  },
              { label: 'New password',     val: next,    set: setNext,    showToggle: false },
              { label: 'Confirm password', val: confirm, set: setConfirm, showToggle: false },
            ].map((f, i) => (
              <div key={f.label}>
                <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                  {f.label}
                </label>
                <div className="relative">
                  <input
                    type={show && f.showToggle ? 'text' : 'password'}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      'w-full px-3.5 py-2.5 rounded-xl border text-[13px] outline-none transition-colors',
                      f.showToggle ? 'pr-10' : '',
                      'bg-stone-50 dark:bg-white/[0.02]',
                      'border-stone-200 dark:border-white/[0.08]',
                      'text-stone-900 dark:text-white',
                      'placeholder:text-stone-300 dark:placeholder:text-white/20',
                      'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
                    )}
                  />
                  {f.showToggle && (
                    <button
                      onClick={() => setShow(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        text-stone-300 dark:text-white/20 hover:text-stone-500 transition-colors"
                    >
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
                {i === 1 && next.length > 0 && (
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
            ))}
            <button
              disabled={!valid}
              onClick={() => setStep('done')}
              className={cn(
                'w-full py-3.5 rounded-xl text-[13px] font-bold transition-all',
                valid
                  ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20'
                  : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
              )}
            >
              Update password
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const SettingsPage = () => {
  const [name,    setName]    = useState('Victor Okafor');
  const [email,   setEmail]   = useState('victor@nexusbank.io');
  const [phone,   setPhone]   = useState('+234 812 345 6789');
  const [address, setAddress] = useState('Lagos, Nigeria');

  const [notifPush,   setNotifPush]   = useState(true);
  const [notifEmail,  setNotifEmail]  = useState(true);
  const [notifSMS,    setNotifSMS]    = useState(false);
  const [notifFX,     setNotifFX]     = useState(true);
  const [biometric,   setBiometric]   = useState(true);
  const [twoFA,       setTwoFA]       = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [autoLock,    setAutoLock]    = useState(true);
  const [notifSound,  setNotifSound]  = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [copied,       setCopied]       = useState(false);

  const handleCopyUID = () => {
    navigator.clipboard?.writeText('NXS-4721-OKAFOR').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const linkedAccounts = [
    { name: 'Google',   sub: 'victor@gmail.com',     connected: true  },
    { name: 'Apple ID', sub: 'victor@icloud.com',    connected: true  },
    { name: 'Plaid',    sub: 'Bank data aggregator',  connected: false },
  ];

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Account configuration
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Settings
        </h1>
      </div>

      {/* ── TWO-COLUMN GRID on desktop, single column on mobile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 items-start">

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div>

          {/* ── PROFILE ── */}
          <SectionRule label="Profile" />
          <div className={cn(
            'rounded-2xl border p-5 mb-3 flex items-center gap-4',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6F2E]
                flex items-center justify-center text-[#0C0C0D] text-[20px] font-bold
                shadow-md shadow-[#C9A84C]/20">
                V
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full
                bg-stone-900 dark:bg-white flex items-center justify-center
                text-white dark:text-[#0C0C0D]
                border-2 border-white dark:border-[#111]
                hover:scale-110 transition-transform">
                <Camera size={10} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
                leading-none truncate"
                style={{ fontSize: '20px', letterSpacing: '-0.2px' }}>
                {name}
              </p>
              <p className="text-[11px] text-stone-400 dark:text-white/30 mt-0.5 truncate">{email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em]
                  text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">
                  Premium
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <SettingCard>
            <EditableField label="Full name"     value={name}    onSave={setName}    />
            <EditableField label="Email address" value={email}   onSave={setEmail}   type="email" />
            <EditableField label="Phone number"  value={phone}   onSave={setPhone}   type="tel" />
            <EditableField label="Location"      value={address} onSave={setAddress} />
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
                  text-stone-400 dark:text-white/25">Nexus ID</p>
                <p className="text-[13px] font-mono font-medium text-stone-800 dark:text-white/75">
                  NXS-4721-OKAFOR
                </p>
              </div>
              <button onClick={handleCopyUID}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                  text-stone-300 dark:text-white/20 transition-colors
                  hover:text-stone-500 dark:hover:text-white/45
                  hover:bg-stone-100 dark:hover:bg-white/[0.06]">
                {copied
                  ? <CheckCircle2 size={13} className="text-emerald-500" />
                  : <Copy size={13} />
                }
              </button>
            </div>
          </SettingCard>

          {/* ── SECURITY ── */}
          <SectionRule label="Security" />
          <SettingCard>
            <SettingRow icon={Key} iconBg="bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08]" iconColor="text-[#C9A84C]"
              label="Change password" sub="Last changed 45 days ago" onClick={() => setShowPassword(true)} />
            <SettingRow icon={Smartphone} iconBg="bg-sky-50 dark:bg-sky-500/10" iconColor="text-sky-600 dark:text-sky-400"
              label="Two-factor authentication" sub={twoFA ? 'Enabled via authenticator app' : 'Disabled'}
              right={<Toggle checked={twoFA} onChange={() => setTwoFA(t => !t)} />} />
            <SettingRow icon={Eye} iconBg="bg-violet-50 dark:bg-violet-500/10" iconColor="text-violet-600 dark:text-violet-400"
              label="Biometric login" sub={biometric ? 'Face ID / fingerprint enabled' : 'Disabled'}
              right={<Toggle checked={biometric} onChange={() => setBiometric(b => !b)} />} />
            <SettingRow icon={Bell} iconBg="bg-amber-50 dark:bg-amber-500/10" iconColor="text-amber-600 dark:text-amber-400"
              label="Login alerts" sub="Notify me of new sign-ins"
              right={<Toggle checked={loginAlerts} onChange={() => setLoginAlerts(l => !l)} />} />
            <SettingRow icon={Lock} iconBg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400"
              label="Auto-lock" sub="Lock after 5 minutes of inactivity"
              right={<Toggle checked={autoLock} onChange={() => setAutoLock(a => !a)} />} />
            <SettingRow icon={Shield} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Active sessions" sub="2 devices currently signed in" onClick={() => {}} />
          </SettingCard>

          {/* ── LINKED ACCOUNTS ── */}
          <SectionRule label="Linked accounts" />
          <SettingCard>
            {linkedAccounts.map((acc) => {
              const iconMap: Record<string, React.ReactNode> = {
                'Google':   <span className="text-red-500 font-black text-[13px]">G</span>,
                'Apple ID': <span className="text-stone-700 dark:text-white/60 text-[13px]">⌘</span>,
                'Plaid':    <span className="text-sky-600 dark:text-sky-400 font-black text-[11px]">P</span>,
              };
              const bgMap: Record<string, string> = {
                'Google':   'bg-red-50 dark:bg-red-500/10',
                'Apple ID': 'bg-stone-100 dark:bg-white/[0.06]',
                'Plaid':    'bg-sky-50 dark:bg-sky-500/10',
              };
              return (
                <div key={acc.name}
                  className="flex items-center gap-3.5 px-4 py-3.5
                    border-b border-stone-100 dark:border-white/[0.04] last:border-0">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', bgMap[acc.name])}>
                    {iconMap[acc.name]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-stone-800 dark:text-white/80 leading-none">{acc.name}</p>
                    <p className="text-[11px] mt-0.5 text-stone-400 dark:text-white/25 truncate">{acc.sub}</p>
                  </div>
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border shrink-0',
                    acc.connected
                      ? 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07] text-stone-500 dark:text-white/35 hover:border-red-200 dark:hover:border-red-500/20 hover:text-red-400'
                      : 'bg-[#C9A84C]/10 border-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/20'
                  )}>
                    {acc.connected ? <><Unlink size={11} />Disconnect</> : <><Link2 size={11} />Connect</>}
                  </button>
                </div>
              );
            })}
          </SettingCard>

          {/* ── DANGER ZONE ── */}
          <SectionRule label="Danger zone" />
          <SettingCard>
            <SettingRow icon={LogOut} iconBg="bg-red-50 dark:bg-red-500/[0.08]" iconColor="text-red-400"
              label="Sign out" sub="Sign out of all devices" danger onClick={() => {}} />
            <SettingRow icon={Trash2} iconBg="bg-red-50 dark:bg-red-500/[0.08]" iconColor="text-red-400"
              label="Close account" sub="Permanently delete your Nexus account"
              danger noBorder onClick={() => {}} />
          </SettingCard>

        </div>{/* end left column */}

        {/* ════════════ RIGHT COLUMN ════════════ */}
        <div>

          {/* ── NOTIFICATIONS ── */}
          <SectionRule label="Notifications" />
          <SettingCard>
            <SettingRow icon={Zap} iconBg="bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08]" iconColor="text-[#C9A84C]"
              label="Push notifications" sub="Instant alerts on your device"
              right={<Toggle checked={notifPush} onChange={() => setNotifPush(n => !n)} />} />
            <SettingRow icon={Mail} iconBg="bg-sky-50 dark:bg-sky-500/10" iconColor="text-sky-600 dark:text-sky-400"
              label="Email notifications" sub="Summaries and important updates"
              right={<Toggle checked={notifEmail} onChange={() => setNotifEmail(n => !n)} />} />
            <SettingRow icon={MessageSquare} iconBg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400"
              label="SMS alerts" sub="Critical security alerts"
              right={<Toggle checked={notifSMS} onChange={() => setNotifSMS(n => !n)} />} />
            <SettingRow icon={Globe} iconBg="bg-violet-50 dark:bg-violet-500/10" iconColor="text-violet-600 dark:text-violet-400"
              label="FX rate alerts" sub="Notify when tracked rates move"
              right={<Toggle checked={notifFX} onChange={() => setNotifFX(n => !n)} />} />
            <SettingRow icon={Volume2} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Notification sound" sub="Play sound on new alerts"
              right={<Toggle checked={notifSound} onChange={() => setNotifSound(n => !n)} />} />
          </SettingCard>

          {/* ── PREFERENCES ── */}
          <SectionRule label="Preferences" />
          <SettingCard>
            <div className="flex items-center gap-3.5 px-4 py-3.5
              border-b border-stone-100 dark:border-white/[0.04]">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                bg-stone-100 dark:bg-white/[0.06]">
                <Sun size={15} className="text-stone-500 dark:hidden" />
                <Moon size={15} className="text-white/40 hidden dark:block" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-stone-800 dark:text-white/80 leading-none">Appearance</p>
                <p className="text-[11px] mt-0.5 text-stone-400 dark:text-white/25">Light / dark theme</p>
              </div>
              <ThemeToggle />
            </div>
            <SettingRow icon={Globe} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Language" sub="English (US)" onClick={() => {}} />
            <SettingRow icon={CreditCard} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Default currency" sub="USD — United States Dollar" onClick={() => {}} />
            <SettingRow icon={User} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Time zone" sub="Africa/Lagos (WAT, UTC+1)" onClick={() => {}} />
          </SettingCard>

          {/* ── PRIVACY & DATA ── */}
          <SectionRule label="Privacy & data" />
          <SettingCard>
            <SettingRow icon={Download} iconBg="bg-sky-50 dark:bg-sky-500/10" iconColor="text-sky-600 dark:text-sky-400"
              label="Download my data" sub="Export all your account data" onClick={() => {}} />
            <SettingRow icon={Shield} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Privacy policy" sub="Last updated March 2025" onClick={() => {}} />
            <SettingRow icon={AlertCircle} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Terms of service" onClick={() => {}} />
          </SettingCard>

          {/* ── APP INFO ── */}
          <SectionRule label="App" />
          <SettingCard>
            <div className="flex items-center gap-3.5 px-4 py-3.5
              border-b border-stone-100 dark:border-white/[0.04]">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#C9A84C]/10">
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                  <rect width="22" height="22" rx="6" fill="#C9A84C"/>
                  <path d="M5 11h12M5 7.5h8M5 14.5h5" stroke="#0C0C0D" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-stone-800 dark:text-white/80 leading-none">
                  Nexus Private Banking
                </p>
                <p className="text-[11px] mt-0.5 text-stone-400 dark:text-white/25">Version 2.4.1 · Build 2025.04</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0
                text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
                Up to date
              </span>
            </div>
            <SettingRow icon={AlertCircle} iconBg="bg-stone-100 dark:bg-white/[0.06]" iconColor="text-stone-500 dark:text-white/40"
              label="Send feedback" sub="Help us improve Nexus" onClick={() => {}} />
          </SettingCard>

        </div>{/* end right column */}

      </div>{/* end grid */}

      <div className="h-24 lg:h-12" />

      {showPassword && <PasswordSheet onClose={() => setShowPassword(false)} />}
    </div>
  );
};

export default SettingsPage;