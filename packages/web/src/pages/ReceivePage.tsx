import { useState, useRef, useEffect } from 'react';
import {
  Copy,
  CheckCircle2,
  ChevronDown,
  Share2,
  Download,
  ArrowUpRight,
  Info,
  Building2,
  Globe,
  Wifi,
  ChevronRight,
  TrendingUp,
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
  iban:       string;
  swift:      string;
  sortCode:   string;
  routing:    string;
  bankName:   string;
  accountHolder: string;
}

const ACCOUNTS: Account[] = [
  {
    code:          'USD',
    name:          'US Dollar',
    symbol:        '$',
    balance:       14250.60,
    balanceFmt:    '$14,250.60',
    accountNum:    '4521883011920047',
    iban:          'US29NXUS00014521883011920047',
    swift:         'NXUSGB2L',
    sortCode:      '04-00-04',
    routing:       '021000021',
    bankName:      'Nexus Private Bank',
    accountHolder: 'Victor Okafor',
  },
  {
    code:          'GBP',
    name:          'British Pound',
    symbol:        '£',
    balance:       2100.00,
    balanceFmt:    '£2,100.00',
    accountNum:    '33095512882011 34',
    iban:          'GB29NWBK60161331926819',
    swift:         'NXUSGB2L',
    sortCode:      '04-00-04',
    routing:       '',
    bankName:      'Nexus Private Bank',
    accountHolder: 'Victor Okafor',
  },
  {
    code:          'EUR',
    name:          'Euro',
    symbol:        '€',
    balance:       3800.00,
    balanceFmt:    '€3,800.00',
    accountNum:    '77120044339166 80',
    iban:          'DE89370400440532013000',
    swift:         'NXUSGB2L',
    sortCode:      '',
    routing:       '',
    bankName:      'Nexus Private Bank',
    accountHolder: 'Victor Okafor',
  },
  {
    code:          'NGN',
    name:          'Nigerian Naira',
    symbol:        '₦',
    balance:       850000,
    balanceFmt:    '₦850,000',
    accountNum:    '0123456789',
    iban:          '',
    swift:         'NXUSGB2L',
    sortCode:      '',
    routing:       '',
    bankName:      'Nexus Private Bank',
    accountHolder: 'Victor Okafor',
  },
];

interface IncomingTx {
  id:       string;
  name:     string;
  initials: string;
  color:    string;
  amount:   string;
  currency: string;
  time:     string;
  method:   string;
}

const RECENT_INCOMING: IncomingTx[] = [
  { id:'i01', name:'Marcus Chen',    initials:'MC', color:'from-emerald-500 to-teal-600',  amount:'+$2,500.00', currency:'USD', time:'2h ago',    method:'Nexus wallet'  },
  { id:'i02', name:'Sophie Müller',  initials:'SM', color:'from-sky-500 to-blue-600',      amount:'+€380.00',   currency:'EUR', time:'Yesterday', method:'SEPA transfer' },
  { id:'i03', name:'TechCorp Ltd.',  initials:'TC', color:'from-slate-500 to-slate-700',   amount:'+$4,500.00', currency:'USD', time:'5d ago',    method:'Wire transfer'  },
  { id:'i04', name:'Amina Bello',    initials:'AB', color:'from-violet-500 to-purple-600', amount:'+£250.00',   currency:'GBP', time:'1w ago',    method:'Bank transfer'  },
];

type MethodTab = 'local' | 'wire' | 'nexus';

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

// ─────────────────────────────────────────────────────────────────────────────
// COPY ROW
// ─────────────────────────────────────────────────────────────────────────────

