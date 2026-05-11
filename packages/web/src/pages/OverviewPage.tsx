import { useState, useEffect, useMemo } from 'react';
import { BalanceHero } from '../components/BalanceHero';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getFlag, CURRENCY_SYMBOLS } from '../lib/utils';
import { useTransactions } from '../hooks/useTransactions';
import { useFxRates } from '../hooks/useFxRates';
import { getRate } from '../lib/api/fx';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Transaction, Beneficiary } from '../lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RULE
// ─────────────────────────────────────────────────────────────────────────────
const SectionRule = ({
  label,
  action,
}: {
  label: string;
  action?: { text: string; onClick?: () => void };
}) => (
  <div className="flex items-center gap-4 mb-5 lg:mb-6">
    <span className="text-[9px] font-bold tracking-[0.2em] uppercase shrink-0
      text-stone-400 dark:text-white/25">
      {label}
    </span>
    <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
    {action && (
      <button
        onClick={action.onClick}
        className="text-[10px] font-bold tracking-[0.12em] uppercase shrink-0 transition-colors
          text-[#C9A84C]/70 hover:text-[#C9A84C]"
      >
        {action.text}
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO CHART
// ─────────────────────────────────────────────────────────────────────────────
const CHART_PERIODS = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;
type Period = (typeof CHART_PERIODS)[number];

const CHART_DATA: Record<Period, number[]> = {
  '1W':  [98, 102, 99, 104, 101, 107, 106],
  '1M':  [88, 91, 89, 94, 97, 93, 99, 102, 98, 104, 101, 107, 106, 110, 108, 113, 111, 116, 114, 119, 117, 121, 118, 123, 120, 125, 122, 127, 124, 130],
  '3M':  [75, 79, 77, 83, 80, 87, 84, 90, 88, 94, 91, 98, 95, 101, 99, 105, 103, 108, 106, 112, 110, 115, 113, 118, 116, 121, 119, 124, 122, 127, 125, 130, 128, 133, 131, 136, 134, 138, 136, 140, 138, 143, 141, 146, 144, 148, 146, 150, 148, 153, 151, 155, 153, 157, 155, 159, 157, 161, 159, 163, 161, 165, 163, 167, 165, 168, 167, 170, 168, 172, 171, 174, 172, 176, 174, 177, 176, 179, 177, 181, 179, 183, 181, 185, 183, 186, 184, 188, 186, 189],
  '6M':  Array.from({ length: 120 }, (_, i) => 70 + i * 0.8 + Math.sin(i * 0.3) * 8),
  '1Y':  Array.from({ length: 180 }, (_, i) => 60 + i * 0.6 + Math.sin(i * 0.2) * 10),
  'ALL': Array.from({ length: 240 }, (_, i) => 40 + i * 0.55 + Math.sin(i * 0.15) * 14),
};

const PortfolioChart = () => {
  const [period, setPeriod]   = useState<Period>('1M');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = CHART_DATA[period];
  const W = 800, H = 160;
  const pad = { t: 10, b: 20, l: 0, r: 0 };
  const iW  = W - pad.l - pad.r;
  const iH  = H - pad.t - pad.b;

  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => pad.l + (i / (data.length - 1)) * iW;
  const toY = (v: number) => pad.t + iH - ((v - min) / range) * iH;

  const pts      = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPath = `M${toX(0)},${H} ` +
    data.map((v, i) => `L${toX(i)},${toY(v)}`).join(' ') +
    ` L${toX(data.length - 1)},${H} Z`;

  const lastVal   = data[data.length - 1];
  const firstVal  = data[0];
  const pctChange = (((lastVal - firstVal) / firstVal) * 100).toFixed(2);
  const isUp      = lastVal >= firstVal;

  const hoverVal = hoverIdx !== null ? data[hoverIdx] : lastVal;
  const hoverX   = hoverIdx !== null ? toX(hoverIdx) : null;
  const hoverY   = hoverIdx !== null ? toY(data[hoverIdx]) : null;

  // Shared interaction handler — works for both mouse and touch
  const handleInteraction = (clientX: number, rect: DOMRect) => {
    const x   = ((clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((x - pad.l) / iW) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  return (
    <div className={cn(
      'rounded-2xl border p-4 lg:p-6 mb-8 lg:mb-14',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      {/* Header — stacks on mobile, row on desktop */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-start sm:justify-between lg:mb-6">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5
            text-stone-400 dark:text-white/25">
            Portfolio value
          </p>
          <div className="flex items-baseline gap-3">
            <span
              className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
              style={{ fontSize: 'clamp(22px, 5vw, 28px)', letterSpacing: '-0.5px' }}
            >
              ${hoverVal.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={cn(
              'flex items-center gap-1 text-[11px] font-mono',
              isUp ? 'text-emerald-500' : 'text-red-400'
            )}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}{pctChange}%
            </span>
          </div>
        </div>

        {/* Period selector — scrollable on very small screens */}
        <div className="flex gap-0.5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto
          bg-stone-100 dark:bg-white/[0.04]
          border border-stone-200 dark:border-white/[0.06]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CHART_PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setHoverIdx(null); }}
              className={cn(
                'flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg shrink-0',
                'text-[11px] font-bold font-mono transition-all whitespace-nowrap',
                period === p
                  ? 'bg-[#C9A84C] text-[#0C0C0D] shadow-sm'
                  : 'text-stone-500 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/55'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SVG chart — touch + mouse interactive */}
      <div className="relative select-none touch-none">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 'clamp(100px, 25vw, 160px)' }}
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => handleInteraction(e.clientX, e.currentTarget.getBoundingClientRect())}
          onTouchMove={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            handleInteraction(t.clientX, e.currentTarget.getBoundingClientRect());
          }}
          onTouchEnd={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={isUp ? '#C9A84C' : '#f87171'} stopOpacity="0.18" />
              <stop offset="100%" stopColor={isUp ? '#C9A84C' : '#f87171'} stopOpacity="0"    />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#area-grad)" />
          <polyline points={pts} fill="none"
            stroke={isUp ? '#C9A84C' : '#f87171'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {hoverX !== null && hoverY !== null && (
            <>
              <line x1={hoverX} y1={pad.t} x2={hoverX} y2={H - pad.b}
                stroke={isUp ? '#C9A84C' : '#f87171'}
                strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              <circle cx={hoverX} cy={hoverY} r="4"
                fill={isUp ? '#C9A84C' : '#f87171'} />
              <circle cx={hoverX} cy={hoverY} r="8"
                fill={isUp ? '#C9A84C' : '#f87171'} opacity="0.2" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARDS
// ─────────────────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  up?: boolean;
  accent?: boolean;
}

const StatCard = ({ label, value, sub, up, accent }: StatCardProps) => (
  <div className={cn(
    'rounded-2xl border p-4 lg:p-5 flex flex-col gap-2.5 lg:gap-3 transition-all hover:shadow-sm',
    accent
      ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
      : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07]'
  )}>
    <p className="text-[9px] font-bold tracking-[0.18em] uppercase
      text-stone-400 dark:text-white/25">
      {label}
    </p>
    <p
      className="font-['DM_Serif_Display',_Georgia,_serif] font-normal leading-none
        text-stone-900 dark:text-white"
      style={{ fontSize: 'clamp(18px, 4vw, 24px)', letterSpacing: '-0.3px' }}
    >
      {value}
    </p>
    <div className="flex items-center gap-1.5">
      {up !== undefined && (
        up
          ? <TrendingUp   size={10} className="text-emerald-500 shrink-0" />
          : <TrendingDown size={10} className="text-red-400 shrink-0" />
      )}
      <span className={cn(
        'text-[10px] lg:text-[11px] font-mono leading-snug',
        up === undefined
          ? 'text-stone-400 dark:text-white/30'
          : up ? 'text-emerald-500' : 'text-red-400'
      )}>
        {sub}
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// RECENT TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────
interface Tx {
  id: string;
  icon: 'up' | 'down' | 'swap';
  title: string;
  sub: string;
  amount: string;
  isCredit: boolean;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}


const STATUS_STYLES = {
  completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  pending:   'text-[#C9A84C] bg-[#C9A84C]/10',
  failed:    'text-red-400 bg-red-50 dark:bg-red-500/10',
};

const TxRow = ({ tx }: { tx: Tx }) => {
  const Icon   = tx.icon === 'up' ? ArrowUpRight : tx.icon === 'down' ? ArrowDownLeft : ArrowLeftRight;
  const iconBg = tx.icon === 'up'
    ? 'bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08] text-[#C9A84C]'
    : tx.icon === 'down'
    ? 'bg-emerald-50 dark:bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400'
    : 'bg-sky-50 dark:bg-sky-500/[0.08] text-sky-500 dark:text-sky-400';

  return (
    <div className="flex items-center gap-3 py-3 lg:py-3.5
      border-b border-stone-100 dark:border-white/[0.04] last:border-0
      hover:bg-stone-50 dark:hover:bg-white/[0.02]
      -mx-2 px-2 rounded-xl transition-colors cursor-pointer group">

      {/* Icon */}
      <div className={cn('w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon size={13} />
      </div>

      {/* Details — title truncates on narrow screens */}
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] lg:text-[13px] font-semibold leading-none tracking-[-0.2px] truncate
          text-stone-800 dark:text-white/80">
          {tx.title}
        </p>
        <p className="text-[10px] lg:text-[11px] mt-0.5 truncate
          text-stone-400 dark:text-white/25">
          {tx.sub}
        </p>
      </div>

      {/* Status — hidden on mobile unless pending/failed */}
      <span className={cn(
        'text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full shrink-0 transition-opacity',
        'hidden lg:inline-flex',
        STATUS_STYLES[tx.status],
        tx.status === 'completed' ? 'lg:opacity-0 lg:group-hover:opacity-100' : 'lg:opacity-100',
        // On mobile show only non-completed
        tx.status !== 'completed' ? '!inline-flex' : ''
      )}>
        {tx.status}
      </span>

      {/* Amount + time */}
      <div className="text-right shrink-0">
        <p className={cn(
          'text-[12.5px] lg:text-[13px] font-mono font-medium tabular-nums leading-none',
          tx.isCredit
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-stone-700 dark:text-white/65'
        )}>
          {tx.amount}
        </p>
        <p className="text-[10px] font-mono mt-0.5 text-stone-300 dark:text-white/20">{tx.time}</p>
      </div>

      <ChevronRight size={12}
        className="text-stone-200 dark:text-white/15 shrink-0
          group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors
          hidden sm:block" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SPENDING DONUT
// ─────────────────────────────────────────────────────────────────────────────
const SPEND_COLORS = ['#C9A84C', '#60a5fa', '#34d399', '#a78bfa', '#94a3b8'];

function buildSpendData(txs: Transaction[]): { label: string; value: number; color: string }[] {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const debits = txs.filter(t =>
    (t.type === 'transfer_out' || t.type === 'withdrawal' || t.type === 'swap') &&
    new Date(t.created_at) >= start
  );
  const totals: Record<string, number> = {};
  for (const t of debits) {
    const label = t.type === 'swap' ? 'FX swaps'
      : t.type === 'withdrawal'    ? 'Withdrawals'
      : 'Transfers';
    totals[label] = (totals[label] ?? 0) + (t.from_amount ?? 0);
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return entries.slice(0, 5).map(([label, v], i) => ({
    label,
    value: Math.round((v / total) * 100),
    color: SPEND_COLORS[i] ?? '#94a3b8',
  }));
}

const SpendDonut = ({ txs, totalUSD }: { txs: Transaction[]; totalUSD: number }) => {
  const data  = useMemo(() => buildSpendData(txs), [txs]);
  const R = 54, cx = 70, cy = 70, stroke = 16;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  const isEmpty = data.length === 0;
  const displayData = isEmpty
    ? [{ label: 'No spending', value: 100, color: '#e7e5e4' }]
    : data;

  return (
    <div className={cn(
      'rounded-2xl border p-4 lg:p-6',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-4
        text-stone-400 dark:text-white/25">
        Spending this month
      </p>
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="shrink-0">
          <svg width="120" height="120" viewBox="0 0 140 140" className="w-[100px] h-[100px] lg:w-[120px] lg:h-[120px]">
            <circle cx={cx} cy={cy} r={R} fill="none" strokeWidth={stroke}
              className="stroke-stone-100 dark:stroke-white/[0.04]" />
            {displayData.map((seg, i) => {
              const dash   = (seg.value / 100) * circ;
              const gap    = circ - dash;
              const rotate = (offset / 100) * 360 - 90;
              offset += seg.value;
              return (
                <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                  stroke={seg.color} strokeWidth={stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  style={{ transform: `rotate(${rotate}deg)`, transformOrigin: `${cx}px ${cy}px` }}
                  strokeLinecap="butt" />
              );
            })}
            <text x={cx} y={cy - 7} textAnchor="middle" fontSize="10" className="fill-stone-400 dark:fill-white/30">Total</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fontSize="14" className="fill-stone-900 dark:fill-white font-mono" fontFamily="'DM Mono', monospace">
              ${totalUSD.toLocaleString('en', { maximumFractionDigits: 0 })}
            </text>
          </svg>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {isEmpty ? (
            <p className="text-[11px] text-stone-400 dark:text-white/25">No spending this month</p>
          ) : data.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-[11px] lg:text-[12px] flex-1 truncate text-stone-600 dark:text-white/50">
                {seg.label}
              </span>
              <span className="text-[11px] lg:text-[12px] font-mono shrink-0 text-stone-500 dark:text-white/40">
                {seg.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QUICK SEND — live beneficiaries
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'from-sky-500 to-blue-600', 'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

function makeInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}
function colorFor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const QuickSend = ({ beneficiaries }: { beneficiaries: Beneficiary[] }) => (
  <div className={cn(
    'rounded-2xl border p-4 lg:p-5',
    'bg-white dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.07]'
  )}>
    <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-4 lg:mb-5
      text-stone-400 dark:text-white/25">
      Quick send
    </p>
    <div
      className="flex items-center gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <button className="flex flex-col items-center gap-2 shrink-0 group">
        <div className={cn(
          'w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center transition-colors',
          'border-2 border-dashed border-stone-200 dark:border-white/[0.10]',
          'text-stone-300 dark:text-white/20',
          'group-hover:border-[#C9A84C]/50 group-hover:text-[#C9A84C]/60'
        )}>
          <span className="text-lg leading-none">+</span>
        </div>
        <span className="text-[10px] font-medium text-stone-400 dark:text-white/25">New</span>
      </button>

      {beneficiaries.slice(0, 6).map((b) => (
        <button key={b.id} className="flex flex-col items-center gap-2 shrink-0 group">
          <div className={cn(
            'w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center',
            'text-white text-[11px] font-bold transition-all shadow-sm',
            `bg-gradient-to-br ${colorFor(b.id)}`,
            'group-hover:scale-105 group-active:scale-95'
          )}>
            {makeInitials(b.name)}
          </div>
          <span className="text-[10px] font-medium text-stone-500 dark:text-white/35">
            {b.name.split(' ')[0]}
          </span>
        </button>
      ))}

      {beneficiaries.length === 0 && (
        <p className="text-[11px] text-stone-400 dark:text-white/25 ml-1">
          Add beneficiaries to quick-send
        </p>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LIVE TX → UI ADAPTER
// ─────────────────────────────────────────────────────────────────────────────
function adaptTx(tx: Transaction): Tx {
  const isCredit = tx.type === 'transfer_in' || tx.type === 'deposit';
  const icon: Tx['icon'] = tx.type === 'swap' ? 'swap' : isCredit ? 'down' : 'up';

  const currency = tx.from_currency ?? tx.to_currency ?? 'USD';
  const amount   = tx.from_amount ?? tx.to_amount ?? 0;
  const sym      = CURRENCY_SYMBOLS[currency] ?? currency;

  const title = tx.type === 'swap'
    ? `${tx.from_currency ?? '?'} → ${tx.to_currency ?? '?'} conversion`
    : tx.type === 'transfer_out'
    ? `Sent to ${tx.recipient_name ?? 'recipient'}`
    : tx.description ?? 'Transaction';

  const sub = tx.type === 'swap'
    ? `FX conversion · ${tx.from_currency}/${tx.to_currency}`
    : tx.recipient_name
    ? `${tx.recipient_name} · ${currency}`
    : currency;

  const amt = isCredit
    ? `+${sym}${Math.abs(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-${sym}${Math.abs(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elapsed = Math.round((Date.now() - new Date(tx.created_at).getTime()) / 60000);
  const timeLabel = elapsed < 1 ? 'Just now' : elapsed < 60 ? `${elapsed}m ago`
    : elapsed < 1440 ? `${Math.round(elapsed / 60)}h ago` : 'Yesterday';

  const uiStatus: 'completed' | 'pending' | 'failed' =
    tx.status === 'completed' ? 'completed' : tx.status === 'failed' ? 'failed' : 'pending';

  return { id: tx.id, icon, title, sub, amount: amt, isCredit, time: timeLabel, status: uiStatus };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LIVE_PAIRS = [
  ['EUR', 'USD'], ['GBP', 'USD'], ['USD', 'JPY'], ['USD', 'CAD'], ['GBP', 'EUR'],
] as const;

const OverviewPage = () => {
  const { user }                             = useAuth();
  const { transactions, loading: txLoading } = useTransactions(20);
  const { rates, loading: ratesLoading }     = useFxRates();
  const [beneficiaries, setBeneficiaries]    = useState<Beneficiary[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setBeneficiaries((data ?? []) as Beneficiary[]));
  }, [user?.id]);

  // Derive stat card values from real transactions
  const totalSent     = transactions.filter(t => t.type === 'transfer_out' || t.type === 'withdrawal').reduce((s, t) => s + (t.from_amount ?? 0), 0);
  const totalReceived = transactions.filter(t => t.type === 'transfer_in'  || t.type === 'deposit').reduce((s, t) => s + (t.to_amount ?? 0), 0);
  const conversions   = transactions.filter(t => t.type === 'swap').length;
  const feesSaved     = transactions.reduce((s, t) => s + (t.fee ?? 0) * 0.7, 0); // vs bank avg

  const liveRates = LIVE_PAIRS.map(([from, to]) => {
    const r   = ratesLoading ? null : getRate(from, to, rates);
    const key = `${from}/${to}`;
    return {
      pair: key,
      rate: r != null ? (r >= 100 ? r.toFixed(2) : r.toFixed(4)) : '…',
      change: '+0.0%',
      up: true,
    };
  });

  return (
    <div className="w-full">

      {/* Balance hero */}
      <BalanceHero />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3 mb-8 lg:mb-14">
        <StatCard label="Total sent"     value={`$${totalSent.toFixed(0)}`}     sub="this account"      up={false} accent />
        <StatCard label="Total received" value={`$${totalReceived.toFixed(0)}`} sub="this account"      up={true}        />
        <StatCard label="Conversions"    value={String(conversions)}            sub="transactions"                       />
        <StatCard label="Fees saved"     value={`$${feesSaved.toFixed(2)}`}     sub="vs bank transfers"                  />
      </div>

      {/* Portfolio chart */}
      <SectionRule label="Portfolio performance" />
      <PortfolioChart />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-5 lg:gap-6 mb-8 lg:mb-14">

        {/* Transactions */}
        <div>
          <SectionRule label="Recent transactions" action={{ text: 'View all' }} />
          <div className={cn(
            'rounded-2xl border overflow-hidden',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <div className="px-3 lg:px-4 py-1.5 lg:py-2">
              {txLoading ? (
                [1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 py-3.5
                    border-b border-stone-100 dark:border-white/[0.04] last:border-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/[0.06] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded bg-stone-100 dark:bg-white/[0.06] animate-pulse" />
                      <div className="h-2.5 w-20 rounded bg-stone-100 dark:bg-white/[0.06] animate-pulse" />
                    </div>
                    <div className="h-3 w-16 rounded bg-stone-100 dark:bg-white/[0.06] animate-pulse" />
                  </div>
                ))
              ) : transactions.length === 0 ? (
                <p className="text-center py-8 text-[12px] text-stone-400 dark:text-white/25">
                  No transactions yet
                </p>
              ) : (
                transactions.slice(0, 6).map(tx => <TxRow key={tx.id} tx={adaptTx(tx)} />)
              )}
            </div>
            <div className="px-4 py-3 border-t border-stone-100 dark:border-white/[0.05]">
              <button className="w-full text-center text-[11px] font-bold uppercase tracking-[0.12em] transition-colors
                text-[#C9A84C]/60 hover:text-[#C9A84C]">
                Load more →
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <QuickSend beneficiaries={beneficiaries} />
          <SpendDonut txs={transactions} totalUSD={totalSent} />
        </div>
      </div>

      {/* FX rates — live */}
      <SectionRule label="Foreign exchange" action={{ text: 'Convert now' }} />
      <div className="mb-24 lg:mb-20">
        <div className={cn(
          'rounded-2xl border overflow-hidden',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          <div className="flex items-center justify-between px-4 lg:px-5 py-3.5 lg:py-4
            border-b border-stone-100 dark:border-white/[0.05]">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase
              text-stone-400 dark:text-white/25">Live FX rates</p>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {ratesLoading ? 'Loading…' : 'Live'}
            </span>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-white/[0.04]">
            {liveRates.map((r) => (
              <div key={r.pair}
                className="flex items-center justify-between px-4 lg:px-5 py-3 lg:py-3.5
                  hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="flex -space-x-1">
                    <img src={getFlag(r.pair.split('/')[0])} alt="" className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white dark:border-[#111] object-cover" />
                    <img src={getFlag(r.pair.split('/')[1])} alt="" className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white dark:border-[#111] object-cover" />
                  </div>
                  <span className="text-[12px] lg:text-[13px] font-bold font-mono tracking-wide text-stone-700 dark:text-white/70">
                    {r.pair}
                  </span>
                </div>
                <div className="flex items-center gap-2 lg:gap-4">
                  <span className="text-[12px] lg:text-[13px] font-mono tabular-nums text-stone-800 dark:text-white/80">
                    {r.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default OverviewPage;