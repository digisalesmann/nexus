import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Zap,
  Shield,
  Percent,
  DollarSign,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

type LoanStatus = 'active' | 'paid_off' | 'overdue';
type LoanType   = 'personal' | 'business' | 'emergency';

interface Loan {
  id:           string;
  type:         LoanType;
  label:        string;
  principal:    number;
  balance:      number;
  monthlyDue:   number;
  rate:         number;       // annual %
  termMonths:   number;
  paidMonths:   number;
  nextDueDate:  string;
  status:       LoanStatus;
  disbursed:    string;
}

interface LoanProduct {
  id:       string;
  name:     string;
  sub:      string;
  minAmt:   number;
  maxAmt:   number;
  minRate:  number;
  maxRate:  number;
  maxTerm:  number;          // months
  icon:     React.ElementType;
  features: string[];
  popular?: boolean;
}

const ACTIVE_LOANS: Loan[] = [
  {
    id:          'L001',
    type:        'personal',
    label:       'Personal loan',
    principal:   5000,
    balance:     3420.50,
    monthlyDue:  245.83,
    rate:        12.5,
    termMonths:  24,
    paidMonths:  7,
    nextDueDate: '15 Apr 2025',
    status:      'active',
    disbursed:   'Sep 2024',
  },
  {
    id:          'L002',
    type:        'business',
    label:       'Business loan',
    principal:   15000,
    balance:     11800.00,
    monthlyDue:  650.00,
    rate:        9.8,
    termMonths:  36,
    paidMonths:  5,
    nextDueDate: '20 Apr 2025',
    status:      'overdue',
    disbursed:   'Nov 2024',
  },
];

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id:       'personal',
    name:     'Personal loan',
    sub:      'For everyday needs',
    minAmt:   500,
    maxAmt:   10000,
    minRate:  10.5,
    maxRate:  18.0,
    maxTerm:  36,
    icon:     DollarSign,
    popular:  true,
    features: ['No collateral required', 'Instant disbursement', 'Flexible repayment'],
  },
  {
    id:       'business',
    name:     'Business loan',
    sub:      'Grow your enterprise',
    minAmt:   5000,
    maxAmt:   100000,
    minRate:  8.5,
    maxRate:  14.0,
    maxTerm:  60,
    icon:     FileText,
    features: ['Working capital', 'Asset financing', 'Invoice discounting'],
  },
  {
    id:       'emergency',
    name:     'Emergency loan',
    sub:      'Fast access, low rate',
    minAmt:   100,
    maxAmt:   2000,
    minRate:  6.0,
    maxRate:  9.0,
    maxTerm:  12,
    icon:     Zap,
    features: ['Disbursed in 60 seconds', 'No paperwork', 'Auto-repay from balance'],
  },
];

