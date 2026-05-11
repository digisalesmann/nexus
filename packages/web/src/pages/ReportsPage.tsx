import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Calendar,
  FileText,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Period = '3M' | '6M' | '1Y' | 'YTD';

interface MonthEntry  { key: string; label: string; }
interface MonthData   { income: number; expense: number; fx: number; }
interface DonutItem   { label: string; value: number; color: string; pct: number; }
interface CurrencyRow { currency: string; inflow: number; outflow: number; net: number; flag: string; }
interface ReportEntry { id: string; title: string; date: string; type: string; size: string; }

// ─────────────────────────────────────────────────────────────────────────────
// DATA BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = ['#C9A84C', '#60a5fa', '#34d399', '#a78bfa', '#f97316', '#ec4899', '#94a3b8'];
const INCOME_COLORS   = ['#C9A84C', '#34d399', '#60a5fa', '#a78bfa', '#94a3b8'];

function toMonthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthEntries(period: Period, offsetMonths = 0): MonthEntry[] {
  const now   = new Date();
  const count = period === 'YTD'
    ? now.getMonth() + 1
    : ({ '3M': 3, '6M': 6, '1Y': 12 } as Record<string, number>)[period];
  const entries: MonthEntry[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i - offsetMonths, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    entries.push({ key, label: d.toLocaleString('en', { month: 'short' }) });
  }
  return entries;
}

function buildMonthlyData(txs: Transaction[]): Map<string, MonthData> {
  const map = new Map<string, MonthData>();
  for (const tx of txs) {
    const key   = toMonthKey(tx.created_at);
    const entry = map.get(key) ?? { income: 0, expense: 0, fx: 0 };
    const amt   = tx.from_amount ?? 0;
    if (tx.type === 'deposit' || tx.type === 'transfer_in') {
      entry.income += tx.to_amount ?? amt;
    } else if (tx.type === 'withdrawal' || tx.type === 'transfer_out') {
      entry.expense += amt;
    } else if (tx.type === 'swap') {
      entry.fx      += amt;
      entry.expense += amt;
    }
    map.set(key, entry);
  }
  return map;
}

function sumMonths(entries: MonthEntry[], map: Map<string, MonthData>, key: keyof MonthData): number {
  return entries.reduce((s, m) => s + (map.get(m.key)?.[key] ?? 0), 0);
}

