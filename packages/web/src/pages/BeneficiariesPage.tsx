import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  ChevronRight,
  ArrowUpRight,
  Star,
  MoreHorizontal,
  CheckCircle2,
  Copy,
  Trash2,
  Edit3,
  Send,
  Clock,
  Globe,
  Building2,
  User,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getFlag } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

type BeneficiaryType = 'individual' | 'business';
type TransferMethod = 'bank' | 'nexus' | 'mobile';

interface Beneficiary {
  id:           string;
  type:         BeneficiaryType;
  name:         string;
  initials:     string;
  color:        string;         // gradient tailwind classes
  bank:         string;
  accountNum:   string;
  currency:     string;
  country:      string;
  countryCode:  string;
  method:       TransferMethod;
  favourite:    boolean;
  lastSent:     string;
  lastAmount:   string;
  totalSent:    string;
  note?:        string;
}

const BENEFICIARIES: Beneficiary[] = [
  { id:'b01', type:'individual', name:'James Okonkwo',    initials:'JO', color:'from-sky-500 to-blue-600',      bank:'Zenith Bank',          accountNum:'2034567890',    currency:'NGN', country:'Nigeria',       countryCode:'NGN', method:'bank',   favourite:true,  lastSent:'2h ago',    lastAmount:'₦250,000', totalSent:'₦1.2M'   },
  { id:'b02', type:'individual', name:'Amina Bello',      initials:'AB', color:'from-violet-500 to-purple-600', bank:'Barclays UK',           accountNum:'GB29NWBK',      currency:'GBP', country:'United Kingdom',countryCode:'GBP', method:'bank',   favourite:true,  lastSent:'Yesterday', lastAmount:'£250.00', totalSent:'£2,400'  },
  { id:'b03', type:'individual', name:'Chioma Eze',       initials:'CE', color:'from-emerald-500 to-teal-600',  bank:'Nexus',                 accountNum:'NXS-10293',     currency:'NGN', country:'Nigeria',       countryCode:'NGN', method:'nexus',  favourite:true,  lastSent:'3d ago',    lastAmount:'₦50,000', totalSent:'₦620,000'},
  { id:'b04', type:'individual', name:'David Mensah',     initials:'DM', color:'from-rose-500 to-pink-600',     bank:'Ecobank Ghana',         accountNum:'0024512834',    currency:'USD', country:'Ghana',         countryCode:'USD', method:'bank',   favourite:false, lastSent:'1w ago',    lastAmount:'$320.00', totalSent:'$1,800'  },
  { id:'b05', type:'individual', name:'Fatima Al-Rashid', initials:'FA', color:'from-amber-500 to-orange-600',  bank:'Emirates NBD',          accountNum:'AE070331234',   currency:'USD', country:'UAE',           countryCode:'USD', method:'bank',   favourite:false, lastSent:'2w ago',    lastAmount:'$1,080', totalSent:'$5,200'  },
  { id:'b06', type:'business',   name:'TechCorp Ltd.',    initials:'TC', color:'from-slate-500 to-slate-700',   bank:'JP Morgan Chase',       accountNum:'US29CHAS0001',  currency:'USD', country:'United States', countryCode:'USD', method:'bank',   favourite:true,  lastSent:'5d ago',    lastAmount:'$4,500', totalSent:'$27,000' },
  { id:'b07', type:'individual', name:'Ngozi Adeyemi',    initials:'NA', color:'from-fuchsia-500 to-pink-600',  bank:'GTBank',                accountNum:'0198765432',    currency:'NGN', country:'Nigeria',       countryCode:'NGN', method:'bank',   favourite:false, lastSent:'3w ago',    lastAmount:'₦100,000',totalSent:'₦450,000'},
  { id:'b08', type:'business',   name:'Freelance Hub Inc',initials:'FH', color:'from-cyan-500 to-blue-500',     bank:'Wells Fargo',           accountNum:'US99WF003471',  currency:'USD', country:'United States', countryCode:'USD', method:'bank',   favourite:false, lastSent:'1mo ago',   lastAmount:'$2,200', totalSent:'$8,800'  },
  { id:'b09', type:'individual', name:'Kofi Asante',      initials:'KA', color:'from-lime-500 to-green-600',    bank:'Fidelity Bank',         accountNum:'6012345678',    currency:'NGN', country:'Ghana',         countryCode:'USD', method:'mobile', favourite:false, lastSent:'2mo ago',   lastAmount:'$150.00', totalSent:'$900'    },
  { id:'b10', type:'individual', name:'Ifeoma Nwosu',     initials:'IN', color:'from-red-500 to-rose-600',      bank:'Access Bank',           accountNum:'0076543210',    currency:'NGN', country:'Nigeria',       countryCode:'NGN', method:'bank',   favourite:false, lastSent:'3mo ago',   lastAmount:'₦75,000', totalSent:'₦300,000'},
];

