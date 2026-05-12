import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  ChevronRight,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Copy,
  Clock,
  User,
  AlertCircle,
  Shield,
  Zap,
  Info,
  ChevronDown,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getFlag } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useWallets } from '../hooks/useWallets';
import { supabase } from '../lib/supabase';
import { CURRENCY_SYMBOLS } from '../lib/utils';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../lib/types';

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)     return 'Just now';
  if (mins < 60)    return `${mins}m ago`;
  if (mins < 1440)  return `${Math.round(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.round(mins / 1440)}d ago`;
  return `${Math.round(mins / 10080)}w ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

type TransferMethod = 'bank' | 'nexus' | 'swift' | 'sepa';

interface Recipient {
  id:         string;
  name:       string;
  initials:   string;
  color:      string;
  bank:       string;
  accountNum: string;
  currency:   string;
  countryCode:string;
  country:    string;
  method:     TransferMethod;
  favourite:  boolean;
  lastAmount: string;
  lastSent:   string;
}

// ─── Beneficiary → Recipient adapter ─────────────────────────────────────────
const RECIP_COLORS = [
  'from-sky-500 to-blue-600', 'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600', 'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600', 'from-cyan-500 to-blue-500',
  'from-orange-500 to-red-500', 'from-slate-500 to-slate-700',
];

function recipInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}
function recipColor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return RECIP_COLORS[h % RECIP_COLORS.length];
}

interface DBBeneficiary {
  id: string; user_id: string; name: string; bank_name: string | null;
  account_number: string | null; iban: string | null; sort_code: string | null;
  currency: string; country: string | null; created_at: string;
}

function adaptBeneficiary(db: DBBeneficiary): Recipient {
  return {
    id:          db.id,
    name:        db.name,
    initials:    recipInitials(db.name),
    color:       recipColor(db.id),
    bank:        db.bank_name ?? 'Bank transfer',
    accountNum:  db.account_number ?? db.iban ?? '—',
    currency:    db.currency,
    countryCode: db.currency,
    country:     db.country ?? '—',
    method:      'bank',
    favourite:   false,
    lastAmount:  '—',
    lastSent:    '—',
  };
}

interface Account {
  code:       string;
  name:       string;
  symbol:     string;
  balance:    number;
  balanceFmt: string;
}

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar', GBP: 'British Pound', EUR: 'Euro',
  CAD: 'Canadian Dollar', JPY: 'Japanese Yen', CHF: 'Swiss Franc', AUD: 'Australian Dollar',
};

// Fallback accounts when wallets are loading
const FALLBACK_ACCOUNTS: Account[] = [
  { code:'GBP', name:'British Pound', symbol:'£', balance:0, balanceFmt:'£0.00' },
];

const FEE_PCT = 0.005;
const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500];

const METHOD_CONFIG: Record<TransferMethod, { label: string; color: string }> = {
  bank:  { label:'Bank transfer', color:'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10'               },
  nexus: { label:'Stonegate wallet',  color:'text-[#C9A84C] bg-[#C9A84C]/10'                                             },
  swift: { label:'SWIFT',         color:'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10'    },
  sepa:  { label:'SEPA',          color:'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────────────────────────────────────

const SectionRule = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 mb-4">
    <span className="text-[9px] font-bold tracking-[0.2em] uppercase shrink-0
      text-stone-400 dark:text-white/25">
      {label}
    </span>
    <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
  </div>
);

const Avatar = ({ r, size = 'md' }: { r: Recipient; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'lg' ? 'w-14 h-14 text-[17px]'
    : size === 'sm' ? 'w-8 h-8 text-[11px]'
    : 'w-10 h-10 text-[13px]';
  return (
    <div className={cn(
      dim, 'rounded-full flex items-center justify-center shrink-0 font-bold text-white',
      `bg-gradient-to-br ${r.color}`
    )}>
      {r.initials}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

const AccountSelector = ({ selected, onSelect, accounts }: {
  selected: Account; onSelect: (a: Account) => void; accounts: Account[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border transition-all',
          'bg-white dark:bg-white/[0.03]',
          'border-stone-200 dark:border-white/[0.08]',
          'hover:border-stone-300 dark:hover:border-white/[0.16]',
          open && 'border-[#C9A84C]/40 dark:border-[#C9A84C]/30'
        )}
      >
        <img src={getFlag(selected.code)} alt={selected.code}
          className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <span className="text-[13px] font-bold text-stone-900 dark:text-white">{selected.code}</span>
          <span className="text-[11px] text-stone-400 dark:text-white/25 ml-2 font-mono">{selected.balanceFmt}</span>
        </div>
        <ChevronDown size={13}
          className={cn('text-stone-400 dark:text-white/30 transition-transform shrink-0',
            open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div className={cn(
            'absolute top-full left-0 right-0 mt-1.5 rounded-xl border z-[110] overflow-hidden',
            'bg-white dark:bg-[#1C1C1E]',
            'border-stone-200 dark:border-white/[0.09]',
            'shadow-2xl shadow-black/15 dark:shadow-black/50'
          )}>
            {accounts.map(a => (
              <button key={a.code} onClick={() => { onSelect(a); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                  'border-b border-stone-50 dark:border-white/[0.04] last:border-0',
                  a.code === selected.code
                    ? 'bg-[#C9A84C]/[0.07]'
                    : 'hover:bg-stone-50 dark:hover:bg-white/[0.04]'
                )}>
                <img src={getFlag(a.code)} alt={a.code}
                  className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-bold text-stone-800 dark:text-white/80 leading-none">{a.code}</p>
                  <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5">{a.name}</p>
                </div>
                <p className="text-[11px] font-mono text-stone-400 dark:text-white/25">{a.balanceFmt}</p>
                {a.code === selected.code && <CheckCircle2 size={13} className="text-[#C9A84C] shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RECIPIENT ROW
// ─────────────────────────────────────────────────────────────────────────────

const RecipientRow = ({ r, onSelect }: { r: Recipient; onSelect: (r: Recipient) => void }) => {
  const method = METHOD_CONFIG[r.method];
  return (
    <button
      onClick={() => onSelect(r)}
      className="w-full flex items-center gap-3 py-3 -mx-2 px-2 rounded-xl
        hover:bg-stone-50 dark:hover:bg-white/[0.02]
        border-b border-stone-100 dark:border-white/[0.04] last:border-0
        transition-colors group text-left"
    >
      <Avatar r={r} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[13px] font-semibold leading-none tracking-[-0.2px] truncate
            text-stone-800 dark:text-white/80">
            {r.name}
          </p>
          {r.favourite && <Star size={10} className="text-[#C9A84C] shrink-0 fill-current" />}
        </div>
        <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 truncate">
          {r.bank} · {r.country}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <span className={cn(
          'text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full',
          method.color
        )}>
          {r.method}
        </span>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[12px] font-mono font-medium tabular-nums text-stone-700 dark:text-white/65">
          {r.lastAmount}
        </p>
        <p className="text-[10px] font-mono text-stone-300 dark:text-white/20">{r.lastSent}</p>
      </div>
      <ChevronRight size={12}
        className="text-stone-200 dark:text-white/15 shrink-0
          group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors hidden sm:block" />
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW RECIPIENT FORM
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCIES_INTL = [
  { code: 'USD', name: 'US Dollar',         flag: 'USD' },
  { code: 'EUR', name: 'Euro',              flag: 'EUR' },
  { code: 'GBP', name: 'British Pound',     flag: 'GBP' },
  { code: 'JPY', name: 'Japanese Yen',      flag: 'JPY' },
  { code: 'CAD', name: 'Canadian Dollar',   flag: 'CAD' },
  { code: 'AUD', name: 'Australian Dollar', flag: 'AUD' },
  { code: 'CHF', name: 'Swiss Franc',       flag: 'CHF' },
  { code: 'SGD', name: 'Singapore Dollar',  flag: 'SGD' },
  { code: 'AED', name: 'UAE Dirham',        flag: 'AED' },
];

const METHODS_INTL: { id: TransferMethod; label: string; sub: string }[] = [
  { id: 'bank',  label: 'Local bank',   sub: 'Sort code / routing'    },
  { id: 'swift', label: 'SWIFT / Wire', sub: 'International transfers' },
  { id: 'sepa',  label: 'SEPA',         sub: 'Europe only, free'       },
  { id: 'nexus', label: 'Stonegate wallet', sub: 'Instant, no fee'         },
];

// Method-specific account number placeholders and labels
const METHOD_FIELD: Record<TransferMethod, { label: string; placeholder: string; extra?: { label: string; placeholder: string }[] }> = {
  bank:  { label: 'Account number',    placeholder: '0123456789',          extra: [{ label: 'Sort code / Routing',  placeholder: '04-00-04 or 021000021' }] },
  swift: { label: 'IBAN / Account no.',placeholder: 'GB29NWBK60161331...',  extra: [{ label: 'SWIFT / BIC',          placeholder: 'NWBKGB2L'              }] },
  sepa:  { label: 'IBAN',              placeholder: 'DE89 3704 0044 0532...', extra: [{ label: 'BIC (optional)',      placeholder: 'COBADEFFXXX'            }] },
  nexus: { label: 'Stonegate ID or email', placeholder: 'user@stonegate.bank or STG-XXXX', extra: [] },
};

const NewRecipientForm = ({ onDone }: { onDone: (r: Recipient) => void }) => {
  const [name,     setName]     = useState('');
  const [bank,     setBank]     = useState('');
  const [country,  setCountry]  = useState('');
  const [accNum,   setAccNum]   = useState('');
  const [extra1,   setExtra1]   = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method,   setMethod]   = useState<TransferMethod>('swift');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  const fieldConfig   = METHOD_FIELD[method];
  const visibleCurrencies = showAllCurrencies ? CURRENCIES_INTL : CURRENCIES_INTL.slice(0, 5);

  const valid = name.trim().length > 1 && accNum.trim().length > 3;

  const inputCls = cn(
    'w-full px-3.5 py-2.5 rounded-xl border text-[13px] outline-none transition-colors',
    'bg-stone-50 dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.08]',
    'text-stone-900 dark:text-white',
    'placeholder:text-stone-300 dark:placeholder:text-white/20',
    'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
  );

  const handleSubmit = () => {
    if (!valid) return;
    const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-sky-500 to-blue-600','from-violet-500 to-purple-600','from-emerald-500 to-teal-600','from-rose-500 to-pink-600'];
    onDone({
      id:          `new-${Date.now()}`,
      name:        name.trim(),
      initials,
      color:       colors[Math.floor(Math.random() * colors.length)],
      bank:        bank.trim() || 'External bank',
      accountNum:  accNum.trim(),
      currency,
      countryCode: currency,
      country:     country.trim() || 'International',
      method,
      favourite:   false,
      lastAmount:  '',
      lastSent:    '',
    });
  };

  return (
    <div className={cn(
      'rounded-2xl border p-4 sm:p-5 space-y-4',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>

      {/* Name + Bank row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
            Full name *
          </label>
          <input type="text" placeholder="Recipient full name"
            value={name} onChange={e => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
            Bank name
          </label>
          <input type="text" placeholder="e.g. Deutsche Bank, Barclays"
            value={bank} onChange={e => setBank(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
          Country
        </label>
        <input type="text" placeholder="e.g. Germany, United States, Nigeria"
          value={country} onChange={e => setCountry(e.target.value)} className={inputCls} />
      </div>

      {/* Transfer method — pill buttons */}
      <div>
        <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-2.5 block">
          Transfer method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {METHODS_INTL.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setMethod(m.id); setAccNum(''); setExtra1(''); }}
              className={cn(
                'flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all',
                method === m.id
                  ? 'bg-[#C9A84C]/[0.07] dark:bg-[#C9A84C]/[0.10] border-[#C9A84C]/30 dark:border-[#C9A84C]/25'
                  : cn(
                      'bg-stone-50 dark:bg-white/[0.02]',
                      'border-stone-200 dark:border-white/[0.08]',
                      'hover:border-stone-300 dark:hover:border-white/[0.15]'
                    )
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                method === m.id
                  ? 'border-[#C9A84C] bg-[#C9A84C]'
                  : 'border-stone-300 dark:border-white/25'
              )}>
                {method === m.id && <Check size={8} className="text-[#0C0C0D]" />}
              </div>
              <div className="min-w-0">
                <p className={cn(
                  'text-[12px] font-bold leading-none',
                  method === m.id ? 'text-[#C9A84C]' : 'text-stone-700 dark:text-white/65'
                )}>
                  {m.label}
                </p>
                <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 truncate">
                  {m.sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Account number field — changes based on method */}
      <div>
        <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
          {fieldConfig.label} *
        </label>
        <input type="text" placeholder={fieldConfig.placeholder}
          value={accNum} onChange={e => setAccNum(e.target.value)} className={inputCls} />
      </div>

      {/* Extra field (routing number / SWIFT BIC / etc.) */}
      {fieldConfig.extra && fieldConfig.extra.length > 0 && (
        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
            {fieldConfig.extra[0].label}
          </label>
          <input type="text" placeholder={fieldConfig.extra[0].placeholder}
            value={extra1} onChange={e => setExtra1(e.target.value)} className={inputCls} />
        </div>
      )}

      {/* Currency — pill grid */}
      <div>
        <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-2.5 block">
          Recipient currency
        </label>
        <div className="flex flex-wrap gap-2">
          {visibleCurrencies.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all',
                currency === c.code
                  ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C] shadow-sm'
                  : cn(
                      'bg-stone-50 dark:bg-white/[0.03]',
                      'border-stone-200 dark:border-white/[0.09]',
                      'text-stone-600 dark:text-white/50',
                      'hover:border-stone-300 dark:hover:border-white/[0.18]',
                      'hover:text-stone-900 dark:hover:text-white/80'
                    )
              )}
            >
              <span className="font-mono">{c.code}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAllCurrencies(s => !s)}
            className="px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all
              bg-stone-50 dark:bg-white/[0.03]
              border-stone-200 dark:border-white/[0.09]
              text-stone-400 dark:text-white/30
              hover:border-stone-300 dark:hover:border-white/[0.18]"
          >
            {showAllCurrencies ? 'Less' : '+ More'}
          </button>
        </div>
        {currency && (
          <p className="text-[10px] font-mono mt-1.5 text-stone-400 dark:text-white/25">
            Selected: {CURRENCIES_INTL.find(c => c.code === currency)?.name ?? currency}
          </p>
        )}
      </div>

      <button
        disabled={!valid}
        onClick={handleSubmit}
        className={cn(
          'w-full py-3 rounded-xl text-[13px] font-bold transition-all',
          valid
            ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]'
            : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
        )}
      >
        Continue to amount →
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AMOUNT STEP
// ─────────────────────────────────────────────────────────────────────────────

const AmountStep = ({
  recipient, account, accounts, onAccountChange, onBack, onNext,
}: {
  recipient: Recipient;
  account: Account;
  accounts: Account[];
  onAccountChange: (a: Account) => void;
  onBack: () => void;
  onNext: (amount: number, note: string) => void;
}) => {
  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');

  const num  = parseFloat(amount) || 0;
  const fee  = num * FEE_PCT;
  const gets = num - fee;
  const insufficient = num > account.balance && num > 0;
  const valid = num > 0 && !insufficient;

  const sym = account.symbol;

  return (
    <div className="space-y-4">

      {/* Selected recipient summary */}
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-2xl border',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]'
      )}>
        <Avatar r={recipient} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-stone-900 dark:text-white leading-none truncate">
            {recipient.name}
          </p>
          <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 truncate">
            {recipient.bank} · {recipient.country}
          </p>
        </div>
        <button onClick={onBack}
          className="text-[11px] font-bold text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors shrink-0">
          Change
        </button>
      </div>

      {/* From account */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
          text-stone-400 dark:text-white/25">
          From account
        </p>
        <AccountSelector selected={account} onSelect={onAccountChange} accounts={accounts} />
      </div>

      {/* Amount input */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
          text-stone-400 dark:text-white/25">
          Amount
        </p>
        <div className={cn(
          'flex items-center gap-2 rounded-xl border px-4 py-3.5 transition-colors',
          'bg-stone-50 dark:bg-white/[0.02]',
          amount
            ? 'border-[#C9A84C]/50 dark:border-[#C9A84C]/40'
            : 'border-stone-200 dark:border-white/[0.07]'
        )}>
          <span className="font-mono text-[15px] text-stone-300 dark:text-white/20 shrink-0">{sym}</span>
          <input
            type="number" inputMode="decimal" placeholder="0.00"
            value={amount} onChange={e => setAmount(e.target.value)}
            autoFocus
            className="flex-1 min-w-0 bg-transparent text-[22px] sm:text-[24px]
              font-mono font-medium outline-none
              text-stone-900 dark:text-white
              placeholder:text-stone-200 dark:placeholder:text-white/10
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none"
          />
          {amount && (
            <button onClick={() => setAmount('')}
              className="text-stone-300 dark:text-white/20 hover:text-stone-500 transition-colors shrink-0">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
            Balance: {account.balanceFmt}
          </span>
          {insufficient && (
            <span className="text-[10px] font-bold text-red-400">Insufficient funds</span>
          )}
        </div>
      </div>

      {/* Quick amounts */}
      <div
        className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {QUICK_AMOUNTS.map(q => (
          <button key={q} onClick={() => setAmount(String(q))}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono shrink-0 border transition-all',
              parseFloat(amount) === q
                ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C]'
                : cn(
                    'bg-white dark:bg-white/[0.02]',
                    'border-stone-200 dark:border-white/[0.07]',
                    'text-stone-500 dark:text-white/35',
                    'hover:border-[#C9A84C]/30 hover:text-[#C9A84C]/80'
                  )
            )}>
            {sym}{q.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Note */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
          text-stone-400 dark:text-white/25">
          Note (optional)
        </p>
        <input type="text" placeholder="What's this for?"
          value={note} onChange={e => setNote(e.target.value)}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl border text-[13px] outline-none transition-colors',
            'bg-stone-50 dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.08]',
            'text-stone-900 dark:text-white',
            'placeholder:text-stone-300 dark:placeholder:text-white/20',
            'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
          )} />
      </div>

      {/* Fee preview */}
      {num > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Info size={11} className="text-stone-300 dark:text-white/20 shrink-0" />
          <span className="text-[11px] font-mono text-stone-400 dark:text-white/25 truncate">
            Fee: {sym}{fee.toFixed(2)} · Recipient gets: {sym}{gets.toFixed(2)}
          </span>
        </div>
      )}

      <button
        disabled={!valid}
        onClick={() => onNext(num, note)}
        className={cn(
          'w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all',
          valid
            ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-lg shadow-[#C9A84C]/20 active:scale-[0.99]'
            : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
        )}
      >
        {!amount ? 'Enter an amount' : insufficient ? 'Insufficient funds' : 'Review transfer →'}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW STEP
// ─────────────────────────────────────────────────────────────────────────────

const ReviewStep = ({
  recipient, account, amount, note, onBack, onConfirm, submitting, submitError,
}: {
  recipient: Recipient; account: Account; amount: number; note: string;
  onBack: () => void; onConfirm: () => void;
  submitting?: boolean; submitError?: string | null;
}) => {
  const sym  = account.symbol;
  const fee  = amount * FEE_PCT;
  const gets = amount - fee;

  return (
    <div className="space-y-4">
      <button onClick={onBack}
        className="flex items-center gap-2 text-[12px] font-semibold transition-colors
          text-stone-400 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/60">
        ← Back
      </button>

      {/* Visual summary */}
      <div className={cn(
        'rounded-2xl border p-5',
        'bg-[#C9A84C]/[0.05] dark:bg-[#C9A84C]/[0.07]',
        'border-[#C9A84C]/15'
      )}>
        <div className="flex items-center gap-3 mb-4">
          <Avatar r={recipient} size="sm" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-stone-900 dark:text-white leading-none">
              {recipient.name}
            </p>
            <p className="text-[10px] text-stone-400 dark:text-white/30 mt-0.5">{recipient.bank} · {recipient.country}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-[#C9A84C] leading-none"
              style={{ fontSize: 'clamp(22px, 4vw, 28px)', letterSpacing: '-0.3px' }}>
              {sym}{amount.toLocaleString('en', { minimumFractionDigits: 2 })}
            </p>
            {note && (
              <p className="text-[11px] text-stone-400 dark:text-white/30 mt-0.5">&ldquo;{note}&rdquo;</p>
            )}
          </div>
        </div>
      </div>

      {/* Fee table */}
      <div className={cn(
        'rounded-2xl border divide-y overflow-hidden',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]',
        'divide-stone-100 dark:divide-white/[0.05]'
      )}>
        {[
          { label: 'From account',      value: `${account.code} · ···· ${account.balanceFmt}` },
          { label: 'To',                value: `${recipient.name} · ${recipient.bank}` },
          { label: 'You send',          value: `${sym}${amount.toFixed(2)}` },
          { label: 'Transfer fee (0.5%)',value: `– ${sym}${fee.toFixed(2)}`,   muted: true },
          { label: 'Recipient gets',    value: `${sym}${gets.toFixed(2)}`,    bold: true, accent: true },
          { label: 'Method',            value: METHOD_CONFIG[recipient.method].label },
          { label: 'Estimated arrival', value: recipient.method === 'nexus' ? 'Instant' : recipient.method === 'sepa' ? 'Same day' : recipient.method === 'swift' ? '1–3 business days' : '1–5 minutes' },
        ].map((r) => (
          <div key={r.label}
            className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-white/[0.01]">
            <span className={cn(
              'text-[12px] shrink-0',
              r.muted ? 'text-stone-400 dark:text-white/25' : 'text-stone-500 dark:text-white/40',
              r.bold  && 'font-semibold text-stone-800 dark:text-white/80 text-[13px]'
            )}>
              {r.label}
            </span>
            <span className={cn(
              'text-[12px] font-mono text-right truncate',
              r.muted  ? 'text-stone-300 dark:text-white/20' : 'text-stone-700 dark:text-white/65',
              r.accent && 'text-[#C9A84C] font-bold',
              r.bold   && 'font-bold text-[13px] text-stone-900 dark:text-white'
            )}>
              {r.value}
            </span>
          </div>
        ))}
      </div>

      {/* Trust notices */}
      <div className="space-y-2">
        {[
          { icon: Zap,      text: 'Funds arrive within 1–5 minutes' },
          { icon: Shield,   text: 'Transfer is encrypted end-to-end' },
          { icon: AlertCircle, text: 'Transfers cannot be reversed once confirmed' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-[11px]
            text-stone-400 dark:text-white/30">
            <Icon size={12} className="shrink-0 text-stone-300 dark:text-white/20" />
            {text}
          </div>
        ))}
      </div>

      {submitError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border
          bg-red-50 dark:bg-red-500/[0.06] border-red-200 dark:border-red-500/20">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-500 dark:text-red-400">{submitError}</p>
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={submitting}
        className={cn(
          'w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all',
          'shadow-lg shadow-[#C9A84C]/20',
          submitting
            ? 'bg-[#C9A84C]/60 text-[#0C0C0D]/60 cursor-not-allowed'
            : 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]'
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </span>
        ) : 'Confirm & send'}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STEP
// ─────────────────────────────────────────────────────────────────────────────

const SuccessStep = ({
  recipient, account, amount, note, onReset,
}: {
  recipient: Recipient; account: Account; amount: number; note: string; onReset: () => void;
}) => {
  const sym  = account.symbol;
  const fee  = amount * FEE_PCT;
  const ref  = `STG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(ref).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={cn(
      'rounded-2xl border p-6 sm:p-8 text-center',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10
        flex items-center justify-center mx-auto mb-5
        ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
        <CheckCircle2 size={30} className="text-emerald-500" />
      </div>

      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2
        text-stone-400 dark:text-white/25">
        Transfer sent
      </p>
      <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1"
        style={{ fontSize: 'clamp(26px, 5vw, 32px)', letterSpacing: '-0.5px' }}>
        {sym}{(amount - fee).toLocaleString('en', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[13px] text-stone-400 dark:text-white/30 mb-6">
        sent to {recipient.name.split(' ')[0]}
      </p>

      {/* Receipt */}
      <div className={cn(
        'rounded-xl border p-4 text-left mb-5',
        'bg-stone-50 dark:bg-white/[0.02]',
        'border-stone-100 dark:border-white/[0.06]'
      )}>
        {[
          { l: 'Recipient',  v: recipient.name },
          { l: 'Amount',     v: `${sym}${amount.toFixed(2)}` },
          { l: 'Fee',        v: `${sym}${fee.toFixed(2)}` },
          { l: 'They receive',v:`${sym}${(amount - fee).toFixed(2)}` },
          ...(note ? [{ l: 'Note', v: `"${note}"` }] : []),
        ].map(r => (
          <div key={r.l} className="flex justify-between gap-4 py-1.5">
            <span className="text-[12px] text-stone-400 dark:text-white/30 shrink-0">{r.l}</span>
            <span className="text-[12px] font-mono text-stone-700 dark:text-white/65 text-right truncate">{r.v}</span>
          </div>
        ))}

        {/* Reference with copy */}
        <div className="flex justify-between items-center gap-4 pt-1.5 mt-1
          border-t border-stone-100 dark:border-white/[0.06]">
          <span className="text-[12px] text-stone-400 dark:text-white/30 shrink-0">Reference</span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono text-stone-700 dark:text-white/65">{ref}</span>
            <button onClick={handleCopyRef}>
              {copied
                ? <CheckCircle2 size={13} className="text-emerald-500" />
                : <Copy size={13} className="text-stone-300 dark:text-white/20 hover:text-stone-500 transition-colors" />
              }
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button onClick={onReset}
          className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
          Send again
        </button>
        <button className={cn(
          'flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors border',
          'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
          'text-stone-600 dark:text-white/50'
        )}>
          View history
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'select' | 'amount' | 'review' | 'success';

const SendPage = () => {
  const { user }                    = useAuth();
  const { wallets, reload: reloadWallets } = useWallets();
  const { transactions }            = useTransactions(10);

  // Build live accounts from wallets
  const liveAccounts: Account[] = wallets.length > 0
    ? wallets.map(w => {
        const sym = CURRENCY_SYMBOLS[w.currency] ?? w.currency;
        return {
          code:       w.currency,
          name:       CURRENCY_NAMES[w.currency] ?? w.currency,
          symbol:     sym,
          balance:    w.balance,
          balanceFmt: `${sym}${w.balance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        };
      })
    : FALLBACK_ACCOUNTS;

  const [recipients,  setRecipients]  = useState<Recipient[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRecipients(((data ?? []) as DBBeneficiary[]).map(adaptBeneficiary)));
  }, [user?.id]);

  const [step,        setStep]        = useState<Step>('select');
  const [recipient,   setRecipient]   = useState<Recipient | null>(null);
  const [account,     setAccount]     = useState<Account>(liveAccounts[0]);
  const [amount,      setAmount]      = useState(0);
  const [note,        setNote]        = useState('');
  const [search,      setSearch]      = useState('');
  const [showNew,     setShowNew]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Keep account in sync when wallets load
  useEffect(() => {
    if (wallets.length > 0) {
      const la = wallets.map(w => {
        const sym = CURRENCY_SYMBOLS[w.currency] ?? w.currency;
        return { code: w.currency, name: CURRENCY_NAMES[w.currency] ?? w.currency, symbol: sym, balance: w.balance, balanceFmt: `${sym}${w.balance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
      });
      setAccount(prev => la.find(a => a.code === prev.code) ?? la[0]);
    }
  }, [wallets]);

  const filtered = useMemo(() => {
    if (!search.trim()) return recipients;
    const q = search.toLowerCase();
    return recipients.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.bank.toLowerCase().includes(q) ||
      r.accountNum.includes(q) ||
      r.currency.toLowerCase().includes(q)
    );
  }, [search, recipients]);

  const favourites = recipients.slice(0, 5);

  const handleSelectRecipient = (r: Recipient) => {
    setRecipient(r);
    setStep('amount');
    setShowNew(false);
  };

  const handleNewRecipient = (r: Recipient) => {
    setRecipient(r);
    setStep('amount');
  };

  const handleAmountNext = (amt: number, n: string) => {
    setAmount(amt);
    setNote(n);
    setStep('review');
  };

  const handleConfirm = async () => {
    if (!user || !recipient) return;
    const fee = amount * FEE_PCT;
    setSubmitting(true);
    setSubmitError(null);
    const { data, error } = await supabase.rpc('perform_transfer', {
      p_user_id:           user.id,
      p_currency:          account.code,
      p_amount:            amount,
      p_fee:               fee,
      p_recipient_name:    recipient.name,
      p_recipient_account: recipient.accountNum,
      p_description:       note || null,
    });
    setSubmitting(false);
    if (error || !data?.success) {
      setSubmitError(data?.error ?? error?.message ?? 'Transfer failed. Please try again.');
    } else {
      await reloadWallets();
      setStep('success');
    }
  };

  const handleReset = () => {
    setStep('select');
    setRecipient(null);
    setAmount(0);
    setNote('');
    setSearch('');
    setShowNew(false);
  };

  // ── SUCCESS ──────────────────────────────────────────────────────────────

  if (step === 'success' && recipient) {
    return (
      <div className="w-full max-w-[520px] mx-auto">
        <SuccessStep
          recipient={recipient} account={account}
          amount={amount} note={note} onReset={handleReset}
        />
        <div className="h-24 lg:h-12" />
      </div>
    );
  }

  // ── REVIEW ───────────────────────────────────────────────────────────────

  if (step === 'review' && recipient) {
    const fee  = amount * FEE_PCT;
    const gets = amount - fee;
    const sym  = account.symbol;
    return (
      <div className="w-full">
        <div className="mb-6 lg:mb-8">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
            text-stone-400 dark:text-white/25">
            Transfer
          </p>
          <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
            style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
            Review & confirm
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-5 lg:gap-8 items-start">
          {/* Left: review form */}
          <div>
            <ReviewStep
              recipient={recipient} account={account}
              amount={amount} note={note}
              onBack={() => setStep('amount')}
              onConfirm={handleConfirm}
              submitting={submitting}
              submitError={submitError}
            />
          </div>

          {/* Right: summary sidebar */}
          <div className="space-y-3">
            {/* Transfer summary card */}
            <div className={cn(
              'rounded-2xl border p-5',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-4
                text-stone-400 dark:text-white/25">
                Transfer summary
              </p>
              <div className="flex items-center gap-3 mb-4 pb-4
                border-b border-stone-100 dark:border-white/[0.06]">
                <Avatar r={recipient} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-stone-900 dark:text-white leading-none truncate">
                    {recipient.name}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 truncate">
                    {recipient.country} · {recipient.bank}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[12px] text-stone-400 dark:text-white/30">You send</span>
                  <span className="text-[12px] font-mono text-stone-700 dark:text-white/65">
                    {sym}{amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-stone-400 dark:text-white/30">Fee (0.5%)</span>
                  <span className="text-[12px] font-mono text-stone-400 dark:text-white/30">
                    −{sym}{fee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-100 dark:border-white/[0.06]">
                  <span className="text-[13px] font-bold text-stone-800 dark:text-white/80">Recipient gets</span>
                  <span className="text-[13px] font-bold font-mono text-[#C9A84C]">
                    {sym}{gets.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Method + arrival */}
            <div className={cn(
              'rounded-2xl border p-4',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-stone-500 dark:text-white/40">Method</span>
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full',
                  METHOD_CONFIG[recipient.method].color
                )}>
                  {METHOD_CONFIG[recipient.method].label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-stone-500 dark:text-white/40">Estimated</span>
                <span className="text-[12px] font-mono text-stone-700 dark:text-white/65">
                  {recipient.method === 'nexus' ? 'Instant' : recipient.method === 'sepa' ? 'Same day' : '1–5 minutes'}
                </span>
              </div>
            </div>

            {/* Trust notices */}
            <div className="space-y-2 px-1">
              {[
                { icon: Zap,         text: 'Instant settlement' },
                { icon: Shield,      text: 'End-to-end encrypted' },
                { icon: AlertCircle, text: 'Cannot be reversed' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[11px]
                  text-stone-400 dark:text-white/30">
                  <Icon size={11} className="shrink-0 text-stone-300 dark:text-white/20" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-24 lg:h-12" />
      </div>
    );
  }

  // ── AMOUNT ───────────────────────────────────────────────────────────────

  if (step === 'amount' && recipient) {
    return (
      <div className="w-full">
        <div className="mb-6 lg:mb-8">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
            text-stone-400 dark:text-white/25">
            Transfer
          </p>
          <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
            style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
            Send money
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-5 lg:gap-8 items-start">
          <div>
            <AmountStep
              recipient={recipient}
              account={account}
              accounts={liveAccounts}
              onAccountChange={setAccount}
              onBack={() => setStep('select')}
              onNext={handleAmountNext}
            />
          </div>
          <div className="space-y-3">
            <SectionRule label="Why Stonegate transfers" />
            {[
              { icon: Zap,    title: 'Instant settlement',  sub: 'Most transfers arrive in minutes' },
              { icon: Shield, title: 'Fully encrypted',     sub: '256-bit SSL, bank-grade security'  },
              { icon: Clock,  title: 'Low fees',            sub: 'Just 0.5% per transfer'            },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border',
                'bg-white dark:bg-white/[0.02]',
                'border-stone-200 dark:border-white/[0.07]'
              )}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                  bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08]">
                  <Icon size={13} className="text-[#C9A84C]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold leading-none tracking-[-0.1px]
                    text-stone-800 dark:text-white/80">{title}</p>
                  <p className="text-[11px] mt-1 text-stone-400 dark:text-white/30">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-24 lg:h-12" />
      </div>
    );
  }

  // ── SELECT RECIPIENT (default) ───────────────────────────────────────────

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Transfer funds
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Send money
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]
        gap-5 lg:gap-8 items-start">

        {/* ═══ LEFT: Recipient selection ═══ */}
        <div>

          {/* Search bar */}
          <div className={cn(
            'flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-colors mb-5',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]',
            'focus-within:border-[#C9A84C]/40'
          )}>
            <Search size={15} className="text-stone-300 dark:text-white/20 shrink-0" />
            <input
              type="text"
              placeholder="Search name, bank or account…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-[13px] outline-none
                text-stone-900 dark:text-white
                placeholder:text-stone-300 dark:placeholder:text-white/20"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="text-stone-300 dark:text-white/20 hover:text-stone-500 shrink-0">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Favourites quick-tap row */}
          {!search && (
            <div className="mb-5">
              <SectionRule label="Favourites" />
              <div
                className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {favourites.map(r => (
                  <button key={r.id} onClick={() => handleSelectRecipient(r)}
                    className="flex flex-col items-center gap-2 shrink-0 group">
                    <div className="relative">
                      <Avatar r={r} />
                      <div className="absolute inset-0 rounded-full flex items-center justify-center
                        bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={14} className="text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-stone-500 dark:text-white/40
                      max-w-[52px] truncate text-center">
                      {r.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recipient list */}
          <SectionRule label={search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'All recipients'} />

          {filtered.length === 0 ? (
            <div className={cn(
              'rounded-2xl border p-10 text-center',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <p className="text-[13px] font-semibold text-stone-400 dark:text-white/30 mb-1">
                {search ? 'No recipients found' : 'No beneficiaries yet'}
              </p>
              <p className="text-[11px] text-stone-300 dark:text-white/20 mb-4">
                {search ? 'Try a different name or account number' : 'Add one below to get started'}
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] font-bold text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className={cn(
              'rounded-2xl border overflow-hidden',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <div className="px-3 sm:px-4 py-1">
                {filtered.map(r => (
                  <RecipientRow key={r.id} r={r} onSelect={handleSelectRecipient} />
                ))}
              </div>
            </div>
          )}

          {/* New recipient toggle */}
          <div className="mt-4">
            <button
              onClick={() => setShowNew(!showNew)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left',
                showNew
                  ? 'bg-[#C9A84C]/[0.05] border-[#C9A84C]/25 text-[#C9A84C]'
                  : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07] text-stone-600 dark:text-white/50 hover:border-stone-300'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center shrink-0',
                  showNew ? 'bg-[#C9A84C]/20' : 'bg-stone-100 dark:bg-white/[0.06]'
                )}>
                  <User size={13} className={showNew ? 'text-[#C9A84C]' : 'text-stone-500 dark:text-white/40'} />
                </div>
                <span className="text-[13px] font-semibold">Send to a new recipient</span>
              </div>
              <ChevronDown size={14}
                className={cn('transition-transform', showNew && 'rotate-180')} />
            </button>

            {showNew && (
              <div className="mt-3">
                <NewRecipientForm onDone={handleNewRecipient} />
              </div>
            )}
          </div>

        </div>{/* end left column */}

        {/* ═══ RIGHT: Info panel ═══ */}
        <div className="space-y-4">

          {/* Recent activity */}
          <div>
            <SectionRule label="Recent transfers" />
            <div className={cn(
              'rounded-2xl border overflow-hidden',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              {(() => {
                const recentTx = transactions.filter(t => t.type === 'transfer_out' || t.type === 'withdrawal');
                if (recentTx.length === 0) return (
                  <p className="px-4 py-6 text-center text-[12px] text-stone-400 dark:text-white/25 font-mono">
                    No transfers yet
                  </p>
                );
                return recentTx.map((tx: Transaction) => {
                  const name = tx.recipient_name ?? tx.description ?? 'Transfer';
                  const initials = name.split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
                  const sym = CURRENCY_SYMBOLS[tx.from_currency ?? 'USD'] ?? '$';
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3
                      border-b border-stone-100 dark:border-white/[0.04] last:border-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        bg-gradient-to-br from-stone-500 to-stone-700 text-white text-[10px] font-bold">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-stone-800 dark:text-white/80 leading-none truncate">
                          {name}
                        </p>
                        <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 truncate">
                          {tx.recipient_account ?? tx.reference}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[12px] font-mono font-medium text-stone-600 dark:text-white/55 block">
                          -{sym}{(tx.from_amount ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
                          {timeAgo(tx.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Transfer limits */}
          <div>
            <SectionRule label="Transfer limits" />
            <div className={cn(
              'rounded-2xl border p-4',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              {[
                { label: 'Daily limit',      used: 3200,  total: 10000,  color: '#C9A84C' },
                { label: 'Monthly limit',    used: 8200,  total: 50000,  color: '#C9A84C' },
              ].map(bar => {
                const pct = Math.round((bar.used / bar.total) * 100);
                return (
                  <div key={bar.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] text-stone-500 dark:text-white/40">{bar.label}</span>
                      <span className="text-[11px] font-mono text-stone-400 dark:text-white/30">{pct}% used</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-stone-100 dark:bg-white/[0.06]">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: bar.color }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] font-mono text-stone-300 dark:text-white/20 mt-3 pt-3
                border-t border-stone-100 dark:border-white/[0.06]">
                Limits reset daily at 00:00 UTC ·{' '}
                <button className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors font-bold">
                  Upgrade →
                </button>
              </p>
            </div>
          </div>

        </div>{/* end right column */}

      </div>{/* end grid */}

      <div className="h-24 lg:h-12" />
    </div>
  );
};

export default SendPage;