const CopyRow = ({
  label, value, accent = false, large = false,
}: {
  label: string; value: string; accent?: boolean; large?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(value.replace(/\s/g, '')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 py-3.5',
      'border-b border-stone-100 dark:border-white/[0.05] last:border-0'
    )}>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-0.5
          text-stone-400 dark:text-white/25">
          {label}
        </p>
        <p className={cn(
          'font-mono font-medium truncate',
          large ? 'text-[15px]' : 'text-[12.5px]',
          accent
            ? 'text-[#C9A84C]'
            : 'text-stone-800 dark:text-white/80'
        )}>
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
          text-stone-300 dark:text-white/20
          hover:text-stone-600 dark:hover:text-white/55
          hover:bg-stone-100 dark:hover:bg-white/[0.06]"
      >
        {copied
          ? <CheckCircle2 size={14} className="text-emerald-500" />
          : <Copy size={14} />
        }
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QR CODE SVG
// ─────────────────────────────────────────────────────────────────────────────

const QRCode = ({ size = 160 }: { size?: number }) => (
  <svg
    width={size} height={size} viewBox="0 0 160 160"
    className="rounded-2xl flex-shrink-0"
    style={{ background: 'white' }}
  >
    {/* Corner squares */}
    {([[10,10],[110,10],[10,110]] as [number,number][]).map(([x, y], i) => (
      <g key={i}>
        <rect x={x}   y={y}   width={40} height={40} rx="5" fill="#111" />
        <rect x={x+7} y={y+7} width={26} height={26} rx="3" fill="white" />
        <rect x={x+13}y={y+13}width={14} height={14} rx="1.5" fill="#111" />
      </g>
    ))}
    {/* Data dots */}
    {[
      [60,10],[66,10],[72,10],[78,10],[84,10],[90,10],[96,10],[102,10],
      [60,16],[72,16],[84,16],[96,16],
      [60,22],[66,22],[78,22],[90,22],[102,22],
      [60,28],[72,28],[84,28],[96,28],
      [60,34],[66,34],[78,34],[90,34],[102,34],
      [10,60],[16,60],[28,60],[40,60],[46,60],
      [10,66],[22,66],[34,66],[46,66],
      [10,72],[16,72],[28,72],[40,72],
      [10,78],[22,78],[34,78],[46,78],
      [10,84],[16,84],[22,84],[34,84],[40,84],[46,84],
      [10,90],[28,90],[40,90],
      [10,96],[16,96],[22,96],[34,96],[46,96],
      [60,60],[66,60],[72,60],[84,60],[90,60],[96,60],[102,60],
      [60,66],[72,66],[90,66],[102,66],
      [60,72],[66,72],[78,72],[84,72],[96,72],
      [60,78],[72,78],[84,78],[96,78],[102,78],
      [60,84],[66,84],[72,84],[78,84],[90,84],
      [60,90],[72,90],[84,90],[96,90],[102,90],
      [60,96],[66,96],[78,96],[84,96],[96,96],[102,96],
      [66,102],[78,102],[90,102],[102,102],
      [110,60],[116,60],[122,60],[128,60],[134,60],[140,60],
      [110,66],[116,66],[128,66],[140,66],
      [110,72],[122,72],[134,72],
      [110,78],[116,78],[122,78],[128,78],[134,78],[140,78],
      [110,84],[116,84],[128,84],
      [110,90],[116,90],[122,90],[134,90],[140,90],
      [110,96],[122,96],[128,96],[134,96],[140,96],
    ].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width="5" height="5" rx="0.8" fill="#111" />
    ))}
    <text x="80" y="154" textAnchor="middle" fontSize="8" fill="#9ca3af"
      fontFamily="monospace">
      nexus.pay/receive
    </text>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

