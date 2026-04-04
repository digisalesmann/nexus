import { useState, useRef, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  Wifi,
  Globe,
  ChevronDown,
  CheckCircle2,
  Copy,
  Zap,
  Shield,
  Clock,
  Info,
  Check,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getFlag } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

interface Account {
  code:       string;
  name:       string;
  symbol:     string;
  balance:    number;
  balanceFmt: string;
  accountNum: string;
}

const ACCOUNTS: Account[] = [
  { code: 'USD', name: 'US Dollar',      symbol: '$',  balance: 14250.60, balanceFmt: '$14,250.60', accountNum: '4521 8830 1192 0047' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', balance: 850000,   balanceFmt: '₦850,000',   accountNum: '0123 4567 8901'       },
  { code: 'GBP', name: 'British Pound',  symbol: '£',  balance: 2100.00,  balanceFmt: '£2,100.00',  accountNum: '3309 5512 8820 1134'  },
  { code: 'EUR', name: 'Euro',           symbol: '€',  balance: 0,        balanceFmt: '€0.00',       accountNum: '7712 0044 3391 6680'  },
];

type MethodId = 'bank' | 'card' | 'ussd' | 'wire';

interface FundingMethod {
  id:       MethodId;
  label:    string;
  sub:      string;
  icon:     React.ElementType;
  fee:      string;
  time:     string;
  color:    string;
  iconBg:   string;
  limit:    string;
}

const METHODS: FundingMethod[] = [
  {
    id:     'bank',
    label:  'Bank transfer',
    sub:    'Fund directly from your bank account',
    icon:   Building2,
    fee:    'Free',
    time:   'Instant – 3 mins',
    color:  'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    limit:  'Up to $50,000/day',
  },
  {
    id:     'card',
    label:  'Debit / credit card',
    sub:    'Visa, Mastercard, Verve accepted',
    icon:   CreditCard,
    fee:    '1.5% fee',
    time:   'Instant',
    color:  'text-[#C9A84C]',
    iconBg: 'bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08]',
    limit:  'Up to $5,000/day',
  },
  {
    id:     'ussd',
    label:  'USSD / Mobile money',
    sub:    'Pay via your mobile network shortcode',
    icon:   Wifi,
    fee:    'Free',
    time:   '1 – 5 mins',
    color:  'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    limit:  'Up to ₦5,000,000/day',
  },
  {
    id:     'wire',
    label:  'International wire',
    sub:    'SWIFT / SEPA for global transfers',
    icon:   Globe,
    fee:    '$15 flat fee',
    time:   '1 – 3 business days',
    color:  'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    limit:  'Unlimited',
  },
];

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

const BANK_DETAILS = {
  bankName:    'Nexus Settlement Bank',
  accountName: 'Victor Okafor',
  accountNum:  '0123456789',
  sortCode:    '04-00-04',
  iban:        'GB29NWBK60161331926819',
  swift:       'NXUSgb2L',
  reference:   'NXS-TOP-4721',
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SECTION RULE
// ─────────────────────────────────────────────────────────────────────────────

const SectionRule = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 mb-5">
    <span className="text-[9px] font-bold tracking-[0.2em] uppercase shrink-0
      text-stone-400 dark:text-white/25">
      {label}
    </span>
    <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SELECTOR DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const AccountSelector = ({
  selected, onSelect,
}: {
  selected: Account;
  onSelect: (a: Account) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
        text-stone-400 dark:text-white/25">
        Deposit to
      </p>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all',
          'bg-white dark:bg-white/[0.03]',
          'border-stone-200 dark:border-white/[0.08]',
          'hover:border-stone-300 dark:hover:border-white/[0.16]',
          open && 'border-[#C9A84C]/40 dark:border-[#C9A84C]/30'
        )}
      >
        <img src={getFlag(selected.code)} alt={selected.code}
          className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-[14px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white leading-none">
            {selected.code}
          </p>
          <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 truncate">
            {selected.name} · {selected.balanceFmt}
          </p>
        </div>
        <ChevronDown size={14}
          className={cn('text-stone-400 dark:text-white/30 transition-transform duration-200 shrink-0',
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
          )}
            style={{ maxHeight: 260, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {ACCOUNTS.map(a => (
              <button
                key={a.code}
                onClick={() => { onSelect(a); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 transition-colors text-left',
                  'border-b border-stone-50 dark:border-white/[0.04] last:border-0',
                  a.code === selected.code
                    ? 'bg-[#C9A84C]/[0.07] dark:bg-[#C9A84C]/[0.10]'
                    : 'hover:bg-stone-50 dark:hover:bg-white/[0.04]'
                )}
              >
                <img src={getFlag(a.code)} alt={a.code}
                  className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-stone-800 dark:text-white/80 leading-none">{a.code}</p>
                  <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 truncate">{a.name}</p>
                </div>
                <p className="text-[11px] font-mono text-stone-400 dark:text-white/25 shrink-0">{a.balanceFmt}</p>
                {a.code === selected.code && (
                  <CheckCircle2 size={13} className="text-[#C9A84C] shrink-0 ml-1" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// METHOD CARD
// ─────────────────────────────────────────────────────────────────────────────

const MethodCard = ({
  method, selected, onSelect,
}: {
  method: FundingMethod;
  selected: boolean;
  onSelect: () => void;
}) => {
  const Icon = method.icon;
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all',
        selected
          ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/30 dark:border-[#C9A84C]/25 ring-1 ring-[#C9A84C]/15'
          : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07] hover:border-stone-300 dark:hover:border-white/[0.14]'
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
        selected ? 'bg-[#C9A84C]/20 dark:bg-[#C9A84C]/[0.15]' : method.iconBg
      )}>
        <Icon size={16} className={selected ? 'text-[#C9A84C]' : method.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-bold tracking-[-0.2px] leading-none
            text-stone-900 dark:text-white">
            {method.label}
          </p>
          <span className={cn(
            'text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0',
            method.fee === 'Free'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
              : 'text-[#C9A84C] bg-[#C9A84C]/10'
          )}>
            {method.fee}
          </span>
        </div>
        <p className="text-[11px] text-stone-400 dark:text-white/30 mt-0.5 truncate">
          {method.sub}
        </p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-mono text-stone-400 dark:text-white/25">
            <Clock size={10} className="shrink-0" />{method.time}
          </span>
          <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
            {method.limit}
          </span>
        </div>
      </div>

      {/* Selected indicator */}
      <div className={cn(
        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
        selected
          ? 'border-[#C9A84C] bg-[#C9A84C]'
          : 'border-stone-300 dark:border-white/20'
      )}>
        {selected && <Check size={9} className="text-[#0C0C0D]" />}
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BANK TRANSFER DETAILS
// ─────────────────────────────────────────────────────────────────────────────

const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center justify-between gap-4 py-3
      border-b border-stone-100 dark:border-white/[0.05] last:border-0">
      <div className="min-w-0">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-0.5
          text-stone-400 dark:text-white/25">{label}</p>
        <p className="text-[13px] font-mono font-medium text-stone-800 dark:text-white/80 truncate">
          {value}
        </p>
      </div>
      <button onClick={handleCopy}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
          text-stone-300 dark:text-white/20
          hover:text-stone-500 dark:hover:text-white/45
          hover:bg-stone-100 dark:hover:bg-white/[0.06]">
        {copied
          ? <CheckCircle2 size={13} className="text-emerald-500" />
          : <Copy size={13} />
        }
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QR CODE (SVG placeholder)
// ─────────────────────────────────────────────────────────────────────────────

const QRPlaceholder = ({ size = 120 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" className="rounded-xl">
    <rect width="120" height="120" className="fill-white dark:fill-white/[0.05]" rx="8" />
    {/* QR-like pattern */}
    {[
      [8,8,28,28], [84,8,28,28], [8,84,28,28],
    ].map(([x,y,w,h], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} rx="3" className="fill-stone-900 dark:fill-white" />
        <rect x={x+5} y={y+5} width={w-10} height={h-10} rx="1" className="fill-white dark:fill-[#111]" />
        <rect x={x+9} y={y+9} width={w-18} height={h-18} rx="1" className="fill-stone-900 dark:fill-white" />
      </g>
    ))}
    {/* Data dots */}
    {Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => {
        const skip = (r < 4 && c < 4) || (r < 4 && c >= 4 && c < 8 && r < 4 && c >= 4) || (r >= 4 && c < 4 && r >= 4);
        if ((r + c) % 2 === 0 || skip) return null;
        return <rect key={`${r}-${c}`} x={42 + c * 5} y={42 + r * 5} width="3.5" height="3.5" rx="0.5" className="fill-stone-900 dark:fill-white" />;
      })
    )}
    <text x="60" y="114" textAnchor="middle" fontSize="7" className="fill-stone-400 dark:fill-white/30">
      Scan to pay
    </text>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// CARD PAYMENT FORM
// ─────────────────────────────────────────────────────────────────────────────

const CardForm = ({ amount, symbol, onSubmit }: {
  amount: number; symbol: string; onSubmit: () => void;
}) => {
  const [cardNum,  setCardNum]  = useState('');
  const [expiry,   setExpiry]   = useState('');
  const [cvv,      setCvv]      = useState('');
  const [name,     setName]     = useState('');

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const valid = cardNum.replace(/\s/g, '').length === 16
    && expiry.length === 5
    && cvv.length >= 3
    && name.trim().length > 2;

  const inputCls = cn(
    'w-full px-3.5 py-2.5 rounded-xl border text-[13px] outline-none transition-colors',
    'bg-stone-50 dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.08]',
    'text-stone-900 dark:text-white',
    'placeholder:text-stone-300 dark:placeholder:text-white/20',
    'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
  );

  return (
    <div className="space-y-3.5">
      <div>
        <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
          Card number
        </label>
        <input
          type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
          value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">Expiry</label>
          <input type="text" inputMode="numeric" placeholder="MM/YY"
            value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
            className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">CVV</label>
          <input type="password" inputMode="numeric" placeholder="•••" maxLength={4}
            value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={inputCls} />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">Cardholder name</label>
        <input type="text" placeholder="As it appears on card"
          value={name} onChange={e => setName(e.target.value)}
          className={inputCls} />
      </div>

      {amount > 0 && (
        <div className="flex items-center justify-between py-2 px-3 rounded-xl
          bg-stone-50 dark:bg-white/[0.02] border border-stone-100 dark:border-white/[0.06]">
          <span className="text-[12px] text-stone-500 dark:text-white/40">Card fee (1.5%)</span>
          <span className="text-[12px] font-mono text-stone-700 dark:text-white/65">
            +{symbol}{(amount * 0.015).toFixed(2)}
          </span>
        </div>
      )}

      <button
        disabled={!valid || amount === 0}
        onClick={onSubmit}
        className={cn(
          'w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all',
          valid && amount > 0
            ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-lg shadow-[#C9A84C]/20'
            : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
        )}
      >
        {amount > 0 ? `Pay ${symbol}${amount.toFixed(2)} →` : 'Enter an amount first'}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// USSD INSTRUCTIONS
// ─────────────────────────────────────────────────────────────────────────────

const USSDPanel = ({ amount, account }: {
  amount: number; account: Account;
}) => (
  <div className="space-y-3.5">
    <div className={cn(
      'rounded-2xl border p-5',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3
        text-stone-400 dark:text-white/25">
        GTBank USSD
      </p>
      <div className="text-center py-4">
        <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1"
          style={{ fontSize: '28px', letterSpacing: '-0.3px' }}>
          *737*58*{amount > 0 ? amount : '0'}#
        </p>
        <p className="text-[11px] text-stone-400 dark:text-white/25">Dial on your registered phone</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-white/[0.06]">
        {[
          { network: 'GTBank',    code: `*737*58*${amount}#` },
          { network: 'Access',   code: `*901*000*${amount}#` },
          { network: 'Zenith',   code: `*966*${amount}#`     },
          { network: 'First Bank',code: `*894*${amount}#`    },
        ].map(b => (
          <div key={b.network} className={cn(
            'rounded-xl p-3 border',
            'bg-stone-50 dark:bg-white/[0.02]',
            'border-stone-100 dark:border-white/[0.06]'
          )}>
            <p className="text-[10px] font-bold text-stone-400 dark:text-white/25 mb-1">{b.network}</p>
            <p className="text-[12px] font-mono font-bold text-stone-800 dark:text-white/80">{b.code}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2 px-1">
      <Info size={12} className="text-stone-300 dark:text-white/20 shrink-0" />
      <p className="text-[11px] font-mono text-stone-400 dark:text-white/25">
        Ensure your phone is linked to your {account.code} account
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// WIRE INSTRUCTIONS
// ─────────────────────────────────────────────────────────────────────────────

const WirePanel = () => (
  <div className={cn(
    'rounded-2xl border overflow-hidden',
    'bg-white dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.07]'
  )}>
    <div className="px-5 pt-4 pb-2">
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-0.5
        text-stone-400 dark:text-white/25">
        Wire transfer details
      </p>
      <p className="text-[11px] text-stone-400 dark:text-white/25">
        Use these details to send from your bank
      </p>
    </div>
    <div className="px-5 py-1">
      <CopyRow label="Bank name"    value={BANK_DETAILS.bankName}    />
      <CopyRow label="Account name" value={BANK_DETAILS.accountName} />
      <CopyRow label="Account no."  value={BANK_DETAILS.accountNum}  />
      <CopyRow label="Sort code"    value={BANK_DETAILS.sortCode}    />
      <CopyRow label="IBAN"         value={BANK_DETAILS.iban}        />
      <CopyRow label="SWIFT / BIC"  value={BANK_DETAILS.swift}       />
      <CopyRow label="Reference"    value={BANK_DETAILS.reference}   />
    </div>
    <div className="px-5 py-3.5 border-t border-stone-100 dark:border-white/[0.06]
      bg-stone-50 dark:bg-white/[0.01]">
      <p className="text-[11px] font-mono text-stone-400 dark:text-white/25">
        ⚠️ Always include the reference number to avoid delays
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const SuccessScreen = ({
  amount, symbol, account, method, onReset,
}: {
  amount: number; symbol: string; account: Account;
  method: FundingMethod; onReset: () => void;
}) => {
  const ref = `NXS-DEP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const fee = method.id === 'card' ? amount * 0.015 : 0;

  return (
    <div className={cn(
      'rounded-2xl border p-6 sm:p-8 text-center',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10
        flex items-center justify-center mx-auto mb-5
        ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2
        text-stone-400 dark:text-white/25">
        {method.id === 'wire' || method.id === 'ussd'
          ? 'Instructions ready'
          : 'Deposit initiated'
        }
      </p>
      <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1"
        style={{ fontSize: 'clamp(26px, 5vw, 34px)', letterSpacing: '-0.5px' }}>
        {symbol}{amount.toLocaleString('en', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[13px] text-stone-400 dark:text-white/30 mb-6">
        to your {account.code} wallet
      </p>

      <div className={cn(
        'rounded-xl border p-4 text-left mb-5',
        'bg-stone-50 dark:bg-white/[0.02]',
        'border-stone-100 dark:border-white/[0.06]'
      )}>
        {[
          { l: 'Method',    v: method.label },
          { l: 'Amount',    v: `${symbol}${amount.toFixed(2)}` },
          ...(fee > 0 ? [{ l: 'Fee',  v: `${symbol}${fee.toFixed(2)}` }] : []),
          { l: 'Account',   v: `${account.code} · ···· ${account.accountNum.slice(-4)}` },
          { l: 'Estimated', v: method.time },
          { l: 'Reference', v: ref },
        ].map(r => (
          <div key={r.l} className="flex justify-between gap-4 py-1.5">
            <span className="text-[12px] text-stone-400 dark:text-white/30 shrink-0">{r.l}</span>
            <span className="text-[12px] font-mono text-stone-700 dark:text-white/65 text-right truncate">{r.v}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={onReset}
          className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]"
        >
          Add more money
        </button>
        <button className={cn(
          'flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors border',
          'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
          'text-stone-600 dark:text-white/50'
        )}>
          View transactions
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'form' | 'success';

const AddMoneyPage = () => {
  const [step,      setStep]      = useState<Step>('form');
  const [account,   setAccount]   = useState<Account>(ACCOUNTS[0]);
  const [method,    setMethod]    = useState<FundingMethod>(METHODS[0]);
  const [amount,    setAmount]    = useState('');

  const num    = parseFloat(amount) || 0;
  const sym    = account.symbol;
  const fee    = method.id === 'card' ? num * 0.015 : 0;
  const youGet = num - fee;

  const handleQuick = (v: number) => setAmount(String(v));

  const handleProceed = () => setStep('success');
  const handleReset   = () => {
    setStep('form');
    setAmount('');
  };

  if (step === 'success') {
    return (
      <div className="w-full max-w-[520px] mx-auto">
        <SuccessScreen
          amount={num} symbol={sym}
          account={account} method={method}
          onReset={handleReset}
        />
        <div className="h-24 lg:h-12" />
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Fund your wallet
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Add money
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]
        gap-5 lg:gap-8 items-start">

        {/* ═══════════ LEFT: Method selection + details ═══════════ */}
        <div className="space-y-4">

          {/* Account selector */}
          <div className={cn(
            'rounded-2xl border p-4 sm:p-5',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <AccountSelector selected={account} onSelect={setAccount} />
          </div>

          {/* Method cards */}
          <div>
            <SectionRule label="Funding method" />
            <div className="space-y-2.5">
              {METHODS.map(m => (
                <MethodCard
                  key={m.id}
                  method={m}
                  selected={method.id === m.id}
                  onSelect={() => setMethod(m)}
                />
              ))}
            </div>
          </div>

          {/* Method-specific details panel */}
          <div>
            <SectionRule label={
              method.id === 'bank'  ? 'Bank details' :
              method.id === 'card'  ? 'Card payment' :
              method.id === 'ussd'  ? 'USSD / mobile money' :
              'Wire instructions'
            } />

            {/* Bank transfer */}
            {method.id === 'bank' && (
              <div className="space-y-3.5">
                {/* QR + details side by side on sm+ */}
                <div className={cn(
                  'rounded-2xl border overflow-hidden',
                  'bg-white dark:bg-white/[0.02]',
                  'border-stone-200 dark:border-white/[0.07]'
                )}>
                  <div className="flex items-stretch flex-col sm:flex-row">
                    {/* QR code */}
                    <div className="flex items-center justify-center p-5 sm:border-r
                      border-stone-100 dark:border-white/[0.05] shrink-0">
                      <div className="text-center">
                        <QRPlaceholder size={110} />
                        <p className="text-[10px] font-mono text-stone-400 dark:text-white/25 mt-2">
                          Scan to pay
                        </p>
                      </div>
                    </div>
                    {/* Details */}
                    <div className="flex-1 px-4 sm:px-5 py-1 sm:py-2">
                      <CopyRow label="Bank name"    value={BANK_DETAILS.bankName}    />
                      <CopyRow label="Account name" value={BANK_DETAILS.accountName} />
                      <CopyRow label="Account no."  value={BANK_DETAILS.accountNum}  />
                      <CopyRow label="Sort code"    value={BANK_DETAILS.sortCode}    />
                      <CopyRow label="Reference"    value={BANK_DETAILS.reference}   />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <Info size={12} className="text-stone-300 dark:text-white/20 shrink-0" />
                  <p className="text-[11px] font-mono text-stone-400 dark:text-white/25">
                    Funds typically arrive within 1–5 minutes
                  </p>
                </div>
              </div>
            )}

            {/* Card */}
            {method.id === 'card' && (
              <div className={cn(
                'rounded-2xl border p-4 sm:p-5',
                'bg-white dark:bg-white/[0.02]',
                'border-stone-200 dark:border-white/[0.07]'
              )}>
                <CardForm amount={num} symbol={sym} onSubmit={handleProceed} />
              </div>
            )}

            {/* USSD */}
            {method.id === 'ussd' && (
              <USSDPanel amount={num} account={account} />
            )}

            {/* Wire */}
            {method.id === 'wire' && (
              <WirePanel />
            )}
          </div>

        </div>{/* end left column */}

        {/* ═══════════ RIGHT: Amount + summary ═══════════ */}
        <div className="space-y-4">

          {/* Amount input card */}
          <div className={cn(
            'rounded-2xl border overflow-hidden',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-3
                text-stone-400 dark:text-white/25">
                Amount to deposit
              </p>

              {/* Input */}
              <div className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-3.5 transition-colors mb-1.5',
                'bg-stone-50 dark:bg-white/[0.02]',
                amount
                  ? 'border-[#C9A84C]/50 dark:border-[#C9A84C]/40'
                  : 'border-stone-200 dark:border-white/[0.07]'
              )}>
                <span className="font-mono text-[15px] text-stone-300 dark:text-white/20 shrink-0">
                  {sym}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-[22px] sm:text-[24px]
                    font-mono font-medium outline-none
                    text-stone-900 dark:text-white
                    placeholder:text-stone-200 dark:placeholder:text-white/10
                    [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none"
                />
                {amount && (
                  <button
                    onClick={() => setAmount('')}
                    className="text-stone-300 dark:text-white/20
                      hover:text-stone-500 dark:hover:text-white/45 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-[10px] font-mono text-stone-300 dark:text-white/20 px-1">
                Current balance: {account.balanceFmt}
              </p>
            </div>

            {/* Quick amount chips */}
            <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-white/[0.05]">
              <div
                className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase shrink-0
                  text-stone-300 dark:text-white/20 mr-1">
                  Quick
                </span>
                {QUICK_AMOUNTS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleQuick(q)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono shrink-0 border transition-all',
                      parseFloat(amount) === q
                        ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C]'
                        : cn(
                            'bg-stone-50 dark:bg-white/[0.02]',
                            'border-stone-200 dark:border-white/[0.07]',
                            'text-stone-500 dark:text-white/35',
                            'hover:border-[#C9A84C]/30 hover:text-[#C9A84C]/80'
                          )
                    )}
                  >
                    {sym}{q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee summary */}
            {num > 0 && (
              <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-white/[0.05]
                bg-stone-50 dark:bg-white/[0.01]">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-stone-500 dark:text-white/40">You send</span>
                    <span className="font-mono text-stone-700 dark:text-white/65">
                      {sym}{num.toFixed(2)}
                    </span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-stone-400 dark:text-white/25">Fee (1.5%)</span>
                      <span className="font-mono text-stone-500 dark:text-white/40">
                        -{sym}{fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px] font-bold pt-1.5
                    border-t border-stone-100 dark:border-white/[0.06]">
                    <span className="text-stone-700 dark:text-white/65">You receive</span>
                    <span className="font-mono text-[#C9A84C]">
                      {sym}{youGet.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA — only for bank transfer (others have their own) */}
          {(method.id === 'bank' || method.id === 'wire' || method.id === 'ussd') && (
            <button
              disabled={method.id === 'bank' && num === 0}
              onClick={handleProceed}
              className={cn(
                'w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all',
                num > 0 || method.id !== 'bank'
                  ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-lg shadow-[#C9A84C]/20 active:scale-[0.99]'
                  : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
              )}
            >
              {method.id === 'bank'  && (num > 0 ? `I've sent ${sym}${num.toFixed(2)} →` : 'Enter an amount')}
              {method.id === 'wire'  && 'I understand, copy details →'}
              {method.id === 'ussd'  && (num > 0 ? `Confirm ${sym}${num.toFixed(2)} →` : 'Enter an amount')}
            </button>
          )}

          {/* Trust / info cards */}
          <div className="space-y-2.5">
            {[
              { icon: Zap,    title: 'Instant processing',  sub: `${method.time} to your wallet`        },
              { icon: Shield, title: 'Bank-grade security', sub: '256-bit SSL, PCI-DSS compliant'       },
              { icon: Clock,  title: 'No hidden charges',   sub: `Fee: ${method.fee} · ${method.limit}` },
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
                    text-stone-800 dark:text-white/80">
                    {title}
                  </p>
                  <p className="text-[11px] mt-0.5 text-stone-400 dark:text-white/30">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>{/* end right column */}

      </div>{/* end grid */}

      <div className="h-24 lg:h-12" />
    </div>
  );
};

export default AddMoneyPage;