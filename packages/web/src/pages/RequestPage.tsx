import { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Copy,
  CheckCircle2,
  ChevronDown,
  Check,
  Link2,
  Mail,
  QrCode,
  ArrowDownLeft,
  Trash2,
  ChevronRight,
  Star,
  Send,
  Share2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getFlag } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
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
  { code:'USD', name:'US Dollar',      symbol:'$',  balance:14250.60, balanceFmt:'$14,250.60', accountNum:'4521 8830 1192 0047' },
  { code:'GBP', name:'British Pound',  symbol:'£',  balance:2100.00,  balanceFmt:'£2,100.00',  accountNum:'3309 5512 8820 1134' },
  { code:'EUR', name:'Euro',           symbol:'€',  balance:3800.00,  balanceFmt:'€3,800.00',  accountNum:'7712 0044 3391 6680' },
  { code:'NGN', name:'Nigerian Naira', symbol:'₦', balance:850000,   balanceFmt:'₦850,000',   accountNum:'0123 4567 8901'      },
];

interface Contact {
  id:       string;
  name:     string;
  initials: string;
  color:    string;
  email:    string;
  country:  string;
  favourite:boolean;
}

const CONTACTS: Contact[] = [
  { id:'c01', name:'Sophie Müller',    initials:'SM', color:'from-sky-500 to-blue-600',       email:'sophie@example.com',   country:'Germany',        favourite:true  },
  { id:'c02', name:'Amina Bello',      initials:'AB', color:'from-violet-500 to-purple-600',  email:'amina@example.com',    country:'United Kingdom',  favourite:true  },
  { id:'c03', name:'Marcus Chen',      initials:'MC', color:'from-emerald-500 to-teal-600',   email:'marcus@example.com',   country:'United States',   favourite:true  },
  { id:'c04', name:'Yuki Tanaka',      initials:'YT', color:'from-rose-500 to-pink-600',      email:'yuki@example.com',     country:'Japan',           favourite:false },
  { id:'c05', name:'Fatima Al-Rashid', initials:'FA', color:'from-amber-500 to-orange-600',   email:'fatima@example.com',   country:'UAE',             favourite:false },
  { id:'c06', name:'TechCorp Ltd.',    initials:'TC', color:'from-slate-500 to-slate-700',    email:'billing@techcorp.com', country:'United States',   favourite:true  },
  { id:'c07', name:'Léa Dubois',       initials:'LD', color:'from-fuchsia-500 to-pink-600',   email:'lea@example.com',      country:'France',          favourite:false },
];

type RequestStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

interface PaymentRequest {
  id:        string;
  from:      string;
  initials:  string;
  color:     string;
  amount:    string;
  currency:  string;
  note:      string;
  status:    RequestStatus;
  created:   string;
  expires:   string;
}