type FilterGroup = 'all' | 'favourites' | 'individual' | 'business';
type SortOrder   = 'recent' | 'name' | 'most_sent';

const GROUP_LABELS: Record<FilterGroup, string> = {
  all:        'All',
  favourites: 'Favourites',
  individual: 'Individuals',
  business:   'Businesses',
};

const METHOD_CONFIG: Record<TransferMethod, { label: string; color: string }> = {
  bank:   { label: 'Bank transfer', color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10'             },
  nexus:  { label: 'Nexus wallet',  color: 'text-[#C9A84C] bg-[#C9A84C]/10'                                           },
  mobile: { label: 'Mobile money',  color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'},
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RULE
// ─────────────────────────────────────────────────────────────────────────────

const SectionRule = ({ label, action }: {
  label: string;
  action?: { text: string; onClick?: () => void };
}) => (
  <div className="flex items-center gap-4 mb-5">
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

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────────────────────────────────────

const Avatar = ({ b, size = 'md' }: { b: Beneficiary; size?: 'sm' | 'md' | 'lg' }) => {
  const dim = size === 'lg' ? 'w-14 h-14 text-[16px]' : size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-[13px]';
  return (
    <div className={cn(
      dim,
      'rounded-full flex items-center justify-center shrink-0 font-bold text-white',
      `bg-gradient-to-br ${b.color}`
    )}>
      {b.initials}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BENEFICIARY CARD (grid view)
// ─────────────────────────────────────────────────────────────────────────────

const BeneficiaryCard = ({
  b, onSelect, onSend, onToggleFav,
}: {
  b: Beneficiary;
  onSelect: (b: Beneficiary) => void;
  onSend: (b: Beneficiary) => void;
  onToggleFav: (id: string) => void;
}) => {
  const method = METHOD_CONFIG[b.method];

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 cursor-pointer transition-all group relative',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]',
        'hover:border-stone-300 dark:hover:border-white/[0.14]',
        'hover:shadow-sm'
      )}
      onClick={() => onSelect(b)}
    >
      {/* Favourite star */}
      <button
        onClick={e => { e.stopPropagation(); onToggleFav(b.id); }}
        className={cn(
          'absolute top-3.5 right-3.5 p-1 rounded-lg transition-all z-10',
          b.favourite
            ? 'text-[#C9A84C]'
            : 'text-stone-200 dark:text-white/15 opacity-0 group-hover:opacity-100 hover:text-[#C9A84C]/60'
        )}
      >
        <Star size={13} fill={b.favourite ? 'currentColor' : 'none'} />
      </button>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar b={b} />
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-[13px] font-bold tracking-[-0.2px] truncate
            text-stone-900 dark:text-white leading-none">
            {b.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {b.type === 'business' && (
              <Building2 size={9} className="text-stone-300 dark:text-white/20 shrink-0" />
            )}
            <p className="text-[10px] truncate text-stone-400 dark:text-white/25">
              {b.bank}
            </p>
          </div>
        </div>
      </div>

      {/* Country + method */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <img src={getFlag(b.countryCode)} alt={b.country}
            className="w-4 h-4 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
          <span className="text-[10px] text-stone-400 dark:text-white/30 truncate max-w-[80px]">
            {b.country}
          </span>
        </div>
        <span className={cn(
          'text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full shrink-0',
          method.color
        )}>
          {b.method === 'nexus' ? 'Nexus' : b.method === 'mobile' ? 'Mobile' : 'Bank'}
        </span>
      </div>

      {/* Last sent */}
      <div className="flex items-center justify-between mb-3 pt-3
        border-t border-stone-100 dark:border-white/[0.05]">
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-0.5
            text-stone-300 dark:text-white/20">
            Last sent
          </p>
          <p className="text-[12px] font-mono font-medium text-stone-700 dark:text-white/65">
            {b.lastAmount}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-0.5
            text-stone-300 dark:text-white/20">
            Total sent
          </p>
          <p className="text-[12px] font-mono font-medium text-stone-700 dark:text-white/65">
            {b.totalSent}
          </p>
        </div>
      </div>

      {/* Send CTA */}
      <button
        onClick={e => { e.stopPropagation(); onSend(b); }}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl',
          'text-[12px] font-bold transition-all border',
          'bg-[#C9A84C]/[0.08] dark:bg-[#C9A84C]/[0.10]',
          'border-[#C9A84C]/20',
          'text-[#C9A84C]',
          'hover:bg-[#C9A84C]/[0.15] hover:border-[#C9A84C]/30'
        )}
      >
        <ArrowUpRight size={13} />
        Send money
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BENEFICIARY ROW (list view)
// ─────────────────────────────────────────────────────────────────────────────

const BeneficiaryRow = ({
  b, onSelect, onSend, onToggleFav,
}: {
  b: Beneficiary;
  onSelect: (b: Beneficiary) => void;
  onSend: (b: Beneficiary) => void;
  onToggleFav: (id: string) => void;
}) => {
  const method = METHOD_CONFIG[b.method];

  return (
    <div
      onClick={() => onSelect(b)}
      className="flex items-center gap-3 py-3.5
        border-b border-stone-100 dark:border-white/[0.04] last:border-0
        hover:bg-stone-50 dark:hover:bg-white/[0.02]
        -mx-2 px-2 rounded-xl transition-colors cursor-pointer group"
    >
      {/* Avatar */}
      <Avatar b={b} size="sm" />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[13px] font-semibold leading-none tracking-[-0.2px] truncate
            text-stone-800 dark:text-white/80">
            {b.name}
          </p>
          {b.favourite && (
            <Star size={10} className="text-[#C9A84C] shrink-0 fill-current" />
          )}
        </div>
        <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 truncate">
          {b.bank} · {b.accountNum.slice(-4).padStart(b.accountNum.length, '·')}
        </p>
      </div>

      {/* Country flag */}
      <img src={getFlag(b.countryCode)} alt=""
        className="w-4 h-4 rounded-full object-cover border border-stone-200 dark:border-white/[0.08]
          shrink-0 hidden sm:block" />

      {/* Method badge */}
      <span className={cn(
        'text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-flex',
        method.color
      )}>
        {b.method === 'nexus' ? 'Nexus' : b.method === 'mobile' ? 'Mobile' : 'Bank'}
      </span>

      {/* Last sent */}
      <div className="text-right shrink-0">
        <p className="text-[12px] font-mono font-medium tabular-nums leading-none
          text-stone-700 dark:text-white/65">
          {b.lastAmount}
        </p>
        <p className="text-[10px] font-mono mt-0.5 text-stone-300 dark:text-white/20">
          {b.lastSent}
        </p>
      </div>

      {/* Quick send */}
      <button
        onClick={e => { e.stopPropagation(); onSend(b); }}
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all',
          'bg-[#C9A84C]/[0.08] text-[#C9A84C]',
          'hover:bg-[#C9A84C]/20',
          'opacity-0 group-hover:opacity-100'
        )}
      >
        <ArrowUpRight size={14} />
      </button>

      <ChevronRight size={12}
        className="text-stone-200 dark:text-white/15 shrink-0
          group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors
          hidden sm:block" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL SHEET
// ─────────────────────────────────────────────────────────────────────────────

const DetailSheet = ({
  b, onClose, onSend, onToggleFav, onDelete,
}: {
  b: Beneficiary;
  onClose: () => void;
  onSend: (b: Beneficiary) => void;
  onToggleFav: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const method = METHOD_CONFIG[b.method];

  const handleCopy = () => {
    navigator.clipboard?.writeText(b.accountNum).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const details = [
    { label: 'Full name',       value: b.name         },
    { label: 'Bank / wallet',   value: b.bank         },
    { label: 'Account number',  value: b.accountNum   },
    { label: 'Currency',        value: b.currency     },
    { label: 'Country',         value: b.country      },
    { label: 'Transfer method', value: method.label   },
    { label: 'Total sent',      value: b.totalSent    },
    { label: 'Last transfer',   value: `${b.lastAmount} · ${b.lastSent}` },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={cn(
          'fixed z-[160] bg-white dark:bg-[#161618]',
          '[&::-webkit-scrollbar]:hidden',
          'border-stone-200 dark:border-white/[0.08]',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl border-t',
          'p-5 pb-10 max-h-[90vh] overflow-y-auto',
          // Desktop: right panel
          'lg:bottom-auto lg:top-0 lg:right-0 lg:left-auto',
          'lg:h-full lg:w-[400px] lg:rounded-none lg:rounded-l-2xl',
          'lg:border-t-0 lg:border-l lg:p-8'
        )}
      >
        {/* Handle */}
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10]
          mx-auto mb-5 lg:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar b={b} size="lg" />
            <div className="min-w-0">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5
                text-stone-400 dark:text-white/25">
                {b.type === 'business' ? 'Business' : 'Individual'}
              </p>
              <p className="text-[15px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white leading-none truncate">
                {b.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={() => onToggleFav(b.id)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                b.favourite
                  ? 'text-[#C9A84C]'
                  : 'text-stone-300 dark:text-white/20 hover:text-[#C9A84C]/60'
              )}
            >
              <Star size={15} fill={b.favourite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick send button */}
        <button
          onClick={() => { onClose(); onSend(b); }}
          className="w-full py-3.5 rounded-xl text-[13px] font-bold mb-5 transition-all
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]
            shadow-md shadow-[#C9A84C]/20 flex items-center justify-center gap-2"
        >
          <ArrowUpRight size={15} />
          Send money to {b.name.split(' ')[0]}
        </button>

        {/* Detail rows */}
        <div className={cn(
          'rounded-xl border divide-y overflow-hidden mb-4',
          'border-stone-100 dark:border-white/[0.06]',
          'divide-stone-100 dark:divide-white/[0.06]'
        )}>
          {details.map(d => (
            <div key={d.label}
              className="flex items-center justify-between px-4 py-3 gap-4
                bg-white dark:bg-white/[0.01]">
              <span className="text-[11px] text-stone-400 dark:text-white/30 shrink-0">
                {d.label}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[12px] font-mono text-stone-700 dark:text-white/65
                  text-right truncate">
                  {d.value}
                </span>
                {d.label === 'Account number' && (
                  <button onClick={handleCopy} className="shrink-0">
                    {copied
                      ? <CheckCircle2 size={13} className="text-emerald-500" />
                      : <Copy size={13} className="text-stone-300 dark:text-white/20
                          hover:text-stone-500 dark:hover:text-white/45 transition-colors" />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        {b.note && (
          <div className={cn(
            'rounded-xl border p-3.5 mb-4',
            'bg-stone-50 dark:bg-white/[0.02]',
            'border-stone-100 dark:border-white/[0.06]'
          )}>
            <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
              text-stone-300 dark:text-white/20">Note</p>
            <p className="text-[12px] text-stone-500 dark:text-white/40">{b.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-bold transition-colors',
            'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08]',
            'text-stone-600 dark:text-white/50 hover:text-stone-900 dark:hover:text-white hover:border-stone-300'
          )}>
            <Edit3 size={14} className="shrink-0" />
            Edit beneficiary
          </button>
          <button
            onClick={() => { onDelete(b.id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-bold
              transition-colors
              bg-red-50 dark:bg-red-500/[0.07]
              border-red-200 dark:border-red-500/[0.15]
              text-red-500 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-500/[0.12]"
          >
            <Trash2 size={14} className="shrink-0" />
            Remove beneficiary
          </button>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND SHEET
// ─────────────────────────────────────────────────────────────────────────────

type SendStep = 'amount' | 'review' | 'success';

const SendSheet = ({ b, onClose }: { b: Beneficiary; onClose: () => void }) => {
  const [step,   setStep]   = useState<SendStep>('amount');
  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');

  const QUICK = b.currency === 'NGN'
    ? [10000, 50000, 100000, 250000]
    : [50, 100, 250, 500];

  const sym = b.currency === 'NGN' ? '₦' : b.currency === 'GBP' ? '£' : b.currency === 'EUR' ? '€' : '$';
  const num = parseFloat(amount) || 0;
  const fee = num * 0.005;
  const ref = `NXS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

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
          'p-5 pb-10 max-h-[92vh] overflow-y-auto',
          'lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2',
          'lg:w-[480px] lg:rounded-2xl lg:border lg:max-h-[88vh]'
        )}
      >
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10]
          mx-auto mb-5 lg:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar b={b} size="sm" />
            <div className="min-w-0">
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-0.5
                text-stone-400 dark:text-white/25">Send to</p>
              <p className="text-[14px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white truncate">
                {b.name}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
              text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        {/* ── AMOUNT STEP ── */}
        {step === 'amount' && (
          <div className="space-y-4">
            {/* Amount input */}
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
                text-stone-400 dark:text-white/25">Amount</p>
              <div className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-3.5 transition-colors',
                'bg-stone-50 dark:bg-white/[0.02]',
                amount
                  ? 'border-[#C9A84C]/50 dark:border-[#C9A84C]/40'
                  : 'border-stone-200 dark:border-white/[0.07]'
              )}>
                <span className="font-mono text-stone-300 dark:text-white/20 text-[15px] shrink-0">
                  {sym}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  autoFocus
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-[22px] font-mono font-medium outline-none
                    text-stone-900 dark:text-white
                    placeholder:text-stone-200 dark:placeholder:text-white/10
                    [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[12px] font-bold text-stone-400 dark:text-white/30 shrink-0">
                  {b.currency}
                </span>
              </div>
              <p className="text-[10px] font-mono mt-1.5 px-1 text-stone-300 dark:text-white/20">
                To: {b.bank} · ···· {b.accountNum.slice(-4)}
              </p>
            </div>

            {/* Quick amounts */}
            <div
              className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {QUICK.map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
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

            {/* Note */}
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
                text-stone-400 dark:text-white/25">Note (optional)</p>
              <input
                type="text"
                placeholder="What's this for?"
                value={note}
                onChange={e => setNote(e.target.value)}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl border text-[13px] outline-none transition-colors',
                  'bg-stone-50 dark:bg-white/[0.02]',
                  'border-stone-200 dark:border-white/[0.08]',
                  'text-stone-900 dark:text-white',
                  'placeholder:text-stone-300 dark:placeholder:text-white/20',
                  'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
                )}
              />
            </div>

            {/* Fee summary */}
            {num > 0 && (
              <div className="flex items-center gap-2 px-1">
                <AlertCircle size={11} className="text-stone-300 dark:text-white/20 shrink-0" />
                <span className="text-[10px] font-mono text-stone-400 dark:text-white/25 truncate">
                  Fee: {sym}{fee.toFixed(2)} · Recipient gets: {sym}{(num - fee).toFixed(2)}
                </span>
              </div>
            )}

            <button
              disabled={!num}
              onClick={() => setStep('review')}
              className={cn(
                'w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all',
                num > 0
                  ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-lg shadow-[#C9A84C]/20'
                  : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
              )}
            >
              {num > 0 ? 'Review transfer →' : 'Enter an amount'}
            </button>
          </div>
        )}

        {/* ── REVIEW STEP ── */}
        {step === 'review' && (
          <div className="space-y-4">
            <button onClick={() => setStep('amount')}
              className="flex items-center gap-2 text-[12px] font-semibold transition-colors
                text-stone-400 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/60">
              ← Back
            </button>

            {/* Summary card */}
            <div className={cn(
              'rounded-xl border p-4',
              'bg-[#C9A84C]/[0.05] dark:bg-[#C9A84C]/[0.07]',
              'border-[#C9A84C]/15'
            )}>
              <div className="flex items-center gap-3 mb-4">
                <Avatar b={b} size="sm" />
                <div>
                  <p className="text-[13px] font-bold text-stone-900 dark:text-white leading-none">
                    {b.name}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-white/30 mt-0.5">{b.bank}</p>
                </div>
              </div>
              <p className="font-['DM_Serif_Display',_Georgia,_serif] text-[#C9A84C] leading-none mb-1"
                style={{ fontSize: '28px', letterSpacing: '-0.3px' }}>
                {sym}{num.toLocaleString('en', { minimumFractionDigits: 2 })}
              </p>
              {note && (
                <p className="text-[11px] text-stone-400 dark:text-white/30 mt-1">&ldquo;{note}&rdquo;</p>
              )}
            </div>

            {/* Fee table */}
            <div className={cn(
              'rounded-xl border divide-y overflow-hidden',
              'border-stone-100 dark:border-white/[0.06]',
              'divide-stone-100 dark:divide-white/[0.06]'
            )}>
              {[
                { label: 'You send',         value: `${sym}${num.toFixed(2)}`              },
                { label: 'Transfer fee (0.5%)', value: `– ${sym}${fee.toFixed(2)}`         },
                { label: 'Recipient gets',   value: `${sym}${(num - fee).toFixed(2)}`, bold: true },
                { label: 'Account',          value: `···· ${b.accountNum.slice(-4)}`       },
                { label: 'Method',           value: METHOD_CONFIG[b.method].label           },
              ].map(r => (
                <div key={r.label}
                  className="flex justify-between gap-4 px-4 py-3 bg-white dark:bg-white/[0.01]">
                  <span className={cn(
                    'text-[11px] shrink-0',
                    r.bold ? 'font-semibold text-stone-800 dark:text-white/80' : 'text-stone-400 dark:text-white/30'
                  )}>
                    {r.label}
                  </span>
                  <span className={cn(
                    'text-[12px] font-mono text-right',
                    r.bold ? 'font-bold text-stone-900 dark:text-white' : 'text-stone-700 dark:text-white/65'
                  )}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('success')}
              className="w-full py-4 rounded-xl text-[14px] font-bold transition-all
                bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-lg shadow-[#C9A84C]/20"
            >
              Confirm & send
            </button>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10
              flex items-center justify-center mx-auto mb-5
              ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2
              text-stone-400 dark:text-white/25">Transfer sent</p>
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1"
              style={{ fontSize: 'clamp(22px, 5vw, 28px)', letterSpacing: '-0.4px' }}>
              {sym}{(num - fee).toFixed(2)}
            </p>
            <p className="text-[13px] text-stone-400 dark:text-white/30 mb-1">
              sent to {b.name.split(' ')[0]}
            </p>
            <p className="text-[11px] font-mono text-stone-300 dark:text-white/20 mb-6">
              Ref: {ref}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => { setStep('amount'); setAmount(''); setNote(''); }}
                className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors
                  bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]"
              >
                Send again
              </button>
              <button
                onClick={onClose}
                className={cn(
                  'flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors border',
                  'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
                  'text-stone-600 dark:text-white/50'
                )}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD BENEFICIARY SHEET
// ─────────────────────────────────────────────────────────────────────────────

const AddBeneficiarySheet = ({ onClose }: { onClose: () => void }) => {
  const [method, setMethod] = useState<TransferMethod>('bank');

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
          'p-5 pb-10 max-h-[92vh] overflow-y-auto',
          'lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2',
          'lg:w-[480px] lg:rounded-2xl lg:border lg:max-h-[88vh]'
        )}
      >
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10]
          mx-auto mb-5 lg:hidden" />

        <div className="flex items-center justify-between mb-5">
          <p className="text-[15px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white">
            Add beneficiary
          </p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        {/* Transfer method tabs */}
        <div className="flex gap-2 mb-5">
          {([
            { id: 'bank'  as TransferMethod, label: 'Bank account', icon: Building2 },
            { id: 'nexus' as TransferMethod, label: 'Nexus wallet', icon: Globe     },
            { id: 'mobile'as TransferMethod, label: 'Mobile money', icon: User      },
          ]).map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[11px] font-bold transition-all',
                method === m.id
                  ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#C9A84C]'
                  : cn(
                      'bg-white dark:bg-white/[0.02]',
                      'border-stone-200 dark:border-white/[0.08]',
                      'text-stone-500 dark:text-white/35'
                    )
              )}
            >
              <m.icon size={14} />
              <span className="leading-none text-center">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {[
            { label: 'Full name',         placeholder: 'Recipient full name',   type: 'text'  },
            { label: 'Bank name',         placeholder: 'e.g. Zenith Bank',      type: 'text', show: method === 'bank' },
            { label: method === 'nexus' ? 'Nexus ID / email' : method === 'mobile' ? 'Phone number' : 'Account number',
              placeholder: method === 'nexus' ? 'user@nexus.com' : method === 'mobile' ? '+234 800 000 0000' : '0123456789',
              type: method === 'mobile' ? 'tel' : 'text' },
            { label: 'Currency',          placeholder: 'USD, NGN, GBP…',         type: 'text'  },
            { label: 'Country',           placeholder: 'Nigeria, UK, USA…',       type: 'text'  },
            { label: 'Note (optional)',   placeholder: 'e.g. Landlord',           type: 'text'  },
          ].filter(f => f.show !== false).map(f => (
            <div key={f.label}>
              <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl border text-[13px] outline-none transition-colors',
                  'bg-stone-50 dark:bg-white/[0.02]',
                  'border-stone-200 dark:border-white/[0.08]',
                  'text-stone-900 dark:text-white',
                  'placeholder:text-stone-300 dark:placeholder:text-white/20',
                  'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
                )}
              />
            </div>
          ))}

          <button className="w-full py-3.5 rounded-xl text-[13px] font-bold transition-all
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20">
            Save beneficiary
          </button>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const BeneficiariesPage = () => {
  const [beneficiaries,   setBeneficiaries]   = useState(BENEFICIARIES);
  const [search,          setSearch]          = useState('');
  const [filterGroup,     setFilterGroup]     = useState<FilterGroup>('all');
  const [sortOrder,       setSortOrder]       = useState<SortOrder>('recent');
  const [viewMode,        setViewMode]        = useState<'grid' | 'list'>('grid');
  const [selectedB,       setSelectedB]       = useState<Beneficiary | null>(null);
  const [sendTarget,      setSendTarget]      = useState<Beneficiary | null>(null);
  const [showAdd,         setShowAdd]         = useState(false);
  const [showSort,        setShowSort]        = useState(false);

  const handleToggleFav = (id: string) => {
    setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, favourite: !b.favourite } : b));
    if (selectedB?.id === id) setSelectedB(prev => prev ? { ...prev, favourite: !prev.favourite } : null);
  };

  const handleDelete = (id: string) => {
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
  };

  const filtered = useMemo(() => {
    let result = [...beneficiaries];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.bank.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q) ||
        b.currency.toLowerCase().includes(q)
      );
    }

    if (filterGroup === 'favourites') result = result.filter(b => b.favourite);
    if (filterGroup === 'individual') result = result.filter(b => b.type === 'individual');
    if (filterGroup === 'business')   result = result.filter(b => b.type === 'business');

    switch (sortOrder) {
      case 'name':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'most_sent': result.sort((a, b) => b.totalSent.localeCompare(a.totalSent)); break;
      default: break; // keep original order (most recent)
    }

    return result;
  }, [beneficiaries, search, filterGroup, sortOrder]);

  const favourites = beneficiaries.filter(b => b.favourite);

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Saved recipients
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Beneficiaries
        </h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-6 lg:mb-8">
        {[
          { label: 'Total saved',   value: String(beneficiaries.length), sub: 'recipients',         accent: true },
          { label: 'Favourites',    value: String(favourites.length),    sub: 'quick access'                     },
          { label: 'Countries',     value: String(new Set(beneficiaries.map(b => b.country)).size), sub: 'covered' },
        ].map(s => (
          <div key={s.label} className={cn(
            'rounded-2xl border p-3.5 lg:p-4 flex flex-col gap-2',
            s.accent
              ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
              : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07]'
          )}>
            <p className="text-[9px] font-bold tracking-[0.15em] uppercase
              text-stone-400 dark:text-white/25 leading-none">
              {s.label}
            </p>
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none"
              style={{ fontSize: 'clamp(18px, 4vw, 24px)', letterSpacing: '-0.3px' }}>
              {s.value}
            </p>
            <p className="text-[10px] font-mono text-stone-400 dark:text-white/30">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Favourites horizontal scroll strip */}
      {favourites.length > 0 && (
        <div className="mb-6 lg:mb-8">
          <SectionRule label="Favourites" />
          <div
            className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {favourites.map(b => (
              <button
                key={b.id}
                onClick={() => setSendTarget(b)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="relative">
                  <Avatar b={b} size="md" />
                  {/* Send arrow on hover */}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center
                    bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} className="text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-stone-500 dark:text-white/40
                  max-w-[56px] truncate text-center">
                  {b.name.split(' ')[0]}
                </span>
              </button>
            ))}
            {/* Add new quick shortcut */}
            <button
              onClick={() => setShowAdd(true)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                'border-2 border-dashed border-stone-200 dark:border-white/[0.10]',
                'text-stone-300 dark:text-white/20',
                'group-hover:border-[#C9A84C]/50 group-hover:text-[#C9A84C]/60'
              )}>
                <Plus size={16} />
              </div>
              <span className="text-[10px] font-medium text-stone-400 dark:text-white/25">Add</span>
            </button>
          </div>
        </div>
      )}

      {/* Search + controls */}
      <div className="flex items-center gap-2.5 mb-4">
        {/* Search */}
        <div className={cn(
          'flex items-center gap-2.5 flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border transition-colors',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]',
          'focus-within:border-[#C9A84C]/40'
        )}>
          <Search size={14} className="text-stone-300 dark:text-white/20 shrink-0" />
          <input
            type="text"
            placeholder="Search beneficiaries…"
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

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-[11px] font-bold shrink-0 transition-all',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]',
              'text-stone-500 dark:text-white/35',
              'hover:border-stone-300 dark:hover:border-white/[0.14]'
            )}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Sort</span>
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-[50]" onClick={() => setShowSort(false)} />
              <div className={cn(
                'absolute top-full right-0 mt-1.5 w-40 rounded-xl border overflow-hidden z-[60]',
                'bg-white dark:bg-[#1C1C1E]',
                'border-stone-200 dark:border-white/[0.09]',
                'shadow-xl shadow-black/10 dark:shadow-black/40'
              )}>
                {([
                  { id: 'recent'    as SortOrder, label: 'Most recent'  },
                  { id: 'name'      as SortOrder, label: 'Name A–Z'     },
                  { id: 'most_sent' as SortOrder, label: 'Most sent to' },
                ] as { id: SortOrder; label: string }[]).map(o => (
                  <button
                    key={o.id}
                    onClick={() => { setSortOrder(o.id); setShowSort(false); }}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 text-[12px]',
                      'border-b border-stone-50 dark:border-white/[0.04] last:border-0 transition-colors',
                      sortOrder === o.id
                        ? 'bg-[#C9A84C]/[0.07] text-[#C9A84C]'
                        : 'text-stone-600 dark:text-white/50 hover:bg-stone-50 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    {o.label}
                    {sortOrder === o.id && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* View toggle */}
        <div className="flex border border-stone-200 dark:border-white/[0.07] rounded-xl overflow-hidden shrink-0">
          {(['grid', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-2.5 py-2 text-[11px] transition-colors',
                viewMode === mode
                  ? 'bg-[#C9A84C] text-[#0C0C0D]'
                  : 'bg-white dark:bg-white/[0.02] text-stone-400 dark:text-white/30 hover:text-stone-600'
              )}
            >
              {mode === 'grid'
                ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="0" width="6" height="6" rx="1" fill="currentColor"/><rect x="8" y="0" width="6" height="6" rx="1" fill="currentColor"/><rect x="0" y="8" width="6" height="6" rx="1" fill="currentColor"/><rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor"/></svg>
                : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor"/></svg>
              }
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px] font-bold
            shrink-0 transition-all
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]
            shadow-sm shadow-[#C9A84C]/20"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Filter group pills */}
      <div
        className="flex gap-2 mb-5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {(Object.keys(GROUP_LABELS) as FilterGroup[]).map(g => (
          <button
            key={g}
            onClick={() => setFilterGroup(g)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 border transition-all',
              filterGroup === g
                ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C] shadow-sm'
                : cn(
                    'bg-white dark:bg-white/[0.02]',
                    'border-stone-200 dark:border-white/[0.07]',
                    'text-stone-500 dark:text-white/35',
                    'hover:border-stone-300 dark:hover:border-white/[0.14]',
                    'hover:text-stone-700 dark:hover:text-white/55'
                  )
            )}
          >
            {GROUP_LABELS[g]}
            {g === 'favourites' && (
              <span className="ml-1.5 text-[9px] opacity-70">{favourites.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      <SectionRule
        label={`${filtered.length} beneficiar${filtered.length !== 1 ? 'ies' : 'y'}`}
        action={{ text: '+ Add new', onClick: () => setShowAdd(true) }}
      />

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className={cn(
          'rounded-2xl border p-12 text-center',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          <p className="text-[13px] font-semibold text-stone-400 dark:text-white/30 mb-1">
            No beneficiaries found
          </p>
          <p className="text-[11px] text-stone-300 dark:text-white/20 mb-4">
            {search ? 'Try a different search term' : 'Add your first beneficiary to get started'}
          </p>
          <button
            onClick={() => { setSearch(''); setFilterGroup('all'); }}
            className="text-[12px] font-bold text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors"
          >
            {search ? 'Clear search' : 'Add beneficiary →'}
          </button>
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(b => (
            <BeneficiaryCard
              key={b.id}
              b={b}
              onSelect={setSelectedB}
              onSend={setSendTarget}
              onToggleFav={handleToggleFav}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && filtered.length > 0 && (
        <div className={cn(
          'rounded-2xl border overflow-hidden',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          <div className="px-3 sm:px-4 py-1">
            {filtered.map(b => (
              <BeneficiaryRow
                key={b.id}
                b={b}
                onSelect={setSelectedB}
                onSend={setSendTarget}
                onToggleFav={handleToggleFav}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom clearance */}
      <div className="h-24 lg:h-12" />

      {/* Sheets */}
      {selectedB && (
        <DetailSheet
          b={selectedB}
          onClose={() => setSelectedB(null)}
          onSend={b => { setSelectedB(null); setSendTarget(b); }}
          onToggleFav={handleToggleFav}
          onDelete={handleDelete}
        />
      )}

      {sendTarget && (
        <SendSheet
          b={sendTarget}
          onClose={() => setSendTarget(null)}
        />
      )}

      {showAdd && (
        <AddBeneficiarySheet onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
};

export default BeneficiariesPage;