import { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Download,
  SlidersHorizontal,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getFlag } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

type TxType   = 'credit' | 'debit' | 'swap';
type TxStatus = 'completed' | 'pending' | 'failed';
type Currency = 'USD' | 'NGN' | 'GBP' | 'EUR' | 'CAD' | 'JPY';

interface Transaction {
  id:        string;
  type:      TxType;
  status:    TxStatus;
  title:     string;
  subtitle:  string;
  amount:    string;
  amountRaw: number;
  currency:  Currency;
  toCurrency?: Currency;
  date:      string;       // ISO date string
  dateLabel: string;       // human label for grouping
  ref:       string;
}

const TX_DATA: Transaction[] = [
  // April 2025
  { id:'t01', type:'credit', status:'completed', title:'Received from James O.',   subtitle:'Wire transfer',           amount:'+$1,200.00', amountRaw:1200,   currency:'USD', date:'2025-04-03', dateLabel:'Today',         ref:'NXS-A10293' },
  { id:'t02', type:'swap',   status:'completed', title:'USD → NGN conversion',      subtitle:'FX swap · Rate 1,618',    amount:'-$500.00',   amountRaw:-500,   currency:'USD', toCurrency:'NGN', date:'2025-04-03', dateLabel:'Today',         ref:'NXS-A10294' },
  { id:'t03', type:'debit',  status:'pending',   title:'Rent payment',              subtitle:'Standing order',          amount:'-₦250,000',  amountRaw:-250000,currency:'NGN', date:'2025-04-03', dateLabel:'Today',         ref:'NXS-A10295' },
  { id:'t04', type:'debit',  status:'completed', title:'Sent to Amina B.',          subtitle:'Bank transfer · GBP',     amount:'-£250.00',   amountRaw:-250,   currency:'GBP', date:'2025-04-02', dateLabel:'Yesterday',     ref:'NXS-A10280' },
  { id:'t05', type:'credit', status:'completed', title:'Received from client',      subtitle:'Invoice #4421 · EUR',     amount:'+€3,800.00', amountRaw:3800,   currency:'EUR', date:'2025-04-02', dateLabel:'Yesterday',     ref:'NXS-A10279' },
  { id:'t06', type:'swap',   status:'completed', title:'GBP → EUR conversion',      subtitle:'FX swap · Rate 1.163',    amount:'-£400.00',   amountRaw:-400,   currency:'GBP', toCurrency:'EUR', date:'2025-04-02', dateLabel:'Yesterday',     ref:'NXS-A10278' },
  { id:'t07', type:'credit', status:'completed', title:'Salary deposit',            subtitle:'Direct credit · USD',     amount:'+$4,500.00', amountRaw:4500,   currency:'USD', date:'2025-04-01', dateLabel:'1 Apr',         ref:'NXS-A10265' },
  { id:'t08', type:'debit',  status:'failed',    title:'Bill payment – DSTV',       subtitle:'Utility payment',         amount:'-₦15,000',   amountRaw:-15000, currency:'NGN', date:'2025-04-01', dateLabel:'1 Apr',         ref:'NXS-A10264' },
  // March 2025
  { id:'t09', type:'debit',  status:'completed', title:'Sent to David M.',          subtitle:'Bank transfer · USD',     amount:'-$320.00',   amountRaw:-320,   currency:'USD', date:'2025-03-28', dateLabel:'28 Mar',        ref:'NXS-A10251' },
  { id:'t10', type:'swap',   status:'completed', title:'NGN → USD conversion',      subtitle:'FX swap · Rate 0.000618', amount:'-₦250,000',  amountRaw:-250000,currency:'NGN', toCurrency:'USD', date:'2025-03-27', dateLabel:'27 Mar',        ref:'NXS-A10240' },
  { id:'t11', type:'credit', status:'completed', title:'Payment from Chioma E.',    subtitle:'Wire transfer · NGN',     amount:'+₦180,000',  amountRaw:180000, currency:'NGN', date:'2025-03-25', dateLabel:'25 Mar',        ref:'NXS-A10228' },
  { id:'t12', type:'debit',  status:'completed', title:'Airtime purchase',          subtitle:'Mobile top-up',           amount:'-₦5,000',    amountRaw:-5000,  currency:'NGN', date:'2025-03-24', dateLabel:'24 Mar',        ref:'NXS-A10215' },
  { id:'t13', type:'debit',  status:'completed', title:'International transfer',    subtitle:'To Fatima A. · EUR',      amount:'-$1,080.00', amountRaw:-1080,  currency:'USD', date:'2025-03-20', dateLabel:'20 Mar',        ref:'NXS-A10199' },
  { id:'t14', type:'credit', status:'completed', title:'Freelance payment',         subtitle:'Invoice #3891 · USD',     amount:'+$2,200.00', amountRaw:2200,   currency:'USD', date:'2025-03-15', dateLabel:'15 Mar',        ref:'NXS-A10183' },
  { id:'t15', type:'swap',   status:'completed', title:'USD → GBP conversion',      subtitle:'FX swap · Rate 0.7912',   amount:'-$1,200.00', amountRaw:-1200,  currency:'USD', toCurrency:'GBP', date:'2025-03-12', dateLabel:'12 Mar',        ref:'NXS-A10170' },
  { id:'t16', type:'debit',  status:'completed', title:'Rent payment',              subtitle:'Standing order · NGN',    amount:'-₦250,000',  amountRaw:-250000,currency:'NGN', date:'2025-03-03', dateLabel:'3 Mar',         ref:'NXS-A10150' },
  // February 2025
  { id:'t17', type:'credit', status:'completed', title:'Salary deposit',            subtitle:'Direct credit · USD',     amount:'+$4,500.00', amountRaw:4500,   currency:'USD', date:'2025-02-28', dateLabel:'28 Feb',        ref:'NXS-A10130' },
  { id:'t18', type:'debit',  status:'completed', title:'Sent to James O.',          subtitle:'Bank transfer · USD',     amount:'-$750.00',   amountRaw:-750,   currency:'USD', date:'2025-02-20', dateLabel:'20 Feb',        ref:'NXS-A10110' },
  { id:'t19', type:'swap',   status:'completed', title:'GBP → NGN conversion',      subtitle:'FX swap · Rate 2,044',    amount:'-£200.00',   amountRaw:-200,   currency:'GBP', toCurrency:'NGN', date:'2025-02-14', dateLabel:'14 Feb',        ref:'NXS-A10095' },
  { id:'t20', type:'credit', status:'completed', title:'Client retainer',           subtitle:'Invoice #3711 · USD',     amount:'+$1,800.00', amountRaw:1800,   currency:'USD', date:'2025-02-05', dateLabel:'5 Feb',         ref:'NXS-A10070' },
];