const PAST_REQUESTS: PaymentRequest[] = [
  { id:'req01', from:'Marcus Chen',   initials:'MC', color:'from-emerald-500 to-teal-600',  amount:'$2,500.00', currency:'USD', note:'Q1 invoice #4421',       status:'paid',      created:'2d ago',   expires:'—'       },
  { id:'req02', from:'Amina Bello',   initials:'AB', color:'from-violet-500 to-purple-600', amount:'£850.00',   currency:'GBP', note:'Design work March',      status:'pending',   created:'5h ago',   expires:'6d'      },
  { id:'req03', from:'Sophie Müller', initials:'SM', color:'from-sky-500 to-blue-600',      amount:'€380.00',   currency:'EUR', note:'Dinner split',           status:'pending',   created:'1d ago',   expires:'7d'      },
  { id:'req04', from:'TechCorp Ltd.', initials:'TC', color:'from-slate-500 to-slate-700',   amount:'$4,500.00', currency:'USD', note:'Monthly retainer Apr',   status:'paid',      created:'1w ago',   expires:'—'       },
  { id:'req05', from:'Yuki Tanaka',   initials:'YT', color:'from-rose-500 to-pink-600',     amount:'$320.00',   currency:'USD', note:'Consultation fee',       status:'expired',   created:'2w ago',   expires:'—'       },
  { id:'req06', from:'Léa Dubois',    initials:'LD', color:'from-fuchsia-500 to-pink-600',  amount:'€640.00',   currency:'EUR', note:'Event photography',      status:'cancelled', created:'3w ago',   expires:'—'       },
];

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string }> = {
  pending:   { label:'Pending',   color:'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'       },
  paid:      { label:'Paid',      color:'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
  expired:   { label:'Expired',   color:'text-stone-400 dark:text-white/30 bg-stone-100 dark:bg-white/[0.06]'         },
  cancelled: { label:'Cancelled', color:'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10'                },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────────────────────────────────────

const SectionRule = ({ label, action }: {
  label: string;
  action?: { text: string; onClick?: () => void };
}) => (
  <div className="flex items-center gap-4 mb-4">
    <span className="text-[9px] font-bold tracking-[0.2em] uppercase shrink-0
      text-stone-400 dark:text-white/25">
      {label}
    </span>
    <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
    {action && (
      <button onClick={action.onClick}
        className="text-[10px] font-bold tracking-[0.12em] uppercase shrink-0 transition-colors
          text-[#C9A84C]/70 hover:text-[#C9A84C]">
        {action.text}
      </button>
    )}
  </div>
);

const ContactAvatar = ({ c, size = 'md' }: { c: Contact; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'lg' ? 'w-14 h-14 text-[17px]'
    : size === 'sm' ? 'w-8 h-8 text-[11px]'
    : 'w-10 h-10 text-[13px]';
  return (
    <div className={cn(dim, 'rounded-full flex items-center justify-center shrink-0 font-bold text-white',
      `bg-gradient-to-br ${c.color}`)}>
      {c.initials}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

const AccountSelector = ({ selected, onSelect }: {
  selected: Account; onSelect: (a: Account) => void;
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
      <button onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border transition-all',
          'bg-white dark:bg-white/[0.03]',
          'border-stone-200 dark:border-white/[0.08]',
          'hover:border-stone-300 dark:hover:border-white/[0.16]',
          open && 'border-[#C9A84C]/40 dark:border-[#C9A84C]/30'
        )}>
        <img src={getFlag(selected.code)} alt={selected.code}
          className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <span className="text-[13px] font-bold text-stone-900 dark:text-white">{selected.code}</span>
          <span className="text-[11px] text-stone-400 dark:text-white/25 ml-2 font-mono">{selected.balanceFmt}</span>
        </div>
        <ChevronDown size={13} className={cn(
          'text-stone-400 dark:text-white/30 transition-transform shrink-0',
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
            {ACCOUNTS.map(a => (
              <button key={a.code} onClick={() => { onSelect(a); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                  'border-b border-stone-50 dark:border-white/[0.04] last:border-0',
                  a.code === selected.code ? 'bg-[#C9A84C]/[0.07]' : 'hover:bg-stone-50 dark:hover:bg-white/[0.04]'
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
// QR CODE SVG
// ─────────────────────────────────────────────────────────────────────────────

const QRCode = ({ size = 140 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 140 140"
    className="rounded-2xl" style={{ background: 'white' }}>
    {/* Corner squares */}
    {([[8,8],[96,8],[8,96]] as [number,number][]).map(([x,y],i) => (
      <g key={i}>
        <rect x={x} y={y} width={36} height={36} rx="4" fill="#0C0C0D" />
        <rect x={x+6} y={y+6} width={24} height={24} rx="2" fill="white" />
        <rect x={x+11} y={y+11} width={14} height={14} rx="1" fill="#0C0C0D" />
      </g>
    ))}
    {/* Data pattern */}
    {[
      [50,8],[56,8],[62,8],[68,8],[74,8],[80,8],
      [50,14],[62,14],[74,14],
      [50,20],[56,20],[68,20],[80,20],
      [8,50],[20,50],[26,50],[38,50],[44,50],
      [8,56],[14,56],[26,56],[38,56],
      [8,62],[20,62],[32,62],[44,62],
      [8,68],[26,68],[38,68],
      [8,74],[14,74],[20,74],[32,74],[44,74],
      [8,80],[20,80],[26,80],[38,80],
      [50,50],[56,50],[62,50],[74,50],[80,50],
      [50,56],[68,56],[80,56],
      [50,62],[56,62],[62,62],[74,62],
      [50,68],[62,68],[68,68],[80,68],
      [50,74],[56,74],[68,74],[80,74],
      [50,80],[56,80],[62,80],[74,80],
    ].map(([x,y],i) => (
      <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill="#0C0C0D" />
    ))}
    <text x="70" y="134" textAnchor="middle" fontSize="8" fill="#6b7280">stonegate.pay/req</text>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// COPY ROW
// ─────────────────────────────────────────────────────────────────────────────

const CopyRow = ({ label, value, mono = true }: {
  label: string; value: string; mono?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center gap-3 py-3
      border-b border-stone-100 dark:border-white/[0.05] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-0.5
          text-stone-400 dark:text-white/25">{label}</p>
        <p className={cn(
          'text-[12px] font-medium truncate text-stone-800 dark:text-white/75',
          mono && 'font-mono'
        )}>{value}</p>
      </div>
      <button onClick={handleCopy}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
          text-stone-300 dark:text-white/20
          hover:text-stone-500 dark:hover:text-white/45
          hover:bg-stone-100 dark:hover:bg-white/[0.06]">
        {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARE OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const ShareOptions = ({ amount, sym, account, note }: {
  amount: number; sym: string; account: Account; note: string;
}) => {
  const link = `https://stonegate.pay/req/${account.code.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;
  const [emailInput, setEmailInput]   = useState('');
  const [emailSent,  setEmailSent]    = useState(false);
  const [activeTab,  setActiveTab]    = useState<'link' | 'qr' | 'email'>('link');

  const handleSendEmail = () => {
    if (!emailInput.includes('@')) return;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 2000);
    setEmailInput('');
  };

  const tabs = [
    { id: 'link'  as const, icon: Link2,         label: 'Link'  },
    { id: 'qr'    as const, icon: QrCode,        label: 'QR'    },
    { id: 'email' as const, icon: Mail,          label: 'Email' },
  ];

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      {/* Tab row */}
      <div className="flex border-b border-stone-100 dark:border-white/[0.06]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-bold transition-colors',
                activeTab === tab.id
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] bg-[#C9A84C]/[0.04]'
                  : 'text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/50'
              )}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        {/* Link tab */}
        {activeTab === 'link' && (
          <div className="space-y-3">
            <CopyRow label="Payment link" value={link} />
            <CopyRow label="Account number" value={account.accountNum} />
            <div className="pt-1">
              <p className="text-[10px] font-mono text-stone-400 dark:text-white/25">
                Share this link, anyone can use it to pay you {sym}{amount > 0 ? amount.toFixed(2) : '(any amount)'}
              </p>
            </div>
          </div>
        )}

        {/* QR tab */}
        {activeTab === 'qr' && (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="shrink-0">
              <QRCode size={140} />
            </div>
            <div className="flex-1 min-w-0 space-y-3 w-full sm:w-auto">
              <div>
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
                  text-stone-400 dark:text-white/25">
                  Scan to pay
                </p>
                <p className="text-[13px] font-bold text-stone-900 dark:text-white">
                  {sym}{amount > 0 ? amount.toFixed(2) : '(any amount)'}
                </p>
                {note && (
                  <p className="text-[11px] text-stone-400 dark:text-white/30 mt-0.5">
                    &ldquo;{note}&rdquo;
                  </p>
                )}
              </div>
              <button className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-colors',
                'bg-stone-50 dark:bg-white/[0.02]',
                'border-stone-200 dark:border-white/[0.08]',
                'text-stone-600 dark:text-white/50',
                'hover:border-stone-300 dark:hover:border-white/[0.15]'
              )}>
                <Share2 size={13} />
                Download QR
              </button>
            </div>
          </div>
        )}

        {/* Email tab */}
        {activeTab === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                Send request to
              </label>
              <div className={cn(
                'flex items-center gap-2 rounded-xl border transition-colors',
                'bg-stone-50 dark:bg-white/[0.02]',
                emailInput ? 'border-[#C9A84C]/40' : 'border-stone-200 dark:border-white/[0.08]'
              )}>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
                  className="flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-[13px] outline-none
                    text-stone-900 dark:text-white
                    placeholder:text-stone-300 dark:placeholder:text-white/20"
                />
                {emailInput && (
                  <button onClick={() => setEmailInput('')}
                    className="pr-2 text-stone-300 dark:text-white/20 hover:text-stone-500 transition-colors">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleSendEmail}
              disabled={!emailInput.includes('@')}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all',
                emailSent
                  ? 'bg-emerald-500 text-white'
                  : emailInput.includes('@')
                    ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]'
                    : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
              )}
            >
              {emailSent ? <><CheckCircle2 size={14} /> Sent!</> : <><Send size={14} /> Send request</>}
            </button>
            <p className="text-[10px] font-mono text-stone-400 dark:text-white/25">
              They'll receive a secure link to pay you directly
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST CARD (history item)
// ─────────────────────────────────────────────────────────────────────────────

const RequestCard = ({ req, onCancel }: {
  req: PaymentRequest; onCancel: (id: string) => void;
}) => {
  const cfg = STATUS_CONFIG[req.status];
  return (
    <div className="flex items-center gap-3 py-3.5
      border-b border-stone-100 dark:border-white/[0.04] last:border-0
      group hover:bg-stone-50 dark:hover:bg-white/[0.02]
      -mx-2 px-2 rounded-xl transition-colors">
      {/* Avatar */}
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
        'text-white text-[11px] font-bold',
        `bg-gradient-to-br ${req.color}`
      )}>
        {req.initials}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold leading-none text-stone-800 dark:text-white/80 truncate">
            {req.from}
          </p>
          <span className={cn(
            'text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full shrink-0',
            cfg.color
          )}>
            {cfg.label}
          </span>
        </div>
        <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 truncate">
          {req.note} · {req.created}
        </p>
      </div>

      {/* Amount */}
      <p className="text-[13px] font-mono font-bold text-stone-800 dark:text-white/80 shrink-0 tabular-nums">
        {req.amount}
      </p>

      {/* Cancel button for pending */}
      {req.status === 'pending' && (
        <button
          onClick={() => onCancel(req.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
            text-stone-200 dark:text-white/15
            hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08]
            opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const SuccessScreen = ({
  amount, account, note, contact, onReset,
}: {
  amount: number; account: Account; note: string;
  contact: Contact | null; onReset: () => void;
}) => {
  const sym = account.symbol;
  const ref = `STG-REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return (
    <div className={cn(
      'rounded-2xl border p-6 sm:p-8 text-center',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.12]
        flex items-center justify-center mx-auto mb-5
        ring-4 ring-[#C9A84C]/[0.08]">
        <ArrowDownLeft size={28} className="text-[#C9A84C]" />
      </div>

      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2
        text-stone-400 dark:text-white/25">
        Request created
      </p>
      <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1"
        style={{ fontSize: 'clamp(26px, 5vw, 32px)', letterSpacing: '-0.5px' }}>
        {sym}{amount > 0
          ? amount.toLocaleString('en', { minimumFractionDigits: 2 })
          : 'Any amount'
        }
      </p>
      {contact && (
        <p className="text-[13px] text-stone-400 dark:text-white/30 mb-6">
          requested from {contact.name.split(' ')[0]}
        </p>
      )}
      {!contact && (
        <p className="text-[13px] text-stone-400 dark:text-white/30 mb-6">open payment request</p>
      )}

      {/* Receipt table */}
      <div className={cn(
        'rounded-xl border p-4 text-left mb-5',
        'bg-stone-50 dark:bg-white/[0.02]',
        'border-stone-100 dark:border-white/[0.06]'
      )}>
        {[
          { l: 'Account',   v: `${account.code} · ···· ${account.accountNum.slice(-4)}` },
          { l: 'Amount',    v: amount > 0 ? `${sym}${amount.toFixed(2)}` : 'Open'        },
          ...(note ? [{ l: 'Note', v: `"${note}"` }] : []),
          { l: 'Expires',   v: '7 days'                                                 },
          { l: 'Reference', v: ref                                                       },
        ].map(r => (
          <div key={r.l} className="flex justify-between gap-4 py-1.5">
            <span className="text-[12px] text-stone-400 dark:text-white/30 shrink-0">{r.l}</span>
            <span className="text-[12px] font-mono text-stone-700 dark:text-white/65 text-right truncate">{r.v}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button onClick={onReset}
          className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
          New request
        </button>
        <button className={cn(
          'flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors border',
          'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
          'text-stone-600 dark:text-white/50'
        )}>
          Share link
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'form' | 'success';

const RequestPage = () => {
  const [step,      setStep]      = useState<Step>('form');
  const [account,   setAccount]   = useState<Account>(ACCOUNTS[0]);
  const [amount,    setAmount]    = useState('');
  const [note,      setNote]      = useState('');
  const [contact,   setContact]   = useState<Contact | null>(null);
  const [search,    setSearch]    = useState('');
  const [requests,  setRequests]  = useState<PaymentRequest[]>(PAST_REQUESTS);
  const [filter,    setFilter]    = useState<'all' | RequestStatus>('all');

  const num  = parseFloat(amount) || 0;
  const sym  = account.symbol;

  const filteredContacts = search.trim()
    ? CONTACTS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    : CONTACTS;

  const favouriteContacts = CONTACTS.filter(c => c.favourite);

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const totalPending = requests
    .filter(r => r.status === 'pending')
    .reduce((s, r) => s + parseFloat(r.amount.replace(/[^0-9.]/g, '')), 0);

  const handleCancelRequest = (id: string) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'cancelled' as RequestStatus } : r
    ));
  };

  const handleCreate = () => setStep('success');
  const handleReset  = () => {
    setStep('form');
    setAmount('');
    setNote('');
    setContact(null);
  };

  // ── SUCCESS ──────────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div className="w-full max-w-[520px] mx-auto">
        <SuccessScreen
          amount={num} account={account} note={note}
          contact={contact} onReset={handleReset}
        />
        <div className="h-24 lg:h-12" />
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Payment requests
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Request money
        </h1>
      </div>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]
        gap-5 lg:gap-8 items-start">

        {/* ═══════════ LEFT: Request form ═══════════ */}
        <div className="space-y-5">

          {/* Step 1: Account + amount */}
          <div className={cn(
            'rounded-2xl border overflow-hidden',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3
                text-stone-400 dark:text-white/25">
                Receiving account
              </p>
              <AccountSelector selected={account} onSelect={setAccount} />
            </div>

            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
                text-stone-400 dark:text-white/25">
                Amount to request
              </p>
              <div className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-3 transition-colors',
                'bg-stone-50 dark:bg-white/[0.02]',
                amount
                  ? 'border-[#C9A84C]/50 dark:border-[#C9A84C]/40'
                  : 'border-stone-200 dark:border-white/[0.07]'
              )}>
                <span className="font-mono text-[15px] text-stone-300 dark:text-white/20 shrink-0">{sym}</span>
                <input
                  type="number" inputMode="decimal" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)}
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

              {/* Flexible amount note */}
              <p className="text-[10px] font-mono mt-1.5 text-stone-400 dark:text-white/25 px-1">
                Leave empty to request any amount
              </p>
            </div>

            {/* Quick amounts */}
            <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-white/[0.05]">
              <div
                className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none' }}
              >
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase shrink-0
                  text-stone-300 dark:text-white/20 mr-1 self-center">
                  Quick
                </span>
                {QUICK_AMOUNTS.map(q => (
                  <button key={q} onClick={() => setAmount(String(q))}
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
                    )}>
                    {sym}{q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-stone-100 dark:border-white/[0.05] pt-3">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
                text-stone-400 dark:text-white/25">
                Note (optional)
              </p>
              <input type="text" placeholder="What's this for? e.g. Invoice #4421"
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
          </div>

          {/* Step 2: Request from a contact (optional) */}
          <div>
            <SectionRule label="Request from a contact" action={{ text: 'Skip' }} />

            {/* Favourites strip */}
            <div
              className="flex gap-3 overflow-x-auto pb-2 mb-4 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* None option */}
              <button
                onClick={() => setContact(null)}
                className={cn(
                  'flex flex-col items-center gap-2 shrink-0 group'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all border-2',
                  !contact
                    ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                    : 'border-dashed border-stone-200 dark:border-white/[0.10] group-hover:border-stone-300'
                )}>
                  {!contact
                    ? <Check size={14} className="text-[#C9A84C]" />
                    : <X size={14} className="text-stone-300 dark:text-white/20" />
                  }
                </div>
                <span className="text-[10px] font-medium text-stone-400 dark:text-white/30">Anyone</span>
              </button>

              {favouriteContacts.map(c => (
                <button key={c.id} onClick={() => setContact(c)}
                  className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className="relative">
                    <ContactAvatar c={c} />
                    {contact?.id === c.id && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center
                        bg-[#C9A84C]/80">
                        <Check size={14} className="text-[#0C0C0D]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-stone-500 dark:text-white/40
                    max-w-[52px] truncate text-center">
                    {c.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Contact search */}
            <div className={cn(
              'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-colors mb-3',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]',
              'focus-within:border-[#C9A84C]/40'
            )}>
              <Search size={14} className="text-stone-300 dark:text-white/20 shrink-0" />
              <input
                type="text" placeholder="Search contacts…"
                value={search} onChange={e => setSearch(e.target.value)}
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

            {/* Contact list */}
            <div className={cn(
              'rounded-2xl border overflow-hidden',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <div className="px-3 sm:px-4 py-1">
                {filteredContacts.map(c => (
                  <button key={c.id} onClick={() => setContact(c)}
                    className={cn(
                      'w-full flex items-center gap-3 py-3 -mx-2 px-2 rounded-xl transition-colors text-left',
                      'border-b border-stone-100 dark:border-white/[0.04] last:border-0',
                      contact?.id === c.id
                        ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08]'
                        : 'hover:bg-stone-50 dark:hover:bg-white/[0.02]'
                    )}>
                    <ContactAvatar c={c} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-[13px] font-semibold text-stone-800 dark:text-white/80 leading-none truncate">
                          {c.name}
                        </p>
                        {c.favourite && <Star size={9} className="text-[#C9A84C] shrink-0 fill-current" />}
                      </div>
                      <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 truncate">
                        {c.email} · {c.country}
                      </p>
                    </div>
                    {contact?.id === c.id ? (
                      <CheckCircle2 size={15} className="text-[#C9A84C] shrink-0" />
                    ) : (
                      <ChevronRight size={12}
                        className="text-stone-200 dark:text-white/15 shrink-0 hidden sm:block" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Share options — only shown if amount is set */}
          {num > 0 && (
            <div>
              <SectionRule label="Share request" />
              <ShareOptions amount={num} sym={sym} account={account} note={note} />
            </div>
          )}

          {/* Create request CTA */}
          <button
            onClick={handleCreate}
            className={cn(
              'w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all',
              'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]',
              'shadow-lg shadow-[#C9A84C]/20 active:scale-[0.99]'
            )}
          >
            {contact
              ? `Request ${num > 0 ? `${sym}${num.toFixed(2)}` : 'money'} from ${contact.name.split(' ')[0]} →`
              : `Create ${num > 0 ? `${sym}${num.toFixed(2)}` : 'open'} payment request →`
            }
          </button>

        </div>{/* end left column */}

        {/* ═══════════ RIGHT: Stats + history ═══════════ */}
        <div className="space-y-5">

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className={cn(
              'rounded-2xl border p-4 flex flex-col gap-2',
              'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08]',
              'border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
            )}>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#C9A84C]/70">
                Pending
              </p>
              <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none"
                style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', letterSpacing: '-0.3px' }}>
                {pendingCount}
              </p>
              <p className="text-[10px] font-mono text-stone-400 dark:text-white/30">requests</p>
            </div>
            <div className={cn(
              'rounded-2xl border p-4 flex flex-col gap-2',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-stone-400 dark:text-white/25">
                Awaiting
              </p>
              <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none"
                style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', letterSpacing: '-0.3px' }}>
                ${totalPending.toFixed(0)}
              </p>
              <p className="text-[10px] font-mono text-stone-400 dark:text-white/30">total value</p>
            </div>
          </div>

          {/* Request history */}
          <div>
            <SectionRule label="Request history" />

            {/* Filter pills */}
            <div
              className="flex gap-2 mb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {(['all', 'pending', 'paid', 'expired', 'cancelled'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 border transition-all',
                    filter === f
                      ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C] shadow-sm'
                      : cn(
                          'bg-white dark:bg-white/[0.02]',
                          'border-stone-200 dark:border-white/[0.07]',
                          'text-stone-500 dark:text-white/35',
                          'hover:border-stone-300 dark:hover:border-white/[0.14]'
                        )
                  )}>
                  {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
                  {f === 'pending' && pendingCount > 0 && (
                    <span className={cn(
                      'ml-1 text-[9px]',
                      filter === 'pending' ? 'opacity-70' : 'opacity-60'
                    )}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* History list */}
            <div className={cn(
              'rounded-2xl border overflow-hidden',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              {filteredRequests.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-[13px] text-stone-400 dark:text-white/30">No requests found</p>
                </div>
              ) : (
                <div className="px-3 sm:px-4 py-1">
                  {filteredRequests.map(req => (
                    <RequestCard key={req.id} req={req} onCancel={handleCancelRequest} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info callout */}
          <div className={cn(
            'rounded-2xl border p-4',
            'bg-[#C9A84C]/[0.04] dark:bg-[#C9A84C]/[0.06]',
            'border-[#C9A84C]/15'
          )}>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-3 text-[#C9A84C]/70">
              How it works
            </p>
            <div className="space-y-2.5">
              {[
                'Set an amount (or leave open for any)',
                'Send via link, QR code, or email',
                'Recipient pays securely in seconds',
                'Funds land directly in your wallet',
              ].map((tip, i) => (
                <div key={tip} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#C9A84C]/20 text-[#C9A84C]
                    flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-white/40">{tip}</p>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end right column */}

      </div>{/* end grid */}

      <div className="h-24 lg:h-12" />
    </div>
  );
};

export default RequestPage;