const AccountSelector = ({
  selected, onSelect,
}: {
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
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border transition-all',
          'bg-white dark:bg-white/[0.03]',
          'border-stone-200 dark:border-white/[0.08]',
          'hover:border-stone-300 dark:hover:border-white/[0.16]',
          open && 'border-[#C9A84C]/40 dark:border-[#C9A84C]/30'
        )}
      >
        <img
          src={getFlag(selected.code)} alt={selected.code}
          className="w-8 h-8 rounded-full object-cover shrink-0
            border border-stone-200 dark:border-white/[0.08]"
        />
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white leading-none">
              {selected.code}
            </p>
            <p className="text-[11px] font-mono text-stone-400 dark:text-white/30">
              {selected.name}
            </p>
          </div>
          <p className="text-[11px] font-mono mt-0.5 text-stone-400 dark:text-white/25 truncate">
            Balance: {selected.balanceFmt}
          </p>
        </div>
        <ChevronDown
          size={15}
          className={cn(
            'text-stone-400 dark:text-white/30 transition-transform duration-200 shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div className={cn(
            'absolute top-full left-0 right-0 mt-1.5 rounded-2xl border z-[110] overflow-hidden',
            'bg-white dark:bg-[#1C1C1E]',
            'border-stone-200 dark:border-white/[0.09]',
            'shadow-2xl shadow-black/15 dark:shadow-black/50'
          )}>
            {ACCOUNTS.map(a => (
              <button
                key={a.code}
                onClick={() => { onSelect(a); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 transition-colors',
                  'border-b border-stone-50 dark:border-white/[0.04] last:border-0',
                  a.code === selected.code
                    ? 'bg-[#C9A84C]/[0.07] dark:bg-[#C9A84C]/[0.10]'
                    : 'hover:bg-stone-50 dark:hover:bg-white/[0.04]'
                )}
              >
                <img
                  src={getFlag(a.code)} alt={a.code}
                  className="w-7 h-7 rounded-full object-cover shrink-0
                    border border-stone-200 dark:border-white/[0.08]"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-bold text-stone-800 dark:text-white/80 leading-none">
                    {a.code} <span className="font-normal text-stone-400 dark:text-white/30 text-[11px]">{a.name}</span>
                  </p>
                  <p className="text-[10px] font-mono text-stone-400 dark:text-white/25 mt-0.5">
                    {a.balanceFmt}
                  </p>
                </div>
                {a.code === selected.code && (
                  <CheckCircle2 size={14} className="text-[#C9A84C] shrink-0" />
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
// HERO CARD
// ─────────────────────────────────────────────────────────────────────────────

const HeroCard = ({ account }: { account: Account }) => {
  const [copiedNum, setCopiedNum] = useState(false);
  const [shared,    setShared]    = useState(false);

  const handleCopyNum = () => {
    navigator.clipboard?.writeText(account.accountNum.replace(/\s/g, '')).catch(() => {});
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 1800);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  };

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      'bg-gradient-to-br from-[#C9A84C]/[0.08] to-[#C9A84C]/[0.03]',
      'dark:from-[#C9A84C]/[0.10] dark:to-[#C9A84C]/[0.04]',
      'border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
    )}>
      <div className="p-5 sm:p-6">
        {/* Currency header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={getFlag(account.code)} alt={account.code}
            className="w-9 h-9 rounded-full object-cover shrink-0
              border-2 border-[#C9A84C]/20 shadow-sm shadow-[#C9A84C]/10"
          />
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase
              text-[#C9A84C]/60">
              Receiving account
            </p>
            <p className="text-[14px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white leading-none mt-0.5">
              {account.name}
            </p>
          </div>
          <div className="ml-auto">
            <p className="text-right text-[9px] font-bold tracking-[0.15em] uppercase
              text-stone-400 dark:text-white/25 mb-0.5">
              Balance
            </p>
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
              text-right leading-none"
              style={{ fontSize: 'clamp(16px, 3vw, 20px)', letterSpacing: '-0.2px' }}>
              {account.balanceFmt}
            </p>
          </div>
        </div>

        {/* Account number large display */}
        <div className={cn(
          'rounded-xl p-4 mb-4',
          'bg-white/60 dark:bg-white/[0.04]',
          'border border-[#C9A84C]/10 dark:border-[#C9A84C]/[0.08]'
        )}>
          <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1.5
            text-stone-400 dark:text-white/25">
            Account number
          </p>
          <div className="flex items-center gap-3">
            <p className="font-mono font-bold text-stone-900 dark:text-white flex-1 min-w-0 truncate"
              style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', letterSpacing: '0.05em' }}>
              {account.accountNum}
            </p>
            <button
              onClick={handleCopyNum}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 border',
                copiedNum
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-[#C9A84C]/10 border-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/20'
              )}
            >
              {copiedNum
                ? <><CheckCircle2 size={12} /> Copied</>
                : <><Copy size={12} /> Copy</>
              }
            </button>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all',
              shared
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-white/60 dark:bg-white/[0.05] border-stone-200 dark:border-white/[0.09] text-stone-600 dark:text-white/55 hover:border-stone-300 dark:hover:border-white/[0.18]'
            )}
          >
            {shared
              ? <><CheckCircle2 size={13} /> Shared!</>
              : <><Share2 size={13} /> Share details</>
            }
          </button>
          <button className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all',
            'bg-white/60 dark:bg-white/[0.05]',
            'border-stone-200 dark:border-white/[0.09]',
            'text-stone-600 dark:text-white/55',
            'hover:border-stone-300 dark:hover:border-white/[0.18]'
          )}>
            <Download size={13} />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// METHOD TAB PANEL
