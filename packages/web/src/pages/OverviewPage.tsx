import { useState } from 'react';
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
import { getFlag } from '../lib/utils';

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

const TRANSACTIONS: Tx[] = [
  { id: '1', icon: 'down',  title: 'Received from James O.', sub: 'Wire transfer · USD', amount: '+$1,200.00', isCredit: true,  time: '2m ago',    status: 'completed' },
  { id: '2', icon: 'swap',  title: 'USD → NGN conversion',   sub: 'FX swap · Rate 1,618', amount: '-$500.00', isCredit: false, time: '1h ago',    status: 'completed' },
  { id: '3', icon: 'up',    title: 'Sent to Amina B.',       sub: 'Transfer · GBP',       amount: '-£250.00', isCredit: false, time: '3h ago',    status: 'completed' },
  { id: '4', icon: 'down',  title: 'Received from client',   sub: 'Invoice #4421 · EUR',  amount: '+€3,800',  isCredit: true,  time: 'Yesterday', status: 'completed' },
  { id: '5', icon: 'up',    title: 'Rent payment',           sub: 'Standing order · NGN', amount: '-₦250k',   isCredit: false, time: 'Yesterday', status: 'pending'   },
  { id: '6', icon: 'swap',  title: 'GBP → EUR conversion',   sub: 'FX swap · Rate 1.163', amount: '-£400.00', isCredit: false, time: '2d ago',    status: 'completed' },
];

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
const SPEND_DATA = [
  { label: 'Housing',   value: 35, color: '#C9A84C' },
  { label: 'Food',      value: 20, color: '#60a5fa' },
  { label: 'Transfers', value: 18, color: '#34d399' },
  { label: 'Shopping',  value: 14, color: '#a78bfa' },
  { label: 'Other',     value: 13, color: '#94a3b8' },
];