function buildCategories(txs: Transaction[], monthKeys: Set<string>): DonutItem[] {
  const LABEL: Record<string, string> = { transfer_out: 'Transfers', withdrawal: 'Withdrawals', swap: 'FX Swaps' };
  const totals: Record<string, number> = {};
  for (const tx of txs) {
    const label = LABEL[tx.type];
    if (!label || !monthKeys.has(toMonthKey(tx.created_at))) continue;
    totals[label] = (totals[label] ?? 0) + (tx.from_amount ?? 0);
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return entries.map(([label, value], i) => ({
    label, value: Math.round(value),
    color: CATEGORY_COLORS[i] ?? '#94a3b8',
    pct: Math.round((value / total) * 100),
  }));
}

function buildIncomeSources(txs: Transaction[], monthKeys: Set<string>): DonutItem[] {
  const LABEL: Record<string, string> = { deposit: 'Deposits', transfer_in: 'Inbound Transfers' };
  const totals: Record<string, number> = {};
  for (const tx of txs) {
    const label = LABEL[tx.type];
    if (!label || !monthKeys.has(toMonthKey(tx.created_at))) continue;
    totals[label] = (totals[label] ?? 0) + (tx.to_amount ?? tx.from_amount ?? 0);
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return entries.map(([label, value], i) => ({
    label, value: Math.round(value),
    color: INCOME_COLORS[i] ?? '#94a3b8',
    pct: Math.round((value / total) * 100),
  }));
}

function buildCurrencyBreakdown(txs: Transaction[], monthKeys: Set<string>): CurrencyRow[] {
  const map: Record<string, { inflow: number; outflow: number }> = {};
  const g = (cur: string) => { map[cur] = map[cur] ?? { inflow: 0, outflow: 0 }; return map[cur]; };
  for (const tx of txs) {
    if (!monthKeys.has(toMonthKey(tx.created_at))) continue;
    if (tx.type === 'deposit' || tx.type === 'transfer_in') {
      g(tx.to_currency ?? tx.from_currency ?? 'USD').inflow += tx.to_amount ?? tx.from_amount ?? 0;
    } else if (tx.type === 'withdrawal' || tx.type === 'transfer_out') {
      g(tx.from_currency ?? 'USD').outflow += tx.from_amount ?? 0;
    } else if (tx.type === 'swap') {
      g(tx.from_currency ?? 'USD').outflow += tx.from_amount ?? 0;
      g(tx.to_currency   ?? 'USD').inflow  += tx.to_amount   ?? 0;
    }
  }
  return Object.entries(map)
    .map(([currency, { inflow, outflow }]) => ({
      currency,
      inflow:  Math.round(inflow),
      outflow: Math.round(outflow),
      net:     Math.round(inflow - outflow),
      flag:    currency,
    }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

function buildRecentReports(): ReportEntry[] {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const fmt   = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const out: ReportEntry[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(year, month - i, 1);
    out.push({
      id:    `S${i}`,
      title: `${d.toLocaleString('en-US', { month: 'long', year: 'numeric' })} Summary`,
      date:  fmt(new Date(d.getFullYear(), d.getMonth() + 1, 1)),
      type:  'summary',
      size:  `${100 + i * 14} KB`,
    });
  }
  const q      = Math.floor(month / 3);
  const prevQ  = q === 0 ? 3 : q - 1;
  const qYear  = q === 0 ? year - 1 : year;
  out.push({
    id:    'Q1',
    title: `Q${prevQ + 1} ${qYear} Statement`,
    date:  fmt(new Date(qYear, prevQ * 3 + 3, 1)),
    type:  'statement',
    size:  '284 KB',
  });
  out.push({
    id:    'A1',
    title: `Annual Report ${year - 1}`,
    date:  fmt(new Date(year, 0, 1)),
    type:  'annual',
    size:  '1.2 MB',
  });
  return out;
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtFull(n: number): string {
  return `$${n.toLocaleString('en', { minimumFractionDigits: 2 })}`;
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

const StatCard = ({ label, value, sub, up, accent, icon: Icon }: {
  label: string; value: string; sub: string;
  up?: boolean; accent?: boolean;
  icon?: React.ElementType;
}) => (
  <div className={cn(
    'rounded-2xl border p-4 flex flex-col gap-2.5',
    accent
      ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
      : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07]'
  )}>
    <div className="flex items-center justify-between">
      <p className="text-[9px] font-bold tracking-[0.18em] uppercase
        text-stone-400 dark:text-white/25">
        {label}
      </p>
      {Icon && (
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center',
          accent ? 'bg-[#C9A84C]/20' : 'bg-stone-100 dark:bg-white/[0.06]'
        )}>
          <Icon size={13} className={accent ? 'text-[#C9A84C]' : 'text-stone-400 dark:text-white/30'} />
        </div>
      )}
    </div>
    <p className="font-['DM_Serif_Display',_Georgia,_serif] font-normal leading-none
      text-stone-900 dark:text-white"
      style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', letterSpacing: '-0.3px' }}>
      {value}
    </p>
    <div className="flex items-center gap-1.5">
      {up !== undefined && (
        up
          ? <TrendingUp size={10} className="text-emerald-500 shrink-0" />
          : <TrendingDown size={10} className="text-red-400 shrink-0" />
      )}
      <span className={cn(
        'text-[10px] font-mono',
        up === undefined ? 'text-stone-400 dark:text-white/30'
          : up ? 'text-emerald-500' : 'text-red-400'
      )}>
        {sub}
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// BAR CHART (income vs expense — pure SVG, no deps)
// ─────────────────────────────────────────────────────────────────────────────

const BarChart = ({ months, data }: {
  months: string[];
  data: Record<string, { income: number; expense: number }>;
}) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const W = 800, H = 200;
  const padL = 0, padR = 0, padT = 10, padB = 30;
  const iW = W - padL - padR;
  const iH = H - padT - padB;

  const maxVal = Math.max(...months.flatMap(m => [data[m]?.income ?? 0, data[m]?.expense ?? 0]));
  const barGroup = iW / months.length;
  const barW     = Math.max(8, Math.min(28, barGroup * 0.3));
  const gap      = barW * 0.4;

  const toY = (v: number) => padT + iH - (v / (maxVal || 1)) * iH;
  const toH = (v: number) => (v / (maxVal || 1)) * iH;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'clamp(120px, 22vw, 200px)' }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(t => (
          <line key={t}
            x1={padL} y1={padT + iH * (1 - t)}
            x2={W - padR} y2={padT + iH * (1 - t)}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-stone-200 dark:text-white/[0.06]"
          />
        ))}

        {/* Bars */}
        {months.map((m, i) => {
          const cx  = padL + (i + 0.5) * (iW / months.length);
          const inc = data[m]?.income ?? 0;
          const exp = data[m]?.expense ?? 0;
          const isHov = hovered === m;

          return (
            <g key={m}
              onMouseEnter={() => setHovered(m)}
              style={{ cursor: 'default' }}
            >
              {/* Hover bg */}
              {isHov && (
                <rect
                  x={cx - barGroup * 0.45}
                  y={padT}
                  width={barGroup * 0.9}
                  height={iH}
                  fill="currentColor"
                  className="text-stone-100 dark:text-white/[0.03]"
                  rx="4"
                />
              )}
              {/* Income bar */}
              <rect
                x={cx - gap / 2 - barW}
                y={toY(inc)}
                width={barW}
                height={toH(inc)}
                fill={isHov ? '#D4B558' : '#C9A84C'}
                rx="3"
                style={{ transition: 'fill 0.15s' }}
              />
              {/* Expense bar */}
              <rect
                x={cx + gap / 2}
                y={toY(exp)}
                width={barW}
                height={toH(exp)}
                fill={isHov ? '#a8a29e' : '#d6d3d1'}
                className="dark:fill-white/20"
                rx="3"
                style={{ transition: 'fill 0.15s' }}
              />
              {/* Month label */}
              <text
                x={cx}
                y={H - 6}
                textAnchor="middle"
                fontSize={months.length > 9 ? '9' : '10'}
                className="fill-stone-400 dark:fill-white/25"
              >
                {m}
              </text>
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hovered && (() => {
          const i   = months.indexOf(hovered);
          const cx  = padL + (i + 0.5) * (iW / months.length);
          const inc = data[hovered]?.income ?? 0;
          const exp = data[hovered]?.expense ?? 0;
          const tx  = Math.min(cx, W - 110);
          return (
            <g>
              <rect x={tx} y={padT + 2} width={105} height={46} rx="6"
                fill="currentColor"
                className="text-white dark:text-[#1C1C1E]"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
              />
              <text x={tx + 8} y={padT + 16} fontSize="9" fontWeight="600"
                className="fill-stone-400 dark:fill-white/30">
                {hovered}
              </text>
              <circle cx={tx + 8} cy={padT + 27} r="3" fill="#C9A84C" />
              <text x={tx + 14} y={padT + 30} fontSize="10" fontWeight="600" fill="#C9A84C">
                {fmtK(inc)}
              </text>
              <circle cx={tx + 55} cy={padT + 27} r="3" fill="#a8a29e" />
              <text x={tx + 61} y={padT + 30} fontSize="10" fontWeight="600"
                className="fill-stone-500 dark:fill-white/50">
                {fmtK(exp)}
              </text>
              <text x={tx + 8} y={padT + 43} fontSize="9"
                className="fill-stone-400 dark:fill-white/25">
                Net: {inc >= exp ? '+' : ''}{fmtK(inc - exp)}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#C9A84C]" />
          <span className="text-[11px] font-mono text-stone-500 dark:text-white/40">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-stone-300 dark:bg-white/20" />
          <span className="text-[11px] font-mono text-stone-500 dark:text-white/40">Expenses</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LINE CHART (net cash flow — pure SVG)
// ─────────────────────────────────────────────────────────────────────────────

const LineChart = ({ months, data }: {
  months: string[];
  data: Record<string, { income: number; expense: number }>;
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 800, H = 140;
  const pad = { t: 10, b: 28, l: 0, r: 0 };
  const iW  = W - pad.l - pad.r;
  const iH  = H - pad.t - pad.b;

  const nets = months.map(m => (data[m]?.income ?? 0) - (data[m]?.expense ?? 0));
  const min  = Math.min(0, ...nets);
  const max  = Math.max(...nets);
  const rng  = max - min || 1;

  const toX = (i: number) => pad.l + (i / (months.length - 1)) * iW;
  const toY = (v: number) => pad.t + iH - ((v - min) / rng) * iH;

  const pts      = nets.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const zeroY    = toY(0);
  const areaPath = `M${toX(0)},${zeroY} ` +
    nets.map((v, i) => `L${toX(i)},${toY(v)}`).join(' ') +
    ` L${toX(months.length - 1)},${zeroY} Z`;

  const hx = hoverIdx !== null ? toX(hoverIdx) : null;
  const hy = hoverIdx !== null ? toY(nets[hoverIdx]) : null;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width) * W;
    const idx  = Math.round((x / iW) * (months.length - 1));
    setHoverIdx(Math.max(0, Math.min(months.length - 1, idx)));
  };

  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const t    = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = ((t.clientX - rect.left) / rect.width) * W;
    const idx  = Math.round((x / iW) * (months.length - 1));
    setHoverIdx(Math.max(0, Math.min(months.length - 1, idx)));
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        style={{ height: 'clamp(90px, 18vw, 140px)' }}
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={handleMove}
        onTouchMove={handleTouch}
        onTouchEnd={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="net-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"   />
          </linearGradient>
        </defs>

        {/* Zero line */}
        <line x1={pad.l} y1={zeroY} x2={W} y2={zeroY}
          stroke="currentColor" strokeWidth="1" strokeDasharray="4 3"
          className="text-stone-200 dark:text-white/[0.08]" />

        <path d={areaPath} fill="url(#net-grad)" />
        <polyline points={pts} fill="none" stroke="#C9A84C" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />

        {hx !== null && hy !== null && (
          <>
            <line x1={hx} y1={pad.t} x2={hx} y2={H - pad.b}
              stroke="#C9A84C" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <circle cx={hx} cy={hy} r="4" fill="#C9A84C" />
            <circle cx={hx} cy={hy} r="8" fill="#C9A84C" opacity="0.2" />
          </>
        )}

        {months.map((m, i) => (
          <text key={m} x={toX(i)} y={H - 6} textAnchor="middle"
            fontSize={months.length > 9 ? '9' : '10'}
            className="fill-stone-400 dark:fill-white/25">
            {m}
          </text>
        ))}
      </svg>

      {/* Hover value */}
      {hoverIdx !== null && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-mono text-stone-400 dark:text-white/25">
            {months[hoverIdx]}:
          </span>
          <span className={cn(
            'text-[12px] font-bold font-mono',
            nets[hoverIdx] >= 0 ? 'text-[#C9A84C]' : 'text-red-400'
          )}>
            {nets[hoverIdx] >= 0 ? '+' : ''}{fmtK(nets[hoverIdx])}
          </span>
          <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
            net cash flow
          </span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────

const DonutChart = ({
  items, title, total, cx = 60, cy = 60, R = 48, stroke = 15,
}: {
  items: { label: string; value: number; color: string; pct: number }[];
  title: string; total: string;
  cx?: number; cy?: number; R?: number; stroke?: number;
}) => {
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const circ   = 2 * Math.PI * R;
  let   offset = 0;

  return (
    <div className={cn(
      'rounded-2xl border p-4',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-4
        text-stone-400 dark:text-white/25">
        {title}
      </p>
      <div className="flex items-center gap-4 lg:gap-5 flex-wrap sm:flex-nowrap">
        {/* Donut */}
        <div className="shrink-0 mx-auto sm:mx-0">
          <svg width="120" height="120" viewBox="0 0 120 120"
            className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px]">
            <circle cx={cx} cy={cy} r={R} fill="none" strokeWidth={stroke}
              className="stroke-stone-100 dark:stroke-white/[0.05]" />
            {items.map((seg, i) => {
              const dash   = (seg.pct / 100) * circ;
              const gap    = circ - dash;
              const rotate = (offset / 100) * 360 - 90;
              offset += seg.pct;
              return (
                <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                  stroke={seg.color}
                  strokeWidth={hovIdx === i ? stroke + 2 : stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  style={{
                    transform: `rotate(${rotate}deg)`,
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: 'stroke-width 0.15s',
                    cursor: 'pointer',
                  }}
                  strokeLinecap="butt"
                  onMouseEnter={() => setHovIdx(i)}
                  onMouseLeave={() => setHovIdx(null)}
                />
              );
            })}
            <text x={cx} y={cy - 7} textAnchor="middle" fontSize="9"
              className="fill-stone-400 dark:fill-white/30">
              {hovIdx !== null ? items[hovIdx].label.split(' ')[0] : 'Total'}
            </text>
            <text x={cx} y={cy + 9} textAnchor="middle" fontSize="13" fontWeight="600"
              className="fill-stone-900 dark:fill-white" fontFamily="'DM Mono', monospace">
              {hovIdx !== null ? `${items[hovIdx].pct}%` : total}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0 w-full sm:w-auto">
          {items.map((seg, i) => (
            <div key={seg.label}
              className={cn(
                'flex items-center gap-2.5 py-0.5 rounded-lg transition-colors px-1 cursor-default',
                hovIdx === i && 'bg-stone-50 dark:bg-white/[0.03]'
              )}
              onMouseEnter={() => setHovIdx(i)}
              onMouseLeave={() => setHovIdx(null)}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-[11px] flex-1 truncate text-stone-600 dark:text-white/50">
                {seg.label}
              </span>
              <span className="text-[11px] font-mono text-stone-400 dark:text-white/30 shrink-0">
                {seg.pct}%
              </span>
              <span className="text-[11px] font-mono text-stone-500 dark:text-white/40 shrink-0 w-16 text-right">
                ${seg.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY BREAKDOWN TABLE
// ─────────────────────────────────────────────────────────────────────────────

const CurrencyTable = ({ rows }: { rows: CurrencyRow[] }) => {
  const SYM: Record<string, string> = { USD: '$', NGN: '₦', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$', CHF: 'Fr', JPY: '¥' };

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-stone-100 dark:border-white/[0.05]">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase
          text-stone-400 dark:text-white/25">
          By currency
        </p>
      </div>

      {/* Column labels — sm+ only */}
      <div className="hidden sm:grid sm:grid-cols-5 px-5 py-2 border-b
        border-stone-50 dark:border-white/[0.04]">
        {['Currency', 'Inflow', 'Outflow', 'Net', 'Trend'].map(h => (
          <span key={h} className="text-[9px] font-bold tracking-[0.12em] uppercase
            text-stone-300 dark:text-white/20">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-stone-50 dark:divide-white/[0.03]">
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-[12px] text-stone-400 dark:text-white/25 text-center font-mono">
            No currency data for this period
          </p>
        ) : rows.map(row => {
          const sym  = SYM[row.currency] ?? '';
          const isUp = row.net >= 0;
          return (
            <div key={row.currency}
              className="px-4 sm:px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors">

              {/* Mobile: 2-line layout */}
              <div className="sm:hidden flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    bg-stone-100 dark:bg-white/[0.06] font-bold text-[12px] font-mono
                    text-stone-700 dark:text-white/65">
                    {sym}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-stone-800 dark:text-white/80 leading-none">
                      {row.currency}
                    </p>
                    <p className="text-[10px] font-mono text-stone-400 dark:text-white/25 mt-0.5">
                      ↑{sym}{row.inflow.toLocaleString()} · ↓{sym}{row.outflow.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-[13px] font-bold font-mono tabular-nums',
                    isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'
                  )}>
                    {isUp ? '+' : ''}{sym}{Math.abs(row.net).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isUp
                      ? <TrendingUp size={10} className="text-emerald-500" />
                      : <TrendingDown size={10} className="text-red-400" />
                    }
                  </div>
                </div>
              </div>

              {/* Desktop: 5-column grid */}
              <div className="hidden sm:grid sm:grid-cols-5 items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0
                    bg-stone-100 dark:bg-white/[0.06] font-bold text-[11px] font-mono
                    text-stone-700 dark:text-white/65">
                    {sym}
                  </div>
                  <span className="text-[13px] font-bold text-stone-800 dark:text-white/80">
                    {row.currency}
                  </span>
                </div>
                <span className="text-[12px] font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{sym}{row.inflow.toLocaleString()}
                </span>
                <span className="text-[12px] font-mono text-stone-500 dark:text-white/40 tabular-nums">
                  -{sym}{row.outflow.toLocaleString()}
                </span>
                <span className={cn(
                  'text-[12px] font-bold font-mono tabular-nums',
                  isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'
                )}>
                  {isUp ? '+' : ''}{sym}{Math.abs(row.net).toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  {isUp
                    ? <TrendingUp size={12} className="text-emerald-500" />
                    : <TrendingDown size={12} className="text-red-400" />
                  }
                  <span className={cn(
                    'text-[10px] font-mono',
                    isUp ? 'text-emerald-500' : 'text-red-400'
                  )}>
                    {isUp ? 'Surplus' : 'Deficit'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RECENT REPORTS LIST
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  statement: { label: 'Statement', color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10'  },
  summary:   { label: 'Summary',   color: 'text-[#C9A84C] bg-[#C9A84C]/10'                              },
  annual:    { label: 'Annual',    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10' },
};

const ReportRow = ({ r }: { r: ReportEntry }) => {
  const cfg = TYPE_CONFIG[r.type] ?? TYPE_CONFIG.summary;
  return (
    <div className="flex items-center gap-3 py-3.5
      border-b border-stone-100 dark:border-white/[0.04] last:border-0
      hover:bg-stone-50 dark:hover:bg-white/[0.02]
      -mx-2 px-2 rounded-xl transition-colors cursor-pointer group">
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        'bg-stone-100 dark:bg-white/[0.06]'
      )}>
        <FileText size={15} className="text-stone-400 dark:text-white/30" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-none tracking-[-0.2px] truncate
          text-stone-800 dark:text-white/80">
          {r.title}
        </p>
        <p className="text-[10px] mt-0.5 text-stone-400 dark:text-white/25 font-mono">
          {r.date} · {r.size}
        </p>
      </div>
      <span className={cn(
        'text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-flex',
        cfg.color
      )}>
        {cfg.label}
      </span>
      <button className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all',
        'text-stone-300 dark:text-white/20 hover:text-[#C9A84C]',
        'hover:bg-[#C9A84C]/[0.08]'
      )}>
        <Download size={14} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PERIOD SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

const PeriodSelector = ({ value, onChange }: {
  value: Period; onChange: (p: Period) => void;
}) => (
  <div className="flex gap-1 p-1 rounded-xl
    bg-stone-100 dark:bg-white/[0.04]
    border border-stone-200 dark:border-white/[0.06]
    w-full sm:w-fit">
    {(['3M', '6M', '1Y', 'YTD'] as Period[]).map(p => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={cn(
          'flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition-all',
          value === p
            ? 'bg-[#C9A84C] text-[#0C0C0D] shadow-sm'
            : 'text-stone-500 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/55'
        )}
      >
        {p}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const ExportDropdown = () => {
  const [open, setOpen]   = useState(false);
  const [done, setDone]   = useState(false);

  const formats = [
    { label: 'PDF report',   sub: 'Full formatted report' },
    { label: 'CSV export',   sub: 'Raw transaction data'  },
    { label: 'Excel (.xlsx)',sub: 'Spreadsheet format'     },
    { label: 'JSON data',    sub: 'For developers'         },
  ];

  const handleExport = () => {
    setOpen(false);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold transition-all',
          done
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : cn(
                'bg-white dark:bg-white/[0.02]',
                'border-stone-200 dark:border-white/[0.07]',
                'text-stone-600 dark:text-white/50',
                'hover:border-stone-300 dark:hover:border-white/[0.14]',
                'hover:text-stone-800 dark:hover:text-white/70'
              )
        )}
      >
        {done
          ? <><CheckCircle2 size={14} /><span>Exported!</span></>
          : <><Download size={14} /><span className="hidden sm:inline">Export</span><ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} /></>
        }
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[50]" onClick={() => setOpen(false)} />
          <div className={cn(
            'absolute top-full right-0 mt-1.5 w-48 rounded-xl border overflow-hidden z-[60]',
            'bg-white dark:bg-[#1C1C1E]',
            'border-stone-200 dark:border-white/[0.09]',
            'shadow-xl shadow-black/10 dark:shadow-black/40'
          )}>
            {formats.map(f => (
              <button
                key={f.label}
                onClick={handleExport}
                className="w-full flex flex-col items-start px-4 py-3 text-left transition-colors
                  border-b border-stone-50 dark:border-white/[0.04] last:border-0
                  hover:bg-stone-50 dark:hover:bg-white/[0.04]"
              >
                <span className="text-[12.5px] font-semibold text-stone-800 dark:text-white/80">
                  {f.label}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-white/25">{f.sub}</span>
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

const ReportsPage = () => {
  const [period, setPeriod]     = useState<Period>('6M');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const { transactions } = useTransactions(500);

  // Current period month entries
  const monthEntries = useMemo(() => buildMonthEntries(period), [period]);
  const monthKeys    = useMemo(() => new Set(monthEntries.map(m => m.key)), [monthEntries]);
  const chartLabels  = useMemo(() => monthEntries.map(m => m.label), [monthEntries]);

  // All-transactions monthly aggregates
  const allMonthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);

  // Build Record<label, data> for charts (BarChart/LineChart expect label-keyed record)
  const chartData = useMemo(() => {
    const rec: Record<string, { income: number; expense: number; fx: number }> = {};
    for (const m of monthEntries) rec[m.label] = allMonthlyData.get(m.key) ?? { income: 0, expense: 0, fx: 0 };
    return rec;
  }, [monthEntries, allMonthlyData]);

  const income  = useMemo(() => sumMonths(monthEntries, allMonthlyData, 'income'),  [monthEntries, allMonthlyData]);
  const expense = useMemo(() => sumMonths(monthEntries, allMonthlyData, 'expense'), [monthEntries, allMonthlyData]);
  const fx      = useMemo(() => sumMonths(monthEntries, allMonthlyData, 'fx'),      [monthEntries, allMonthlyData]);
  const net     = income - expense;
  const savings = income > 0 ? Math.round((net / income) * 100) : 0;

  // Previous same-length period for comparison
  const periodCount     = period === 'YTD' ? new Date().getMonth() + 1 : ({ '3M': 3, '6M': 6, '1Y': 12 } as Record<string, number>)[period];
  const prevMonthEntries = useMemo(() => buildMonthEntries(period, periodCount), [period, periodCount]);
  const prevIncome      = useMemo(() => sumMonths(prevMonthEntries, allMonthlyData, 'income'),  [prevMonthEntries, allMonthlyData]);
  const prevExpense     = useMemo(() => sumMonths(prevMonthEntries, allMonthlyData, 'expense'), [prevMonthEntries, allMonthlyData]);
  const incomeChg  = prevIncome  > 0 ? ((income  - prevIncome)  / prevIncome)  * 100 : 0;
  const expenseChg = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0;

  // Derived breakdowns
  const categories    = useMemo(() => buildCategories(transactions, monthKeys),        [transactions, monthKeys]);
  const incomeSources = useMemo(() => buildIncomeSources(transactions, monthKeys),     [transactions, monthKeys]);
  const currencyRows  = useMemo(() => buildCurrencyBreakdown(transactions, monthKeys), [transactions, monthKeys]);
  const recentReports = useMemo(() => buildRecentReports(), []);

  // FX conversion stats
  const fxTxs  = useMemo(() => transactions.filter(tx => tx.type === 'swap' && monthKeys.has(toMonthKey(tx.created_at))), [transactions, monthKeys]);
  const fxFees = useMemo(() => fxTxs.reduce((s, tx) => s + tx.fee, 0), [fxTxs]);
  const bestRate = useMemo(() => {
    const usdToGbp = fxTxs.filter(tx => tx.from_currency === 'USD' && tx.to_currency === 'GBP' && (tx.rate ?? 0) > 0);
    if (!usdToGbp.length) return null;
    return Math.max(...usdToGbp.map(tx => tx.rate ?? 0)).toFixed(4) + ' GBP';
  }, [fxTxs]);

  return (
    <div className="w-full">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-6 lg:mb-8 flex-wrap">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
            text-stone-400 dark:text-white/25">
            Financial analytics
          </p>
          <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
            style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
            Reports
          </h1>
        </div>
        <ExportDropdown />
      </div>

      {/* ── Period selector ── */}
      <div className="mb-6">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* ── KPI stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        <StatCard
          label="Total income"
          value={fmtFull(income)}
          sub={`${incomeChg >= 0 ? '+' : ''}${incomeChg.toFixed(1)}% vs prev`}
          up={incomeChg >= 0}
          accent
          icon={ArrowDownLeft}
        />
        <StatCard
          label="Total expenses"
          value={fmtFull(expense)}
          sub={`${expenseChg >= 0 ? '+' : ''}${expenseChg.toFixed(1)}% vs prev`}
          up={expenseChg <= 0}
          icon={ArrowUpRight}
        />
        <StatCard
          label="Net cash flow"
          value={fmtFull(net)}
          sub={net >= 0 ? 'Positive balance' : 'Negative balance'}
          up={net >= 0}
          icon={ArrowLeftRight}
        />
        <StatCard
          label="Savings rate"
          value={`${savings}%`}
          sub="of income saved"
          up={savings >= 20}
          icon={TrendingUp}
        />
      </div>

      {/* ── Income vs Expense chart ── */}
      <SectionRule label="Income vs expenses" />
      <div className={cn(
        'rounded-2xl border p-4 lg:p-5 mb-8',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]'
      )}>
        {/* Chart header */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-1
              text-stone-400 dark:text-white/25">
              Monthly comparison
            </p>
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
              style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', letterSpacing: '-0.3px' }}>
              {fmtFull(income)}
              <span className="text-[13px] font-sans font-normal ml-2 text-stone-400 dark:text-white/30">
                income
              </span>
            </p>
          </div>
          {/* Chart type toggle */}
          <div className="flex border border-stone-200 dark:border-white/[0.07] rounded-xl overflow-hidden shrink-0">
            {([
              { id: 'bar'  as const, icon: BarChart2 },
              { id: 'line' as const, icon: TrendingUp },
            ]).map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setChartType(id)}
                className={cn(
                  'px-3 py-2 transition-colors',
                  chartType === id
                    ? 'bg-[#C9A84C] text-[#0C0C0D]'
                    : 'bg-white dark:bg-white/[0.02] text-stone-400 dark:text-white/30 hover:text-stone-600'
                )}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        {chartType === 'bar'
          ? <BarChart months={chartLabels} data={chartData} />
          : <LineChart months={chartLabels} data={chartData} />
        }
      </div>

      {/* ── Net cash flow line chart ── */}
      <SectionRule label="Net cash flow trend" />
      <div className={cn(
        'rounded-2xl border p-4 lg:p-5 mb-8',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]'
      )}>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-1
              text-stone-400 dark:text-white/25">
              Scrub to explore
            </p>
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
              style={{ fontSize: 'clamp(16px, 3vw, 20px)', letterSpacing: '-0.3px' }}>
              {net >= 0 ? '+' : ''}{fmtFull(net)}
              <span className="text-[12px] font-sans font-normal ml-2 text-stone-400 dark:text-white/30">
                net {period}
              </span>
            </p>
          </div>
          <span className={cn(
            'text-[11px] font-bold px-3 py-1.5 rounded-full',
            net >= 0
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
              : 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
          )}>
            {net >= 0 ? '↑ Surplus' : '↓ Deficit'}
          </span>
        </div>
        <LineChart months={chartLabels} data={chartData} />
      </div>

      {/* ── Spending + Income breakdowns side by side ── */}
      <SectionRule label="Breakdown" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <DonutChart
          items={categories.length > 0 ? categories : [{ label: 'No data', value: 0, color: '#94a3b8', pct: 100 }]}
          title="Expense categories"
          total={fmtK(expense)}
        />
        <DonutChart
          items={incomeSources.length > 0 ? incomeSources : [{ label: 'No data', value: 0, color: '#94a3b8', pct: 100 }]}
          title="Income sources"
          total={fmtK(income)}
        />
      </div>

      {/* ── Currency breakdown ── */}
      <SectionRule label="Currency breakdown" />
      <div className="mb-8">
        <CurrencyTable rows={currencyRows} />
      </div>

      {/* ── FX conversion summary ── */}
      <SectionRule label="FX conversions" />
      <div className={cn(
        'rounded-2xl border p-4 sm:p-5 mb-8',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]'
      )}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total converted', value: fmtFull(fx),                  sub: `${monthEntries.length} months`   },
            { label: 'Conversions',     value: String(fxTxs.length),          sub: 'transactions'                    },
            { label: 'Fees paid',       value: fmtFull(fxFees),               sub: 'actual fees'                     },
            { label: 'Best rate',       value: bestRate ?? '—',               sub: 'USD→GBP'                         },
          ].map(s => (
            <div key={s.label}>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1.5
                text-stone-400 dark:text-white/25">
                {s.label}
              </p>
              <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none"
                style={{ fontSize: 'clamp(14px, 3vw, 18px)', letterSpacing: '-0.2px' }}>
                {s.value}
              </p>
              <p className="text-[10px] font-mono mt-1 text-stone-400 dark:text-white/25">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Monthly breakdown table ── */}
      <SectionRule label={`Monthly breakdown · ${period}`} />
      <div className={cn(
        'rounded-2xl border overflow-hidden mb-8',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]'
      )}>
        {/* Column headers */}
        <div className="hidden sm:grid sm:grid-cols-5 px-5 py-3 border-b
          border-stone-100 dark:border-white/[0.05]
          bg-stone-50 dark:bg-white/[0.01]">
          {['Month', 'Income', 'Expenses', 'FX', 'Net'].map(h => (
            <span key={h} className="text-[9px] font-bold tracking-[0.12em] uppercase
              text-stone-300 dark:text-white/20">
              {h}
            </span>
          ))}
        </div>

        <div className="divide-y divide-stone-50 dark:divide-white/[0.03]">
          {monthEntries.map(({ key, label }) => {
            const d      = chartData[label] ?? { income: 0, expense: 0, fx: 0 };
            const rowNet = d.income - d.expense;
            return (
              <div key={key}
                className="px-4 sm:px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors">

                {/* Mobile: 2-col */}
                <div className="sm:hidden flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-stone-800 dark:text-white/80">{label}</p>
                    <p className="text-[10px] font-mono text-stone-400 dark:text-white/25 mt-0.5">
                      {fmtK(d.income)} in · {fmtK(d.expense)} out
                    </p>
                  </div>
                  <p className={cn(
                    'text-[13px] font-bold font-mono tabular-nums',
                    rowNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'
                  )}>
                    {rowNet >= 0 ? '+' : ''}{fmtK(rowNet)}
                  </p>
                </div>

                {/* Desktop: 5-col grid */}
                <div className="hidden sm:grid sm:grid-cols-5 items-center">
                  <span className="text-[13px] font-bold text-stone-800 dark:text-white/80">{label}</span>
                  <span className="text-[12px] font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{fmtK(d.income)}
                  </span>
                  <span className="text-[12px] font-mono text-stone-500 dark:text-white/40 tabular-nums">
                    -{fmtK(d.expense)}
                  </span>
                  <span className="text-[12px] font-mono text-sky-500 dark:text-sky-400 tabular-nums">
                    {fmtK(d.fx)}
                  </span>
                  <span className={cn(
                    'text-[12px] font-bold font-mono tabular-nums',
                    rowNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'
                  )}>
                    {rowNet >= 0 ? '+' : ''}{fmtK(rowNet)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals row */}
        <div className={cn(
          'px-4 sm:px-5 py-4 border-t',
          'border-stone-200 dark:border-white/[0.07]',
          'bg-stone-50 dark:bg-white/[0.01]'
        )}>
          {/* Mobile */}
          <div className="sm:hidden flex items-center justify-between">
            <p className="text-[12px] font-bold text-stone-500 dark:text-white/40 uppercase tracking-wide">
              Total
            </p>
            <p className={cn(
              'text-[13px] font-bold font-mono',
              net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'
            )}>
              {net >= 0 ? '+' : ''}{fmtK(net)}
            </p>
          </div>
          {/* Desktop */}
          <div className="hidden sm:grid sm:grid-cols-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-white/25">
              Total
            </span>
            <span className="text-[13px] font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{fmtK(income)}
            </span>
            <span className="text-[13px] font-bold font-mono text-stone-500 dark:text-white/40 tabular-nums">
              -{fmtK(expense)}
            </span>
            <span className="text-[13px] font-bold font-mono text-sky-500 dark:text-sky-400 tabular-nums">
              {fmtK(fx)}
            </span>
            <span className={cn(
              'text-[13px] font-bold font-mono tabular-nums',
              net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'
            )}>
              {net >= 0 ? '+' : ''}{fmtK(net)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Saved reports ── */}
      <SectionRule label="Saved reports" action={{ text: 'Generate new' }} />
      <div className={cn(
        'rounded-2xl border overflow-hidden mb-24 lg:mb-12',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]'
      )}>
        <div className="px-3 sm:px-4 py-1.5">
          {recentReports.map(r => (
            <ReportRow key={r.id} r={r} />
          ))}
        </div>
        <div className="px-4 py-3.5 border-t border-stone-100 dark:border-white/[0.05]
          flex items-center justify-between gap-4">
          <p className="text-[11px] text-stone-400 dark:text-white/25 font-mono">
            Reports are generated on the 1st of each month
          </p>
          <button className="flex items-center gap-2 text-[11px] font-bold
            text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors shrink-0">
            <Calendar size={12} />
            Schedule
          </button>
        </div>
      </div>

    </div>
  );
};

export default ReportsPage;