type FilterType     = 'all' | 'credit' | 'debit' | 'swap';
type FilterStatus   = 'all' | 'completed' | 'pending' | 'failed';
type FilterCurrency = 'all' | Currency;
type SortOrder      = 'newest' | 'oldest' | 'highest' | 'lowest';

const TYPE_LABELS: Record<FilterType, string>         = { all:'All',       credit:'Received', debit:'Sent',      swap:'Converted' };
const STATUS_LABELS: Record<FilterStatus, string>     = { all:'All',       completed:'Done',  pending:'Pending', failed:'Failed'  };
const CURRENCY_OPTIONS: FilterCurrency[]              = ['all','USD','NGN','GBP','EUR','CAD','JPY'];
const SORT_LABELS: Record<SortOrder, string>          = { newest:'Newest first', oldest:'Oldest first', highest:'Highest amount', lowest:'Lowest amount' };

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TxStatus, { label: string; cls: string }> = {
  completed: { label: 'Done',    cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
  pending:   { label: 'Pending', cls: 'text-[#C9A84C] bg-[#C9A84C]/10' },
  failed:    { label: 'Failed',  cls: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10' },
};

const TYPE_ICON: Record<TxType, React.ElementType> = {
  credit: ArrowDownLeft,
  debit:  ArrowUpRight,
  swap:   ArrowLeftRight,
};

const TYPE_ICON_BG: Record<TxType, string> = {
  credit: 'bg-emerald-50 dark:bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400',
  debit:  'bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08] text-[#C9A84C]',
  swap:   'bg-sky-50 dark:bg-sky-500/[0.08] text-sky-500 dark:text-sky-400',
};

function groupByDate(txs: Transaction[]): { label: string; month: string; items: Transaction[] }[] {
  const groups: Record<string, { label: string; month: string; items: Transaction[] }> = {};
  txs.forEach(tx => {
    const d     = new Date(tx.date);
    const month = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const key   = tx.dateLabel === 'Today' || tx.dateLabel === 'Yesterday'
      ? tx.dateLabel
      : `${tx.dateLabel}`;
    const groupKey = `${month}__${key}`;
    if (!groups[groupKey]) groups[groupKey] = { label: key, month, items: [] };
    groups[groupKey].items.push(tx);
  });
  // Merge into month buckets
  const months: Record<string, { label: string; month: string; items: Transaction[] }[]> = {};
  Object.values(groups).forEach(g => {
    if (!months[g.month]) months[g.month] = [];
    months[g.month].push(g);
  });
  // Flatten with month headers
  const result: { label: string; month: string; items: Transaction[] }[] = [];
  Object.entries(months).forEach(([month, dayGroups]) => {
    dayGroups.forEach((dg, i) => {
      result.push({ label: dg.label, month: i === 0 ? month : '', items: dg.items });
    });
  });
  return result;
}

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
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, up, accent }: {
  label: string; value: string; sub: string; up?: boolean; accent?: boolean;
}) => (
  <div className={cn(
    'rounded-2xl border p-4 flex flex-col gap-2.5',
    accent
      ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
      : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07]'
  )}>
    <p className="text-[9px] font-bold tracking-[0.18em] uppercase
      text-stone-400 dark:text-white/25">
      {label}
    </p>
    <p className="font-['DM_Serif_Display',_Georgia,_serif] font-normal leading-none
      text-stone-900 dark:text-white"
      style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', letterSpacing: '-0.3px' }}>
      {value}
    </p>
    <div className="flex items-center gap-1.5">
      {up !== undefined && (
        up ? <TrendingUp size={10} className="text-emerald-500 shrink-0" />
           : <TrendingDown size={10} className="text-red-400 shrink-0" />
      )}
      <span className={cn(
        'text-[10px] font-mono leading-snug',
        up === undefined ? 'text-stone-400 dark:text-white/30'
          : up ? 'text-emerald-500' : 'text-red-400'
      )}>
        {sub}
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PILL
// ─────────────────────────────────────────────────────────────────────────────