const SpendDonut = () => {
  const R = 54, cx = 70, cy = 70, stroke = 16;
  const circ = 2 * Math.PI * R;
  let offset = 0;

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
      {/* Donut + legend — side by side always, donut shrinks on mobile */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="shrink-0">
          <svg width="120" height="120" viewBox="0 0 140 140" className="w-[100px] h-[100px] lg:w-[120px] lg:h-[120px]">
            <circle cx={cx} cy={cy} r={R} fill="none" strokeWidth={stroke}
              className="stroke-stone-100 dark:stroke-white/[0.04]" />
            {SPEND_DATA.map((seg, i) => {
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
            <text x={cx} y={cy - 7}  textAnchor="middle" fontSize="10" className="fill-stone-400 dark:fill-white/30">Total</text>
            <text x={cx} y={cy + 9}  textAnchor="middle" fontSize="14" className="fill-stone-900 dark:fill-white font-mono" fontFamily="'DM Mono', monospace">$4,830</text>
          </svg>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {SPEND_DATA.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-[11px] lg:text-[12px] flex-1 truncate
                text-stone-600 dark:text-white/50">
                {seg.label}
              </span>
              <span className="text-[11px] lg:text-[12px] font-mono shrink-0
                text-stone-500 dark:text-white/40">
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
// FX RATES STRIP
// ─────────────────────────────────────────────────────────────────────────────
const RATES = [
  { pair: 'USD/NGN', rate: '1,618.40', change: '+0.3%', up: true  },
  { pair: 'GBP/USD', rate: '1.2634',   change: '+1.2%', up: true  },
  { pair: 'EUR/USD', rate: '1.0821',   change: '-0.2%', up: false },
  { pair: 'USD/JPY', rate: '149.82',   change: '-0.5%', up: false },
  { pair: 'GBP/NGN', rate: '2,044.10', change: '+1.5%', up: true  },
];

const RatesStrip = () => (
  <div className={cn(
    'rounded-2xl border overflow-hidden',
    'bg-white dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.07]'
  )}>
    <div className="flex items-center justify-between px-4 lg:px-5 py-3.5 lg:py-4
      border-b border-stone-100 dark:border-white/[0.05]">
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase
        text-stone-400 dark:text-white/25">
        Live FX rates
      </p>
      <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    </div>
    <div className="divide-y divide-stone-100 dark:divide-white/[0.04]">
      {RATES.map((r) => (
        <div key={r.pair}
          className="flex items-center justify-between px-4 lg:px-5 py-3 lg:py-3.5
            hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">

          {/* Pair + flags */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex -space-x-1">
              <img src={getFlag(r.pair.split('/')[0])} alt=""
                className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white dark:border-[#111] object-cover" />
              <img src={getFlag(r.pair.split('/')[1])} alt=""
                className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white dark:border-[#111] object-cover" />
            </div>
            <span className="text-[12px] lg:text-[13px] font-bold font-mono tracking-wide
              text-stone-700 dark:text-white/70">
              {r.pair}
            </span>
          </div>

          {/* Rate + change */}
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="text-[12px] lg:text-[13px] font-mono tabular-nums
              text-stone-800 dark:text-white/80">
              {r.rate}
            </span>
            <span className={cn(
              'text-[10px] lg:text-[11px] font-mono px-2 py-0.5 rounded-md tabular-nums w-14 lg:w-16 text-center',
              r.up
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
            )}>
              {r.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// QUICK SEND
// ─────────────────────────────────────────────────────────────────────────────
const CONTACTS = [
  { name: 'Amina B.',  initials: 'AB', color: 'from-violet-500 to-purple-600' },
  { name: 'James O.',  initials: 'JO', color: 'from-sky-500 to-blue-600'     },
  { name: 'Chioma E.', initials: 'CE', color: 'from-emerald-500 to-teal-600' },
  { name: 'David M.',  initials: 'DM', color: 'from-rose-500 to-pink-600'    },
  { name: 'Fatima A.', initials: 'FA', color: 'from-amber-500 to-orange-600' },
];

const QuickSend = () => (
  <div className={cn(
    'rounded-2xl border p-4 lg:p-5',
    'bg-white dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.07]'
  )}>
    <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-4 lg:mb-5
      text-stone-400 dark:text-white/25">
      Quick send
    </p>

    {/*
      Scrollable row — scrollbar hidden via inline style (works cross-browser:
      Firefox: scrollbarWidth none, IE/Edge: msOverflowStyle none,
      Webkit: ::-webkit-scrollbar handled via global CSS or the className below)
    */}
    <div
      className="flex items-center gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Add new */}
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

      {CONTACTS.map((c) => (
        <button key={c.name} className="flex flex-col items-center gap-2 shrink-0 group">
          <div className={cn(
            'w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center',
            'text-white text-[11px] font-bold transition-all shadow-sm',
            `bg-gradient-to-br ${c.color}`,
            'group-hover:scale-105 group-active:scale-95'
          )}>
            {c.initials}
          </div>
          <span className="text-[10px] font-medium text-stone-500 dark:text-white/35">
            {c.name.split(' ')[0]}
          </span>
        </button>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
const OverviewPage = () => {
  return (
    <div className="w-full">

      {/* Balance hero */}
      <BalanceHero />

      {/* Stat cards — 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3 mb-8 lg:mb-14">
        <StatCard label="Total sent"     value="$8,420"  sub="+12% this month"   up={true} accent />
        <StatCard label="Total received" value="$14,200" sub="+28% this month"   up={true}        />
        <StatCard label="Conversions"    value="6"       sub="3 pending"                         />
        <StatCard label="Saved (fees)"   value="$124.50" sub="vs bank transfers"                 />
      </div>

      {/* Portfolio chart */}
      <SectionRule label="Portfolio performance" />
      <PortfolioChart />

      {/* Main content grid:
          Mobile  → single column, right widgets come AFTER transactions
          Desktop → transactions | right column (340px) side by side         */}
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
              {TRANSACTIONS.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </div>
            <div className="px-4 py-3 border-t border-stone-100 dark:border-white/[0.05]">
              <button className="w-full text-center text-[11px] font-bold uppercase tracking-[0.12em] transition-colors
                text-[#C9A84C]/60 hover:text-[#C9A84C]">
                Load more →
              </button>
            </div>
          </div>
        </div>

        {/* Right column — stacks below on mobile */}
        <div className="flex flex-col gap-4 lg:gap-6">
          <QuickSend />
          <SpendDonut />
        </div>
      </div>

      {/* FX rates */}
      <SectionRule label="Foreign exchange" action={{ text: 'Convert now' }} />
      <div className="mb-24 lg:mb-20">
        <RatesStrip />
      </div>

    </div>
  );
};

export default OverviewPage;