const REPAYMENT_SCHEDULE = Array.from({ length: 10 }, (_, i) => ({
  month:     i + 8,   // months 8–17 (showing future payments for L001)
  date:      `${15 + 0} ${['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan'][i]} 2025`,
  principal: +(200 + Math.random() * 10).toFixed(2),
  interest:  +(45 - i * 1.5).toFixed(2),
  balance:   +(3420.50 - (i + 1) * 245).toFixed(2),
  status:    i === 0 ? 'due' as const : 'upcoming' as const,
}));

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function calcMonthly(principal: number, annualRate: number, months: number): number {
  if (months === 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000)    return `$${n.toLocaleString('en', { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(paid: number, total: number): number {
  return Math.min(100, Math.round((paid / total) * 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
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

// Progress bar
const ProgressBar = ({ value, color = '#C9A84C', bg = '' }: {
  value: number; color?: string; bg?: string;
}) => (
  <div className={cn('h-1.5 rounded-full overflow-hidden', bg || 'bg-stone-100 dark:bg-white/[0.06]')}>
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${value}%`, background: color }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOAN CARD
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LoanStatus, { label: string; cls: string; dot: string }> = {
  active:   { label: 'Active',   cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',   dot: 'bg-emerald-400' },
  paid_off: { label: 'Paid off', cls: 'text-stone-400 dark:text-white/25 bg-stone-100 dark:bg-white/[0.06]',           dot: 'bg-stone-300'   },
  overdue:  { label: 'Overdue',  cls: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/[0.10]',               dot: 'bg-red-400'     },
};

const LoanCard = ({ loan, onSelect }: { loan: Loan; onSelect: (l: Loan) => void }) => {
  const s      = STATUS_CONFIG[loan.status];
  const prog   = pct(loan.paidMonths, loan.termMonths);
  const remain = loan.termMonths - loan.paidMonths;

  return (
    <div
      onClick={() => onSelect(loan)}
      className={cn(
        'rounded-2xl border p-5 cursor-pointer transition-all group',
        loan.status === 'overdue'
          ? 'bg-red-50/60 dark:bg-red-500/[0.04] border-red-200 dark:border-red-500/[0.15] hover:border-red-300 dark:hover:border-red-500/[0.25]'
          : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07] hover:border-stone-300 dark:hover:border-white/[0.14] hover:shadow-sm'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase
              text-stone-400 dark:text-white/25">
              {loan.id}
            </span>
            <span className={cn(
              'text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full',
              s.cls
            )}>
              {s.label}
            </span>
            {loan.status === 'overdue' && (
              <AlertCircle size={12} className="text-red-400 shrink-0" />
            )}
          </div>
          <p className="text-[14px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white">
            {loan.label}
          </p>
        </div>
        <ChevronRight size={15}
          className="text-stone-200 dark:text-white/15 shrink-0 mt-0.5
            group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors" />
      </div>

      {/* Balance + monthly */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
            text-stone-400 dark:text-white/25">
            Outstanding
          </p>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none"
            style={{ fontSize: 'clamp(20px, 4vw, 26px)', letterSpacing: '-0.3px' }}>
            {fmtCurrency(loan.balance)}
          </p>
          <p className="text-[10px] font-mono mt-0.5 text-stone-400 dark:text-white/25">
            of {fmtCurrency(loan.principal)} borrowed
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
            text-stone-400 dark:text-white/25">
            Next payment
          </p>
          <p className="text-[15px] font-bold font-mono tabular-nums text-stone-800 dark:text-white/80">
            {fmtCurrency(loan.monthlyDue)}
          </p>
          <p className="text-[10px] font-mono mt-0.5 text-stone-400 dark:text-white/25">
            due {loan.nextDueDate}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <ProgressBar
          value={prog}
          color={loan.status === 'overdue' ? '#f87171' : '#C9A84C'}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-stone-400 dark:text-white/25">
          {loan.paidMonths} of {loan.termMonths} months paid
        </span>
        <span className="text-[10px] font-mono text-stone-400 dark:text-white/25">
          {remain} remaining · {loan.rate}% p.a.
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOAN DETAIL SHEET
// ─────────────────────────────────────────────────────────────────────────────

const LoanDetailSheet = ({ loan, onClose }: { loan: Loan; onClose: () => void }) => {
  const s    = STATUS_CONFIG[loan.status];
  const prog = pct(loan.paidMonths, loan.termMonths);

  const details = [
    { label: 'Loan ID',         value: loan.id },
    { label: 'Disbursed',       value: loan.disbursed },
    { label: 'Principal',       value: fmtCurrency(loan.principal) },
    { label: 'Interest rate',   value: `${loan.rate}% p.a.` },
    { label: 'Term',            value: `${loan.termMonths} months` },
    { label: 'Monthly payment', value: fmtCurrency(loan.monthlyDue) },
    { label: 'Next due date',   value: loan.nextDueDate },
    { label: 'Outstanding',     value: fmtCurrency(loan.balance) },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={cn(
          'fixed z-[160] bg-white dark:bg-[#161618]',
          'border-stone-200 dark:border-white/[0.08]',
          '[&::-webkit-scrollbar]:hidden',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl border-t p-5 pb-10 max-h-[90vh] overflow-y-auto',
          // Desktop: right panel
          'lg:bottom-auto lg:top-0 lg:right-0 lg:left-auto',
          'lg:h-full lg:w-[400px] lg:rounded-none lg:rounded-l-2xl',
          'lg:border-t-0 lg:border-l lg:overflow-y-auto lg:p-8'
        )}>
        {/* Handle */}
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10] mx-auto mb-5 lg:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5
              text-stone-400 dark:text-white/25">
              Loan details
            </p>
            <p className="text-[15px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white">
              {loan.label}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        {/* Status + progress */}
        <div className={cn(
          'rounded-xl border p-4 mb-5',
          loan.status === 'overdue'
            ? 'bg-red-50/60 dark:bg-red-500/[0.05] border-red-200 dark:border-red-500/[0.15]'
            : 'bg-stone-50 dark:bg-white/[0.02] border-stone-100 dark:border-white/[0.06]'
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full',
              s.cls
            )}>
              {s.label}
            </span>
            <span className="text-[12px] font-mono text-stone-500 dark:text-white/40">
              {prog}% repaid
            </span>
          </div>
          <ProgressBar
            value={prog}
            color={loan.status === 'overdue' ? '#f87171' : '#C9A84C'}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-mono text-stone-400 dark:text-white/25">
              {loan.paidMonths} months paid
            </span>
            <span className="text-[10px] font-mono text-stone-400 dark:text-white/25">
              {loan.termMonths - loan.paidMonths} months left
            </span>
          </div>
        </div>

        {/* Detail rows */}
        <div className={cn(
          'rounded-xl border divide-y overflow-hidden mb-5',
          'border-stone-100 dark:border-white/[0.06]',
          'divide-stone-100 dark:divide-white/[0.06]'
        )}>
          {details.map(d => (
            <div key={d.label}
              className="flex items-center justify-between px-4 py-3 gap-4 bg-white dark:bg-white/[0.01]">
              <span className="text-[11px] text-stone-400 dark:text-white/30 shrink-0">{d.label}</span>
              <span className="text-[12px] font-mono text-stone-700 dark:text-white/65 text-right truncate">
                {d.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button className="w-full py-3.5 rounded-xl text-[13px] font-bold transition-colors
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
            Make a payment
          </button>
          <button className={cn(
            'w-full py-3 rounded-xl text-[13px] font-bold transition-colors border',
            'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
            'text-stone-600 dark:text-white/50 hover:text-stone-900 dark:hover:text-white'
          )}>
            View repayment schedule
          </button>
          {loan.status === 'overdue' && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl
              bg-red-50 dark:bg-red-500/[0.08] border border-red-100 dark:border-red-500/[0.15]">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-500 dark:text-red-400">
                This loan is overdue. Please make a payment to avoid late fees and credit impact.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOAN CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

const LoanCalculator = ({ product, onApply }: {
  product: LoanProduct;
  onApply: (amount: number, term: number, rate: number) => void;
}) => {
  const [amount, setAmount] = useState(Math.round((product.minAmt + product.maxAmt) / 4));
  const [term,   setTerm]   = useState(Math.min(12, product.maxTerm));
  const midRate = (product.minRate + product.maxRate) / 2;

  const monthly   = calcMonthly(amount, midRate, term);
  const total     = monthly * term;
  const interest  = total - amount;

  const TERM_PRESETS = product.maxTerm >= 36
    ? [6, 12, 24, 36, product.maxTerm > 36 ? 60 : null].filter(Boolean) as number[]
    : [3, 6, 9, 12].filter(n => n <= product.maxTerm);

  return (
    <div className={cn(
      'rounded-2xl border p-4 lg:p-5',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-4
        text-stone-400 dark:text-white/25">
        Loan calculator
      </p>

      {/* Amount slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-stone-500 dark:text-white/40">Amount</p>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
            style={{ fontSize: '18px', letterSpacing: '-0.2px' }}>
            {fmtCurrency(amount)}
          </p>
        </div>
        <input
          type="range"
          min={product.minAmt}
          max={product.maxAmt}
          step={product.maxAmt >= 10000 ? 500 : 100}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-stone-200 dark:bg-white/[0.08]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#C9A84C]
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:shadow-[#C9A84C]/30
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#C9A84C]
            [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, #C9A84C ${((amount - product.minAmt) / (product.maxAmt - product.minAmt)) * 100}%, var(--track-bg, #e7e5e4) ${((amount - product.minAmt) / (product.maxAmt - product.minAmt)) * 100}%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
            {fmtCurrency(product.minAmt)}
          </span>
          <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
            {fmtCurrency(product.maxAmt)}
          </span>
        </div>
      </div>

      {/* Term selector */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-stone-500 dark:text-white/40">Term</p>
          <p className="text-[13px] font-bold font-mono text-stone-800 dark:text-white/80">
            {term} months
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TERM_PRESETS.map(t => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono border transition-all',
                term === t
                  ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C]'
                  : cn(
                      'bg-stone-50 dark:bg-white/[0.02]',
                      'border-stone-200 dark:border-white/[0.07]',
                      'text-stone-500 dark:text-white/35',
                      'hover:border-[#C9A84C]/30 hover:text-[#C9A84C]/80'
                    )
              )}
            >
              {t}mo
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className={cn(
        'rounded-xl border p-4 mb-4',
        'bg-stone-50 dark:bg-white/[0.02]',
        'border-stone-100 dark:border-white/[0.06]'
      )}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Monthly',  value: fmtCurrency(monthly),  accent: true },
            { label: 'Total',    value: fmtCurrency(total),     accent: false },
            { label: 'Interest', value: fmtCurrency(interest),  accent: false },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
                text-stone-400 dark:text-white/25">
                {m.label}
              </p>
              <p className={cn(
                'font-mono font-bold text-[13px] tabular-nums',
                m.accent ? 'text-[#C9A84C]' : 'text-stone-700 dark:text-white/65'
              )}>
                {m.value}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-200 dark:border-white/[0.06] pt-3">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-stone-400 dark:text-white/25">Est. rate</span>
            <span className="text-stone-500 dark:text-white/40">
              {product.minRate}–{product.maxRate}% p.a.
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Info size={10} className="text-stone-300 dark:text-white/20 shrink-0" />
            <span className="text-[10px] text-stone-300 dark:text-white/20">
              Final rate depends on your credit profile
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onApply(amount, term, midRate)}
        className="w-full py-3.5 rounded-xl text-[13px] font-bold transition-all
          bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]
          shadow-md shadow-[#C9A84C]/20 active:scale-[0.99]"
      >
        Apply now →
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────

const ProductCard = ({ product, selected, onSelect }: {
  product: LoanProduct;
  selected: boolean;
  onSelect: () => void;
}) => {
  const Icon = product.icon;
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative rounded-2xl border p-4 cursor-pointer transition-all',
        selected
          ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/30 dark:border-[#C9A84C]/25 ring-1 ring-[#C9A84C]/20'
          : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07] hover:border-stone-300 dark:hover:border-white/[0.14]'
      )}
    >
      {product.popular && (
        <span className="absolute top-3 right-3 text-[9px] font-bold tracking-[0.12em] uppercase
          text-[#C9A84C] bg-[#C9A84C]/12 px-2 py-0.5 rounded-full border border-[#C9A84C]/20">
          Popular
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          selected
            ? 'bg-[#C9A84C]/20 dark:bg-[#C9A84C]/[0.15]'
            : 'bg-stone-100 dark:bg-white/[0.06]'
        )}>
          <Icon size={15} className={selected ? 'text-[#C9A84C]' : 'text-stone-500 dark:text-white/40'} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white leading-none">
            {product.name}
          </p>
          <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5">{product.sub}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-0.5
            text-stone-300 dark:text-white/20">
            Rate from
          </p>
          <p className="text-[15px] font-bold font-mono text-stone-800 dark:text-white/80">
            {product.minRate}%
            <span className="text-[11px] font-medium text-stone-400 dark:text-white/30 ml-0.5">p.a.</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-0.5
            text-stone-300 dark:text-white/20">
            Up to
          </p>
          <p className="text-[15px] font-bold font-mono text-stone-800 dark:text-white/80">
            {fmtCurrency(product.maxAmt)}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        {product.features.map(f => (
          <div key={f} className="flex items-center gap-2">
            <CheckCircle2 size={11} className={selected ? 'text-[#C9A84C]' : 'text-stone-300 dark:text-white/20'} />
            <span className="text-[11px] text-stone-500 dark:text-white/40">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY MODAL
// ─────────────────────────────────────────────────────────────────────────────

type ApplyStep = 'details' | 'docs' | 'review' | 'submitted';

const ApplyModal = ({ product, amount, term, rate, onClose }: {
  product: LoanProduct;
  amount: number;
  term: number;
  rate: number;
  onClose: () => void;
}) => {
  const [step, setStep] = useState<ApplyStep>('details');
  const monthly = calcMonthly(amount, rate, term);

  const steps: { id: ApplyStep; label: string }[] = [
    { id: 'details',   label: 'Details'   },
    { id: 'docs',      label: 'Documents' },
    { id: 'review',    label: 'Review'    },
    { id: 'submitted', label: 'Done'      },
  ];
  const stepIdx = steps.findIndex(s => s.id === step);

  if (step === 'submitted') {
    return (
      <>
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-x-4 bottom-4 top-4 z-[160] flex items-center justify-center
          lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
          lg:w-[480px] lg:max-h-[85vh]">
          <div className={cn(
            'w-full rounded-2xl border p-8 text-center',
            'bg-white dark:bg-[#161618]',
            'border-stone-200 dark:border-white/[0.08]',
            'shadow-2xl shadow-black/20 dark:shadow-black/60'
          )}>
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10
              flex items-center justify-center mx-auto mb-5
              ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2
              text-stone-400 dark:text-white/25">
              Application submitted
            </p>
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1"
              style={{ fontSize: '26px', letterSpacing: '-0.4px' }}>
              Under review
            </p>
            <p className="text-[13px] text-stone-400 dark:text-white/30 mb-6">
              We'll update you within 24 hours. Reference:{' '}
              <span className="font-mono text-stone-600 dark:text-white/50">
                APP-{Math.random().toString(36).slice(2, 8).toUpperCase()}
              </span>
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl text-[13px] font-bold
                bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] transition-colors"
            >
              Back to loans
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={cn(
          'fixed z-[160]',
          '[&::-webkit-scrollbar]:hidden',
          // Mobile: full bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl',
          'bg-white dark:bg-[#161618]',
          'border-t border-stone-200 dark:border-white/[0.08]',
          'shadow-2xl shadow-black/20',
          'max-h-[92vh] overflow-y-auto',
          // Desktop: centered modal
          'lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2',
          'lg:w-[520px] lg:rounded-2xl lg:border',
          'lg:max-h-[88vh]'
        )}>
        {/* Handle (mobile) */}
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10]
          mx-auto mt-3 mb-1 lg:hidden" />

        <div className="p-5 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5
                text-stone-400 dark:text-white/25">
                {product.name}
              </p>
              <p className="text-[15px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white">
                Loan application
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
              <X size={16} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-6">
            {steps.filter(s => s.id !== 'submitted').map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0 transition-all',
                  i < stepIdx ? 'bg-[#C9A84C] text-[#0C0C0D]'
                    : i === stepIdx ? 'bg-[#C9A84C] text-[#0C0C0D] ring-2 ring-[#C9A84C]/30'
                    : 'bg-stone-100 dark:bg-white/[0.06] text-stone-400 dark:text-white/25'
                )}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className={cn(
                  'text-[10px] font-bold ml-1.5 hidden sm:block transition-colors',
                  i === stepIdx ? 'text-stone-800 dark:text-white/80' : 'text-stone-300 dark:text-white/20'
                )}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={cn(
                    'flex-1 h-px mx-2',
                    i < stepIdx
                      ? 'bg-[#C9A84C]/40'
                      : 'bg-stone-200 dark:bg-white/[0.08]'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 'details' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className={cn(
                'rounded-xl border p-4',
                'bg-[#C9A84C]/[0.05] dark:bg-[#C9A84C]/[0.07]',
                'border-[#C9A84C]/15'
              )}>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Amount',  value: fmtCurrency(amount) },
                    { label: 'Monthly', value: fmtCurrency(monthly) },
                    { label: 'Term',    value: `${term}mo` },
                  ].map(m => (
                    <div key={m.label}>
                      <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1
                        text-stone-400 dark:text-white/25">{m.label}</p>
                      <p className="text-[14px] font-bold font-mono text-[#C9A84C]">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {[
                { label: 'Full name',       placeholder: 'Victor Okafor',          type: 'text' },
                { label: 'Email address',   placeholder: 'victor@example.com',     type: 'email' },
                { label: 'Phone number',    placeholder: '+234 800 000 0000',       type: 'tel' },
                { label: 'Monthly income',  placeholder: '$4,500.00',              type: 'text' },
                { label: 'Employment status', placeholder: 'Self-employed',        type: 'text' },
              ].map(f => (
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
              <button
                onClick={() => setStep('docs')}
                className="w-full py-3.5 rounded-xl text-[13px] font-bold transition-all
                  bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
                Continue →
              </button>
            </div>
          )}

          {step === 'docs' && (
            <div className="space-y-4">
              <p className="text-[12px] text-stone-500 dark:text-white/40">
                Upload required documents to verify your identity and income.
              </p>
              {[
                { label: 'Government ID',       sub: 'Passport, NIN, or driver\'s license', done: false },
                { label: 'Proof of income',      sub: 'Last 3 months bank statements',       done: false },
                { label: 'Proof of address',     sub: 'Utility bill or bank letter',         done: true  },
              ].map(d => (
                <div key={d.label} className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
                  d.done
                    ? 'bg-emerald-50 dark:bg-emerald-500/[0.06] border-emerald-200 dark:border-emerald-500/[0.15]'
                    : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07] hover:border-stone-300'
                )}>
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    d.done ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-stone-100 dark:bg-white/[0.06]'
                  )}>
                    {d.done
                      ? <CheckCircle2 size={15} className="text-emerald-500" />
                      : <FileText size={15} className="text-stone-400 dark:text-white/30" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-stone-800 dark:text-white/80">{d.label}</p>
                    <p className="text-[10px] text-stone-400 dark:text-white/25 truncate">{d.sub}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold shrink-0',
                    d.done ? 'text-emerald-500' : 'text-[#C9A84C]'
                  )}>
                    {d.done ? 'Uploaded' : 'Upload'}
                  </span>
                </div>
              ))}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep('details')}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-[13px] font-bold transition-colors border',
                    'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
                    'text-stone-600 dark:text-white/50'
                  )}>
                  Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 py-3 rounded-xl text-[13px] font-bold transition-all
                    bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div className={cn(
                'rounded-xl border divide-y overflow-hidden',
                'border-stone-100 dark:border-white/[0.06]',
                'divide-stone-100 dark:divide-white/[0.06]'
              )}>
                {[
                  { label: 'Product',     value: product.name },
                  { label: 'Amount',      value: fmtCurrency(amount) },
                  { label: 'Term',        value: `${term} months` },
                  { label: 'Est. rate',   value: `${rate.toFixed(1)}% p.a.` },
                  { label: 'Monthly due', value: fmtCurrency(monthly) },
                  { label: 'Total cost',  value: fmtCurrency(monthly * term) },
                ].map(r => (
                  <div key={r.label} className="flex justify-between gap-4 px-4 py-3
                    bg-white dark:bg-white/[0.01]">
                    <span className="text-[11px] text-stone-400 dark:text-white/30 shrink-0">{r.label}</span>
                    <span className="text-[12px] font-mono text-stone-700 dark:text-white/65 text-right">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl
                bg-stone-50 dark:bg-white/[0.02] border border-stone-100 dark:border-white/[0.06]">
                <Shield size={13} className="text-stone-300 dark:text-white/20 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-400 dark:text-white/30">
                  By submitting you agree to our loan terms, privacy policy, and credit check consent.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep('docs')}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-[13px] font-bold transition-colors border',
                    'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
                    'text-stone-600 dark:text-white/50'
                  )}>
                  Back
                </button>
                <button
                  onClick={() => setStep('submitted')}
                  className="flex-1 py-3 rounded-xl text-[13px] font-bold transition-all
                    bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]">
                  Submit application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REPAYMENT SCHEDULE TABLE
// ─────────────────────────────────────────────────────────────────────────────

const RepaymentSchedule = ({ loanId }: { loanId: string }) => {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? REPAYMENT_SCHEDULE : REPAYMENT_SCHEDULE.slice(0, 4);

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b
        border-stone-100 dark:border-white/[0.05]">
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase
          text-stone-400 dark:text-white/25">
          Repayment schedule · {loanId}
        </p>
        <span className="text-[10px] font-mono text-stone-400 dark:text-white/25">
          {REPAYMENT_SCHEDULE.length} payments remaining
        </span>
      </div>

      {/* Column headers — hidden on mobile, visible sm+ */}
      <div className="hidden sm:grid sm:grid-cols-5 px-5 py-2 border-b
        border-stone-50 dark:border-white/[0.04]">
        {['Month', 'Date', 'Principal', 'Interest', 'Balance'].map(h => (
          <span key={h} className="text-[9px] font-bold tracking-[0.12em] uppercase
            text-stone-300 dark:text-white/20">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-stone-50 dark:divide-white/[0.03]">
        {rows.map((row, i) => (
          <div key={i} className={cn(
            'px-4 sm:px-5 py-3',
            'hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors',
            row.status === 'due' && 'bg-[#C9A84C]/[0.03] dark:bg-[#C9A84C]/[0.05]'
          )}>
            {/* Mobile: compact 2-row layout */}
            <div className="sm:hidden flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-bold text-stone-800 dark:text-white/80 font-mono">
                    {row.date}
                  </span>
                  {row.status === 'due' && (
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full
                      text-[#C9A84C] bg-[#C9A84C]/10">
                      Due
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-stone-400 dark:text-white/25">
                  P: ${row.principal} · I: ${row.interest.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-mono font-bold text-stone-800 dark:text-white/80">
                  ${(row.principal + row.interest).toFixed(2)}
                </p>
                <p className="text-[10px] font-mono text-stone-300 dark:text-white/20">
                  bal ${row.balance > 0 ? row.balance.toFixed(0) : '0'}
                </p>
              </div>
            </div>

            {/* Desktop: 5-column grid */}
            <div className="hidden sm:grid sm:grid-cols-5 items-center">
              <span className="text-[12px] font-mono text-stone-500 dark:text-white/40">
                {String(row.month).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono text-stone-700 dark:text-white/65">
                  {row.date}
                </span>
                {row.status === 'due' && (
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full
                    text-[#C9A84C] bg-[#C9A84C]/10">
                    Due
                  </span>
                )}
              </div>
              <span className="text-[12px] font-mono text-stone-700 dark:text-white/65">
                ${row.principal}
              </span>
              <span className="text-[12px] font-mono text-stone-400 dark:text-white/30">
                ${row.interest.toFixed(2)}
              </span>
              <span className="text-[12px] font-mono text-stone-500 dark:text-white/40">
                ${row.balance > 0 ? row.balance.toFixed(0) : '0'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Expand toggle */}
      {REPAYMENT_SCHEDULE.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-3 border-t
            border-stone-100 dark:border-white/[0.05]
            text-[11px] font-bold transition-colors
            text-stone-400 dark:text-white/25
            hover:text-[#C9A84C] hover:bg-stone-50 dark:hover:bg-white/[0.02]"
        >
          {expanded ? 'Show less' : `Show all ${REPAYMENT_SCHEDULE.length} payments`}
          <ChevronDown size={13} className={cn('transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ELIGIBILITY STRIP
// ─────────────────────────────────────────────────────────────────────────────

const EligibilityStrip = () => {
  const checks = [
    { label: 'Account verified',   done: true  },
    { label: 'KYC complete',       done: true  },
    { label: 'Active for 3+ months', done: true },
    { label: 'No defaults',        done: true  },
    { label: 'Min balance $100',   done: false },
  ];
  const passCount = checks.filter(c => c.done).length;
  const score     = Math.round((passCount / checks.length) * 100);

  return (
    <div className={cn(
      'rounded-2xl border p-4 sm:p-5',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
            text-stone-400 dark:text-white/25">
            Eligibility score
          </p>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
            style={{ fontSize: '26px', letterSpacing: '-0.3px' }}>
            {score}
            <span className="text-[14px] font-sans font-normal text-stone-400 dark:text-white/30 ml-0.5">
              / 100
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-1
            text-stone-300 dark:text-white/20">
            Status
          </p>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full
            text-[#C9A84C] bg-[#C9A84C]/10">
            Pre-qualified
          </span>
        </div>
      </div>

      <ProgressBar value={score} />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-2">
            {c.done
              ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              : <AlertCircle  size={13} className="text-red-400 shrink-0" />
            }
            <span className={cn(
              'text-[11px]',
              c.done ? 'text-stone-600 dark:text-white/50' : 'text-red-400'
            )}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const LoansPage = () => {
  const [selectedLoan,    setSelectedLoan]    = useState<Loan | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct>(LOAN_PRODUCTS[0]);
  const [applyData,       setApplyData]       = useState<{ amount: number; term: number; rate: number } | null>(null);

  const totalOutstanding = ACTIVE_LOANS.reduce((s, l) => s + l.balance, 0);
  const totalMonthly     = ACTIVE_LOANS.reduce((s, l) => s + l.monthlyDue, 0);
  const hasOverdue       = ACTIVE_LOANS.some(l => l.status === 'overdue');

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Credit & lending
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Loans
        </h1>
      </div>

      {/* Overdue alert */}
      {hasOverdue && (
        <div className="flex items-start gap-3 p-4 rounded-2xl mb-6
          bg-red-50 dark:bg-red-500/[0.07]
          border border-red-200 dark:border-red-500/[0.18]">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-red-600 dark:text-red-400 leading-none mb-0.5">
              Overdue payment detected
            </p>
            <p className="text-[11px] text-red-400/80 dark:text-red-400/70">
              Loan L002 is past due. Make a payment to avoid late fees and credit score impact.
            </p>
          </div>
          <button className="text-[11px] font-bold text-red-500 dark:text-red-400
            hover:text-red-600 dark:hover:text-red-300 transition-colors shrink-0">
            Pay now
          </button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        <div className={cn(
          'rounded-2xl border p-4 flex flex-col gap-2.5 col-span-2 sm:col-span-1',
          'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08]',
          'border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
        )}>
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-stone-400 dark:text-white/25">
            Total outstanding
          </p>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none"
            style={{ fontSize: 'clamp(18px, 4vw, 24px)', letterSpacing: '-0.3px' }}>
            {fmtCurrency(totalOutstanding)}
          </p>
          <p className="text-[10px] font-mono text-stone-400 dark:text-white/30">
            across {ACTIVE_LOANS.length} loans
          </p>
        </div>
        {[
          { label: 'Monthly due',   value: fmtCurrency(totalMonthly), sub: 'next 30 days' },
          { label: 'Active loans',  value: String(ACTIVE_LOANS.length), sub: '1 overdue'  },
          { label: 'Credit score',  value: '720',  sub: 'Good standing'                    },
        ].map(s => (
          <div key={s.label} className={cn(
            'rounded-2xl border p-4 flex flex-col gap-2.5',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-stone-400 dark:text-white/25">
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

      {/* Active loans */}
      <SectionRule label="Active loans" action={{ text: 'View all' }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8 lg:mb-10">
        {ACTIVE_LOANS.map(loan => (
          <LoanCard key={loan.id} loan={loan} onSelect={setSelectedLoan} />
        ))}
      </div>

      {/* Repayment schedule */}
      <SectionRule label="Repayment schedule" />
      <div className="mb-8 lg:mb-10">
        <RepaymentSchedule loanId="L001" />
      </div>

      {/* Two-col layout: products + right panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8">

        {/* Left: product selector + calculator */}
        <div>
          <SectionRule label="Apply for a loan" />

          {/* Product cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {LOAN_PRODUCTS.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                selected={selectedProduct.id === p.id}
                onSelect={() => setSelectedProduct(p)}
              />
            ))}
          </div>

          {/* Calculator */}
          <LoanCalculator
            product={selectedProduct}
            onApply={(amount, term, rate) => setApplyData({ amount, term, rate })}
          />
        </div>

        {/* Right: eligibility + info */}
        <div className="space-y-5">
          <div>
            <SectionRule label="Your eligibility" />
            <EligibilityStrip />
          </div>

          <div>
            <SectionRule label="Why Stonegate credit" />
            <div className="space-y-2.5">
              {[
                { icon: Zap,    title: 'Instant approval',   sub: 'Decision in under 60 seconds'    },
                { icon: Shield, title: 'Secure & regulated', sub: 'Licensed lender, transparent fees' },
                { icon: Clock,  title: 'Flexible terms',     sub: 'Choose 3 to 60 month repayments'  },
                { icon: Percent,title: 'Competitive rates',  sub: 'Starting from 6% per annum'       },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className={cn(
                  'flex items-start gap-3 p-3.5 rounded-xl border',
                  'bg-white dark:bg-white/[0.02]',
                  'border-stone-200 dark:border-white/[0.07]'
                )}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08]">
                    <Icon size={14} className="text-[#C9A84C]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold leading-none tracking-[-0.2px]
                      text-stone-800 dark:text-white/80">
                      {title}
                    </p>
                    <p className="text-[11px] mt-1 text-stone-400 dark:text-white/30">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom clearance */}
      <div className="h-24 lg:h-12" />

      {/* Loan detail sheet */}
      {selectedLoan && (
        <LoanDetailSheet loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
      )}

      {/* Apply modal */}
      {applyData && (
        <ApplyModal
          product={selectedProduct}
          amount={applyData.amount}
          term={applyData.term}
          rate={applyData.rate}
          onClose={() => setApplyData(null)}
        />
      )}
    </div>
  );
};

export default LoansPage;