// ─────────────────────────────────────────────────────────────────────────────

const MethodTabs = ({ account }: { account: Account }) => {
  const [active, setActive] = useState<MethodTab>('local');

  const tabs: { id: MethodTab; icon: React.ElementType; label: string }[] = [
    { id: 'local', icon: Building2, label: 'Local / ACH'  },
    { id: 'wire',  icon: Globe,     label: 'SWIFT / Wire' },
    { id: 'nexus', icon: Wifi,      label: 'Nexus wallet' },
  ];

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      {/* Tab bar */}
      <div className="flex border-b border-stone-100 dark:border-white/[0.06]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[11px] font-bold transition-colors',
                active === tab.id
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] bg-[#C9A84C]/[0.04]'
                  : 'text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/55'
              )}
            >
              <Icon size={12} className="shrink-0 hidden sm:inline-block" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        {/* LOCAL / ACH */}
        {active === 'local' && (
          <div>
            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl
              bg-sky-50 dark:bg-sky-500/[0.08]
              border border-sky-100 dark:border-sky-500/[0.15]">
              <Info size={13} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-700 dark:text-sky-400">
                Use these details for domestic {account.code} transfers within the local banking network.
                {account.code === 'EUR' && ' For European SEPA transfers, use the Wire tab.'}
              </p>
            </div>

            <CopyRow label="Account holder" value={account.accountHolder}  />
            <CopyRow label="Bank"           value={account.bankName}       />
            <CopyRow label="Account number" value={account.accountNum}     accent large />

            {account.sortCode && (
              <CopyRow label="Sort code" value={account.sortCode} />
            )}
            {account.routing && (
              <CopyRow label="Routing number (ACH)" value={account.routing} />
            )}
            {account.code === 'NGN' && (
              <CopyRow label="Bank code" value="000026" />
            )}
          </div>
        )}

        {/* SWIFT / WIRE */}
        {active === 'wire' && (
          <div>
            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl
              bg-violet-50 dark:bg-violet-500/[0.08]
              border border-violet-100 dark:border-violet-500/[0.15]">
              <Info size={13} className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-violet-700 dark:text-violet-400">
                For international wire transfers. Always include your reference code to avoid delays.
                Fee: $15–25 flat, arrival in 1–3 business days.
              </p>
            </div>

            <CopyRow label="Account holder" value={account.accountHolder}         />
            <CopyRow label="Bank"           value={account.bankName}              />
            {account.iban && (
              <CopyRow label="IBAN"         value={account.iban} accent large     />
            )}
            {!account.iban && (
              <CopyRow label="Account number" value={account.accountNum} accent large />
            )}
            <CopyRow label="SWIFT / BIC"    value={account.swift}                 />
            <CopyRow label="Reference"      value={`NXS-${account.code}-4721`}    />
            <CopyRow label="Bank address"   value="25 Finsbury Square, London, EC2A 1AN" />
          </div>
        )}

        {/* NEXUS WALLET */}
        {active === 'nexus' && (
          <div>
            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl
              bg-[#C9A84C]/[0.07] dark:bg-[#C9A84C]/[0.08]
              border border-[#C9A84C]/15">
              <Info size={13} className="text-[#C9A84C] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#C9A84C]/80">
                Nexus-to-Nexus transfers are instant and completely free. Share your Nexus ID or email.
              </p>
            </div>

            <CopyRow label="Nexus ID"    value="NXS-4721-OKAFOR" accent large />
            <CopyRow label="Email"       value="victor@nexusbank.io"           />
            <CopyRow label="Display name"value="Victor Okafor"                  />
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QR PANEL
// ─────────────────────────────────────────────────────────────────────────────

const QRPanel = ({ account }: { account: Account }) => {
  const [size, setSize] = useState<'sm' | 'lg'>('sm');

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase
            text-stone-400 dark:text-white/25">
            QR code
          </p>
          <div className="flex gap-1">
            {(['sm','lg'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors border',
                  size === s
                    ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C]'
                    : 'border-stone-200 dark:border-white/[0.08] text-stone-400 dark:text-white/30 hover:border-stone-300'
                )}
              >
                {s === 'sm' ? 'Small' : 'Large'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 p-4 sm:p-5 pt-3">
        {/* QR code */}
        <div className="shrink-0">
          <QRCode size={size === 'lg' ? 200 : 160} />
        </div>

        {/* Info + actions */}
        <div className="w-full space-y-3">
          <div className="text-center">
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none text-[18px]"
              style={{ letterSpacing: '-0.2px' }}>
              {account.accountHolder}
            </p>
            <p className="text-[11px] font-mono text-stone-400 dark:text-white/25 mt-0.5">
              {account.code} · {account.bankName}
            </p>
          </div>

          <p className="text-[11px] text-stone-400 dark:text-white/30 text-center">
            Anyone can scan this QR code with their banking app to send you money directly.
          </p>

          <div className="flex flex-row gap-2">
            <button className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all',
              'bg-[#C9A84C]/10 border-[#C9A84C]/20 text-[#C9A84C]',
              'hover:bg-[#C9A84C]/20'
            )}>
              <Download size={13} />
              Download PNG
            </button>
            <button className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all',
              'bg-white dark:bg-white/[0.03]',
              'border-stone-200 dark:border-white/[0.08]',
              'text-stone-600 dark:text-white/50',
              'hover:border-stone-300 dark:hover:border-white/[0.15]'
            )}>
              <Share2 size={13} />
              Share QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RECENT INCOMING
// ─────────────────────────────────────────────────────────────────────────────

const RecentIncoming = () => (
  <div className={cn(
    'rounded-2xl border overflow-hidden',
    'bg-white dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.07]'
  )}>
    <div className="px-4 sm:px-5 py-3.5 border-b border-stone-100 dark:border-white/[0.05]
      flex items-center justify-between">
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase
        text-stone-400 dark:text-white/25">
        Recent received
      </p>
      <button className="text-[10px] font-bold text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
        View all
      </button>
    </div>
    <div className="px-3 sm:px-4 py-1">
      {RECENT_INCOMING.map(tx => (
        <div key={tx.id}
          className="flex items-center gap-3 py-3.5
            border-b border-stone-100 dark:border-white/[0.04] last:border-0
            hover:bg-stone-50 dark:hover:bg-white/[0.02]
            -mx-2 px-2 rounded-xl transition-colors group cursor-default">
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
            'text-white text-[11px] font-bold',
            `bg-gradient-to-br ${tx.color}`
          )}>
            {tx.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold leading-none text-stone-800 dark:text-white/80 truncate">
              {tx.name}
            </p>
            <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 truncate">
              {tx.method} · {tx.time}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[13px] font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {tx.amount}
            </p>
            <img
              src={getFlag(tx.currency)}
              alt={tx.currency}
              className="w-4 h-4 rounded-full object-cover border border-stone-200 dark:border-white/[0.08]
                ml-auto mt-0.5"
            />
          </div>
          <ChevronRight size={12}
            className="text-stone-200 dark:text-white/15 shrink-0
              group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors hidden sm:block" />
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STATS STRIP
// ─────────────────────────────────────────────────────────────────────────────

const StatsStrip = ({ account }: { account: Account }) => {
  const stats = [
    { label: 'Received today',  value: `${account.symbol}2,500`,  up: true  },
    { label: 'This month',      value: `${account.symbol}14.2k`,  up: true  },
    { label: 'Pending inbound', value: `${account.symbol}0`,      up: false },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map(s => (
        <div key={s.label} className={cn(
          'rounded-2xl border p-3.5 flex flex-col gap-2',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          <p className="text-[9px] font-bold tracking-[0.15em] uppercase leading-tight
            text-stone-400 dark:text-white/25">
            {s.label}
          </p>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none"
            style={{ fontSize: 'clamp(14px, 3vw, 18px)', letterSpacing: '-0.3px' }}>
            {s.value}
          </p>
          <div className="flex items-center gap-1">
            <TrendingUp size={9} className={s.up ? 'text-emerald-500' : 'text-stone-300 dark:text-white/20'} />
            <span className="text-[9px] font-mono text-stone-300 dark:text-white/20">
              {s.up ? 'Active' : 'None pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const ReceivePage = () => {
  const [account, setAccount] = useState<Account>(ACCOUNTS[0]);

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Incoming funds
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Receive money
        </h1>
      </div>

      {/* Account selector */}
      <div className="mb-5">
        <AccountSelector selected={account} onSelect={setAccount} />
      </div>

      {/* Stats strip */}
      <div className="mb-6">
        <StatsStrip account={account} />
      </div>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]
        gap-5 lg:gap-8 items-start">

        {/* ═══════════ LEFT: Hero + method details ═══════════ */}
        <div className="space-y-4">

          {/* Hero account card */}
          <HeroCard account={account} />

          {/* Method tabs */}
          <SectionRule label="Banking details" />
          <MethodTabs account={account} />

          {/* Important note */}
          <div className={cn(
            'flex items-start gap-3 p-4 rounded-2xl border',
            'bg-amber-50 dark:bg-amber-500/[0.07]',
            'border-amber-100 dark:border-amber-500/[0.15]'
          )}>
            <Info size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-400 mb-1">
                Reference number matters
              </p>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70">
                Always ask the sender to include your reference <span className="font-mono font-bold">NXS-{account.code}-4721</span> to ensure funds are credited to the correct account without delay.
              </p>
            </div>
          </div>

        </div>{/* end left column */}

        {/* ═══════════ RIGHT: QR + recent ═══════════ */}
        <div className="space-y-5">

          {/* QR code panel */}
          <SectionRule label="QR code" />
          <QRPanel account={account} />

          {/* Recent incoming */}
          <SectionRule label="Recent received" />
          <RecentIncoming />

          {/* How to receive callout */}
          <div className={cn(
            'rounded-2xl border p-4 sm:p-5',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-3
              text-stone-400 dark:text-white/25">
              Ways to receive
            </p>
            {[
              { icon: Building2, title: 'Local / ACH',   sub: 'Use account & sort/routing number for domestic transfers',   color: 'text-sky-600 dark:text-sky-400    bg-sky-50 dark:bg-sky-500/10'       },
              { icon: Globe,     title: 'SWIFT wire',    sub: 'Share IBAN + SWIFT code for international wires',            color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10' },
              { icon: Wifi,      title: 'Nexus wallet',  sub: 'Share your Nexus ID for instant, fee-free transfers',        color: 'text-[#C9A84C] bg-[#C9A84C]/10'                                           },
              { icon: ArrowUpRight, title: 'Request money', sub: 'Create a payment request with a shareable link',          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'},
            ].map(({ icon: Icon, title, sub, color }) => (
              <div key={title} className="flex items-start gap-3 py-3
                border-b border-stone-100 dark:border-white/[0.05] last:border-0">
                <div className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  color.split(' ').slice(1).join(' ')
                )}>
                  <Icon size={13} className={color.split(' ')[0]} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-stone-800 dark:text-white/80 leading-none">
                    {title}
                  </p>
                  <p className="text-[11px] mt-0.5 text-stone-400 dark:text-white/30">
                    {sub}
                  </p>
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

export default ReceivePage;