const FilterPill = ({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'px-3.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all border',
      active
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
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION ROW
// ─────────────────────────────────────────────────────────────────────────────

const TxRow = ({ tx, onClick }: { tx: Transaction; onClick: (tx: Transaction) => void }) => {
  const Icon   = TYPE_ICON[tx.type];
  const iconBg = TYPE_ICON_BG[tx.type];
  const status = STATUS_CONFIG[tx.status];

  return (
    <div
      onClick={() => onClick(tx)}
      className="flex items-center gap-3 py-3.5
        border-b border-stone-100 dark:border-white/[0.04] last:border-0
        hover:bg-stone-50 dark:hover:bg-white/[0.02]
        -mx-2 px-2 rounded-xl transition-colors cursor-pointer group"
    >
      {/* Icon */}
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        iconBg
      )}>
        <Icon size={14} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[13px] font-semibold leading-none tracking-[-0.2px] truncate
            text-stone-800 dark:text-white/80">
            {tx.title}
          </p>
          {/* Status badge — always show non-completed, show completed on hover desktop */}
          <span className={cn(
            'text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0',
            status.cls,
            tx.status === 'completed'
              ? 'hidden lg:inline-flex lg:opacity-0 lg:group-hover:opacity-100 transition-opacity'
              : 'inline-flex'
          )}>
            {status.label}
          </span>
        </div>
        <p className="text-[10px] mt-0.5 truncate text-stone-400 dark:text-white/25">
          {tx.subtitle} · {tx.ref}
        </p>
      </div>

      {/* Currency flag */}
      <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
        <img src={getFlag(tx.currency)} alt={tx.currency}
          className="w-4 h-4 rounded-full object-cover border border-stone-200 dark:border-white/[0.08]" />
        {tx.toCurrency && (
          <>
            <span className="text-[9px] text-stone-300 dark:text-white/20">→</span>
            <img src={getFlag(tx.toCurrency)} alt={tx.toCurrency}
              className="w-4 h-4 rounded-full object-cover border border-stone-200 dark:border-white/[0.08]" />
          </>
        )}
      </div>

      {/* Amount + date */}
      <div className="text-right shrink-0">
        <p className={cn(
          'text-[13px] font-mono font-medium tabular-nums leading-none',
          tx.type === 'credit'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-stone-700 dark:text-white/65'
        )}>
          {tx.amount}
        </p>
        <p className="text-[10px] font-mono mt-0.5 text-stone-300 dark:text-white/20">
          {tx.dateLabel}
        </p>
      </div>

      <ChevronRight size={12}
        className="text-stone-200 dark:text-white/15 shrink-0
          group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors
          hidden sm:block" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION DETAIL SHEET (mobile bottom sheet / desktop side panel)
// ─────────────────────────────────────────────────────────────────────────────

const TxDetailSheet = ({ tx, onClose }: { tx: Transaction; onClose: () => void }) => {
  const Icon   = TYPE_ICON[tx.type];
  const iconBg = TYPE_ICON_BG[tx.type];
  const status = STATUS_CONFIG[tx.status];

  const details = [
    { label: 'Reference',   value: tx.ref },
    { label: 'Date',        value: new Date(tx.date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) },
    { label: 'Type',        value: tx.type === 'credit' ? 'Received' : tx.type === 'debit' ? 'Sent' : 'Conversion' },
    { label: 'Currency',    value: tx.toCurrency ? `${tx.currency} → ${tx.toCurrency}` : tx.currency },
    { label: 'Status',      value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) },
    { label: 'Amount',      value: tx.amount },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet — bottom on mobile, right-side panel on lg+ */}
      <div className={cn(
        'fixed z-[160] bg-white dark:bg-[#161618]',
        'border-stone-200 dark:border-white/[0.08]',
        // Mobile: full-width bottom sheet
        'bottom-0 left-0 right-0 rounded-t-2xl border-t p-6 pb-10',
        // Desktop: right panel
        'lg:bottom-auto lg:top-0 lg:right-0 lg:left-auto lg:h-full',
        'lg:w-[380px] lg:rounded-none lg:rounded-l-2xl',
        'lg:border-t-0 lg:border-l',
        'lg:p-8 lg:pb-8',
        'lg:overflow-y-auto'
      )}>
        {/* Handle (mobile) */}
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10] mx-auto mb-6 lg:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase
                text-stone-400 dark:text-white/25 mb-0.5">
                Transaction detail
              </p>
              <p className="text-[14px] font-bold tracking-[-0.2px] leading-none
                text-stone-900 dark:text-white">
                {tx.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              text-stone-400 dark:text-white/30
              hover:bg-stone-100 dark:hover:bg-white/[0.06]
              hover:text-stone-700 dark:hover:text-white/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Amount */}
        <div className={cn(
          'rounded-2xl border p-5 mb-5 text-center',
          tx.type === 'credit'
            ? 'bg-emerald-50 dark:bg-emerald-500/[0.06] border-emerald-100 dark:border-emerald-500/[0.12]'
            : tx.type === 'debit'
            ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/15'
            : 'bg-sky-50 dark:bg-sky-500/[0.06] border-sky-100 dark:border-sky-500/[0.12]'
        )}>
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
            text-stone-400 dark:text-white/25">
            {tx.type === 'credit' ? 'Amount received' : tx.type === 'debit' ? 'Amount sent' : 'Amount converted'}
          </p>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] leading-none"
            style={{ fontSize: 'clamp(24px, 5vw, 30px)', letterSpacing: '-0.5px' }}
          >
            <span className={cn(
              tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400'
                : tx.type === 'debit' ? 'text-[#C9A84C]'
                : 'text-sky-600 dark:text-sky-400'
            )}>
              {tx.amount}
            </span>
          </p>
          <span className={cn(
            'inline-flex mt-3 text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full',
            status.cls
          )}>
            {status.label}
          </span>
        </div>

        {/* Detail rows */}
        <div className={cn(
          'rounded-xl border divide-y overflow-hidden mb-5',
          'border-stone-100 dark:border-white/[0.06]',
          'divide-stone-100 dark:divide-white/[0.06]'
        )}>
          {details.map(d => (
            <div key={d.label} className="flex items-center justify-between px-4 py-3 gap-4
              bg-white dark:bg-white/[0.01]">
              <span className="text-[11px] text-stone-400 dark:text-white/30 shrink-0">
                {d.label}
              </span>
              <span className="text-[12px] font-mono text-stone-700 dark:text-white/65
                text-right truncate">
                {d.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button className={cn(
            'w-full py-3 rounded-xl text-[13px] font-bold transition-colors border',
            'bg-stone-50 dark:bg-white/[0.03]',
            'border-stone-200 dark:border-white/[0.08]',
            'text-stone-600 dark:text-white/50',
            'hover:bg-stone-100 dark:hover:bg-white/[0.06]',
            'hover:text-stone-900 dark:hover:text-white'
          )}>
            Download receipt
          </button>
          {tx.type === 'debit' && (
            <button className="w-full py-3 rounded-xl text-[13px] font-bold transition-colors
              bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
              Repeat transfer
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SORT DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const SortDropdown = ({ value, onChange }: {
  value: SortOrder; onChange: (v: SortOrder) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-bold transition-colors',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]',
          'text-stone-500 dark:text-white/35',
          'hover:border-stone-300 dark:hover:border-white/[0.14]',
          'hover:text-stone-700 dark:hover:text-white/55',
          open && 'border-[#C9A84C]/40 text-[#C9A84C]'
        )}
      >
        <span className="truncate max-w-[90px] sm:max-w-none">{SORT_LABELS[value]}</span>
        <ChevronDown size={12} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[50]" onClick={() => setOpen(false)} />
          <div className={cn(
            'absolute top-full right-0 mt-1.5 w-44 rounded-xl border overflow-hidden z-[60]',
            'bg-white dark:bg-[#1C1C1E]',
            'border-stone-200 dark:border-white/[0.09]',
            'shadow-xl shadow-black/10 dark:shadow-black/40'
          )}>
            {(Object.keys(SORT_LABELS) as SortOrder[]).map(k => (
              <button
                key={k}
                onClick={() => { onChange(k); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 text-[12px]',
                  'border-b border-stone-50 dark:border-white/[0.04] last:border-0',
                  'transition-colors',
                  value === k
                    ? 'bg-[#C9A84C]/[0.07] text-[#C9A84C]'
                    : 'text-stone-600 dark:text-white/50 hover:bg-stone-50 dark:hover:bg-white/[0.04]'
                )}
              >
                {SORT_LABELS[k]}
                {value === k && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const HistoryPage = () => {
  const [search,          setSearch]          = useState('');
  const [filterType,      setFilterType]      = useState<FilterType>('all');
  const [filterStatus,    setFilterStatus]    = useState<FilterStatus>('all');
  const [filterCurrency,  setFilterCurrency]  = useState<FilterCurrency>('all');
  const [sortOrder,       setSortOrder]       = useState<SortOrder>('newest');
  const [selectedTx,      setSelectedTx]      = useState<Transaction | null>(null);
  const [showFilters,     setShowFilters]     = useState(false);

  // Active filter count for badge
  const activeFilterCount = [
    filterType     !== 'all',
    filterStatus   !== 'all',
    filterCurrency !== 'all',
  ].filter(Boolean).length;

  // Filtered + sorted transactions
  const filtered = useMemo(() => {
    let result = [...TX_DATA];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(tx =>
        tx.title.toLowerCase().includes(q) ||
        tx.subtitle.toLowerCase().includes(q) ||
        tx.ref.toLowerCase().includes(q) ||
        tx.amount.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(tx => tx.status === filterStatus);
    }

    // Currency filter
    if (filterCurrency !== 'all') {
      result = result.filter(tx => tx.currency === filterCurrency || tx.toCurrency === filterCurrency);
    }

    // Sort
    switch (sortOrder) {
      case 'oldest':  result.sort((a, b) => a.date.localeCompare(b.date)); break;
      case 'highest': result.sort((a, b) => Math.abs(b.amountRaw) - Math.abs(a.amountRaw)); break;
      case 'lowest':  result.sort((a, b) => Math.abs(a.amountRaw) - Math.abs(b.amountRaw)); break;
      default:        result.sort((a, b) => b.date.localeCompare(a.date));
    }

    return result;
  }, [search, filterType, filterStatus, filterCurrency, sortOrder]);

  const grouped = useMemo(() =>
    sortOrder === 'newest' || sortOrder === 'oldest'
      ? groupByDate(filtered)
      : [{ label: '', month: '', items: filtered }],
    [filtered, sortOrder]
  );

  const clearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setFilterCurrency('all');
    setSearch('');
  };

  return (
    <div className="w-full">

      {/* ── Page header ── */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Transaction log
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          History
        </h1>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        <StatCard label="Transactions" value={String(TX_DATA.length)} sub="all time"               accent />
        <StatCard label="Total in"     value="$27.3k" sub="+18% vs last month" up={true}                  />
        <StatCard label="Total out"    value="$19.1k" sub="-6% vs last month"  up={false}                 />
        <StatCard label="Conversions"  value="6"       sub="this month"                                    />
      </div>

      {/* ── Search + controls bar ── */}
      <div className="flex items-center gap-2.5 mb-4">
        {/* Search */}
        <div className={cn(
          'flex items-center gap-2.5 flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border transition-colors',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]',
          'focus-within:border-[#C9A84C]/40 dark:focus-within:border-[#C9A84C]/30'
        )}>
          <Search size={14} className="text-stone-300 dark:text-white/20 shrink-0" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-[13px] outline-none
              text-stone-900 dark:text-white
              placeholder:text-stone-300 dark:placeholder:text-white/20"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="text-stone-300 dark:text-white/20 hover:text-stone-500 dark:hover:text-white/40 shrink-0">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-bold shrink-0 transition-all',
            showFilters || activeFilterCount > 0
              ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#C9A84C]'
              : cn(
                  'bg-white dark:bg-white/[0.02]',
                  'border-stone-200 dark:border-white/[0.07]',
                  'text-stone-500 dark:text-white/35',
                  'hover:border-stone-300 dark:hover:border-white/[0.14]'
                )
          )}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#C9A84C] text-[#0C0C0D] text-[9px] font-bold
              flex items-center justify-center absolute -top-1.5 -right-1.5">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <SortDropdown value={sortOrder} onChange={setSortOrder} />

        {/* Export */}
        <button className={cn(
          'p-2.5 rounded-xl border transition-colors shrink-0',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]',
          'text-stone-400 dark:text-white/30',
          'hover:border-stone-300 dark:hover:border-white/[0.14]',
          'hover:text-stone-700 dark:hover:text-white/60',
          'hidden sm:flex items-center'
        )}>
          <Download size={14} />
        </button>
      </div>

      {/* ── Expanded filter panel ── */}
      {showFilters && (
        <div className={cn(
          'rounded-2xl border p-4 mb-4 space-y-4',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          {/* Type */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2.5
              text-stone-400 dark:text-white/25">
              Type
            </p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TYPE_LABELS) as FilterType[]).map(t => (
                <FilterPill
                  key={t}
                  label={TYPE_LABELS[t]}
                  active={filterType === t}
                  onClick={() => setFilterType(t)}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2.5
              text-stone-400 dark:text-white/25">
              Status
            </p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(STATUS_LABELS) as FilterStatus[]).map(s => (
                <FilterPill
                  key={s}
                  label={STATUS_LABELS[s]}
                  active={filterStatus === s}
                  onClick={() => setFilterStatus(s)}
                />
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2.5
              text-stone-400 dark:text-white/25">
              Currency
            </p>
            <div
              className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-0.5"
              style={{ scrollbarWidth: 'none' }}
            >
              {CURRENCY_OPTIONS.map(c => (
                <FilterPill
                  key={c}
                  label={c === 'all' ? 'All' : c}
                  active={filterCurrency === c}
                  onClick={() => setFilterCurrency(c)}
                />
              ))}
            </div>
          </div>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-bold text-red-400/70 hover:text-red-400 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Active filter chips (compact summary when panel closed) ── */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {filterType !== 'all' && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold
              bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
              {TYPE_LABELS[filterType]}
              <button onClick={() => setFilterType('all')}><X size={10} /></button>
            </span>
          )}
          {filterStatus !== 'all' && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold
              bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
              {STATUS_LABELS[filterStatus]}
              <button onClick={() => setFilterStatus('all')}><X size={10} /></button>
            </span>
          )}
          {filterCurrency !== 'all' && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold
              bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
              {filterCurrency}
              <button onClick={() => setFilterCurrency('all')}><X size={10} /></button>
            </span>
          )}
          <button onClick={clearFilters}
            className="text-[10px] font-bold text-stone-400 dark:text-white/25
              hover:text-stone-600 dark:hover:text-white/45 transition-colors">
            Clear all
          </button>
        </div>
      )}

      {/* ── Transaction list ── */}
      <SectionRule
        label={`${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`}
        action={{ text: 'Export CSV' }}
      />

      {filtered.length === 0 ? (
        <div className={cn(
          'rounded-2xl border p-12 text-center',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          <p className="text-[13px] font-semibold text-stone-400 dark:text-white/30 mb-1">
            No transactions found
          </p>
          <p className="text-[11px] text-stone-300 dark:text-white/20 mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={clearFilters}
            className="text-[12px] font-bold text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {grouped.map((group, gi) => (
            <div key={gi}>
              {/* Month header */}
              {group.month && (
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase pt-2 pb-3
                  text-stone-400 dark:text-white/25">
                  {group.month}
                </p>
              )}

              {/* Day group card */}
              <div className={cn(
                'rounded-2xl border overflow-hidden mb-3',
                'bg-white dark:bg-white/[0.02]',
                'border-stone-200 dark:border-white/[0.07]'
              )}>
                {/* Day label */}
                {group.label && (
                  <div className="px-4 py-2.5 border-b border-stone-100 dark:border-white/[0.05]
                    flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em]
                      text-stone-400 dark:text-white/25">
                      {group.label}
                    </span>
                    <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
                      {group.items.length} transaction{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <div className="px-3 sm:px-4 py-1">
                  {group.items.map(tx => (
                    <TxRow key={tx.id} tx={tx} onClick={setSelectedTx} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      <div className="flex justify-center py-4 mb-24 lg:mb-12">
        <button className={cn(
          'px-6 py-2.5 rounded-xl border text-[12px] font-bold transition-all',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]',
          'text-stone-500 dark:text-white/35',
          'hover:border-[#C9A84C]/30 hover:text-[#C9A84C]/80'
        )}>
          Load earlier transactions
        </button>
      </div>

      {/* ── Transaction detail sheet ── */}
      {selectedTx && (
        <TxDetailSheet tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
};

export default HistoryPage;