import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Info,
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getFlag } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

interface Currency {
  code: string;
  name: string;
  symbol: string;
  balance: number;
  balanceFmt: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar',       symbol: '$',   balance: 14250.60, balanceFmt: '$14,250.60'  },
  { code: 'NGN', name: 'Nigerian Naira',  symbol: '₦',  balance: 850000,   balanceFmt: '₦850,000'    },
  { code: 'GBP', name: 'British Pound',   symbol: '£',   balance: 2100.00,  balanceFmt: '£2,100.00'   },
  { code: 'EUR', name: 'Euro',            symbol: '€',   balance: 0,        balanceFmt: '€0.00'       },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', balance: 0,        balanceFmt: 'CA$0.00'     },
  { code: 'JPY', name: 'Japanese Yen',    symbol: '¥',   balance: 0,        balanceFmt: '¥0.00'       },
];

const RATES: Record<string, number> = {
  USD: 1, NGN: 1618.40, GBP: 0.7912, EUR: 0.9241, CAD: 1.3621, JPY: 149.82,
};

const SPARKLINES: Record<string, number[]> = {
  USD_NGN: Array.from({ length: 30 }, (_, i) => 1580 + i * 1.3 + Math.sin(i * 0.8) * 12),
  NGN_USD: Array.from({ length: 30 }, (_, i) => 0.000610 + i * 0.000002 + Math.sin(i * 0.8) * 0.000005),
  USD_GBP: Array.from({ length: 30 }, (_, i) => 0.785 + Math.sin(i * 0.5) * 0.008),
  GBP_USD: Array.from({ length: 30 }, (_, i) => 1.262 + Math.sin(i * 0.5) * 0.012),
  USD_EUR: Array.from({ length: 30 }, (_, i) => 0.920 + Math.sin(i * 0.6) * 0.006),
  EUR_USD: Array.from({ length: 30 }, (_, i) => 1.080 + Math.sin(i * 0.6) * 0.008),
  GBP_NGN: Array.from({ length: 30 }, (_, i) => 2040 + i * 0.9 + Math.sin(i * 0.7) * 15),
  NGN_GBP: Array.from({ length: 30 }, (_, i) => 0.000490 + Math.sin(i * 0.7) * 0.000004),
};

const FEE_PERCENT  = 0.005;
const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const RECENT_CONVERSIONS = [
  { from: 'USD', to: 'NGN', fromAmt: '$500.00',  toAmt: '₦809,200', rate: '1,618.40', date: '2h ago'    },
  { from: 'GBP', to: 'EUR', fromAmt: '£400.00',  toAmt: '€465.20',  rate: '1.1630',   date: 'Yesterday' },
  { from: 'USD', to: 'GBP', fromAmt: '$1,200.00', toAmt: '£949.44', rate: '0.7912',   date: '3d ago'    },
  { from: 'NGN', to: 'USD', fromAmt: '₦250,000', toAmt: '$154.48',  rate: '0.000618', date: '5d ago'    },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getRate(from: string, to: string): number {
  if (from === to) return 1;
  return RATES[to] / RATES[from];
}

function fmtAmount(val: number, code: string): string {
  if (val === 0) return '0';
  const sym = CURRENCIES.find(c => c.code === code)?.symbol ?? '';
  if (val >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 10_000)    return `${sym}${val.toLocaleString('en', { maximumFractionDigits: 2 })}`;
  return `${sym}${val.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function fmtRate(rate: number): string {
  if (rate >= 1000) return rate.toLocaleString('en', { maximumFractionDigits: 2 });
  if (rate >= 1)    return rate.toFixed(4);
  return rate.toFixed(6);
}

function getSparkline(from: string, to: string): number[] {
  const key  = `${from}_${to}`;
  const rkey = `${to}_${from}`;
  if (SPARKLINES[key])  return SPARKLINES[key];
  if (SPARKLINES[rkey]) return SPARKLINES[rkey].map(v => 1 / v);
  const base = getRate(from, to);
  return Array.from({ length: 30 }, (_, i) => base + Math.sin(i * 0.6) * base * 0.01);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RULE
// ─────────────────────────────────────────────────────────────────────────────

const SectionRule = ({
  label, action,
}: {
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
// CURRENCY SELECTOR — mobile-safe dropdown
// ─────────────────────────────────────────────────────────────────────────────

const CurrencySelector = ({
  selected, exclude, onSelect, label,
}: {
  selected: Currency; exclude: string; onSelect: (c: Currency) => void; label: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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
        {label}
      </p>

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all w-full',
          'bg-white dark:bg-white/[0.03]',
          'border-stone-200 dark:border-white/[0.08]',
          'hover:border-stone-300 dark:hover:border-white/[0.16]',
          open && 'border-[#C9A84C]/40 dark:border-[#C9A84C]/30 bg-[#C9A84C]/[0.03]'
        )}
      >
        <img src={getFlag(selected.code)} alt={selected.code}
          className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-[14px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white leading-none">
            {selected.code}
          </p>
          <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 truncate">
            {selected.name}
          </p>
        </div>
        <ChevronDown size={14}
          className={cn('text-stone-400 dark:text-white/30 transition-transform shrink-0 duration-200',
            open && 'rotate-180')} />
      </button>

      {/* Dropdown — fixed on mobile so it never clips off screen */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setOpen(false)}
          />
          {/* Menu — absolute on desktop, anchored via ref; fixed-width matches trigger */}
          <div
            className={cn(
              'absolute top-full left-0 right-0 mt-1.5 rounded-xl border z-[110] overflow-hidden',
              'bg-white dark:bg-[#1C1C1E]',
              'border-stone-200 dark:border-white/[0.09]',
              'shadow-2xl shadow-black/15 dark:shadow-black/50',
            )}
            style={{ maxHeight: '280px', overflowY: 'auto', scrollbarWidth: 'none' }}
          >
            {CURRENCIES.filter(c => c.code !== exclude).map(c => (
              <button
                key={c.code}
                onClick={() => { onSelect(c); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-3 transition-colors text-left',
                  'border-b border-stone-50 dark:border-white/[0.04] last:border-0',
                  c.code === selected.code
                    ? 'bg-[#C9A84C]/[0.07] dark:bg-[#C9A84C]/[0.10]'
                    : 'hover:bg-stone-50 dark:hover:bg-white/[0.04]'
                )}
              >
                <img src={getFlag(c.code)} alt={c.code}
                  className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-stone-800 dark:text-white/80 leading-none">
                    {c.code}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 truncate">
                    {c.name}
                  </p>
                </div>
                {/* Balance — hidden on very small screens to prevent overflow */}
                <p className="text-[11px] font-mono text-stone-400 dark:text-white/25 shrink-0 hidden xs:block sm:block">
                  {c.balanceFmt}
                </p>
                {c.code === selected.code && (
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
// MINI SPARKLINE
// ─────────────────────────────────────────────────────────────────────────────

const MiniSparkline = ({ data, isUp }: { data: number[]; isUp: boolean }) => {
  const W = 100, H = 36;
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;
  const toX   = (i: number) => (i / (data.length - 1)) * W;
  const toY   = (v: number) => H - ((v - min) / range) * (H - 4) - 2;
  const pts   = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      className="w-[80px] sm:w-[100px]">
      <polyline points={pts} fill="none"
        stroke={isUp ? '#34d399' : '#f87171'}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RATE INFO CARD
// ─────────────────────────────────────────────────────────────────────────────

const RateInfoCard = ({ from, to, rate, sparkData, isUp, change }: {
  from: Currency; to: Currency; rate: number;
  sparkData: number[]; isUp: boolean; change: string;
}) => (
  <div className={cn(
    'rounded-2xl border p-4',
    'bg-white dark:bg-white/[0.02]',
    'border-stone-200 dark:border-white/[0.07]'
  )}>
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Mid-market rate
        </p>
        {/* Rate on its own line so it never needs to wrap awkwardly */}
        <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white truncate"
          style={{ fontSize: 'clamp(14px, 4vw, 20px)', letterSpacing: '-0.3px' }}>
          1 {from.code} = {fmtRate(rate)} {to.code}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={cn(
            'flex items-center gap-1 text-[11px] font-mono',
            isUp ? 'text-emerald-500' : 'text-red-400'
          )}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </span>
          <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
            · 30-day trend
          </span>
        </div>
      </div>
      {/* Sparkline — always visible, scales with CSS */}
      <div className="shrink-0">
        <MiniSparkline data={sparkData} isUp={isUp} />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FEE ROW
// ─────────────────────────────────────────────────────────────────────────────

const FeeRow = ({ label, value, muted, accent, bold }: {
  label: string; value: string; muted?: boolean; accent?: boolean; bold?: boolean;
}) => (
  <div className={cn(
    'flex items-center justify-between py-2 gap-3',
    bold && 'border-t border-stone-100 dark:border-white/[0.06] mt-1 pt-3'
  )}>
    <span className={cn(
      'text-[12px] shrink-0',
      muted  ? 'text-stone-400 dark:text-white/25' : 'text-stone-600 dark:text-white/50',
      bold   && 'font-semibold text-stone-800 dark:text-white/80 text-[13px]'
    )}>
      {label}
    </span>
    <span className={cn(
      'text-[12px] font-mono text-right min-w-0 truncate',
      muted  ? 'text-stone-300 dark:text-white/20' : 'text-stone-700 dark:text-white/65',
      accent && 'text-[#C9A84C]',
      bold   && 'font-bold text-stone-900 dark:text-white text-[13px]'
    )}>
      {value}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// RECENT CONVERSION ROW
// ─────────────────────────────────────────────────────────────────────────────

const RecentConversionRow = ({ item }: { item: typeof RECENT_CONVERSIONS[0] }) => (
  <div className="flex items-center gap-3 py-3.5
    border-b border-stone-100 dark:border-white/[0.04] last:border-0
    hover:bg-stone-50 dark:hover:bg-white/[0.02]
    -mx-2 px-2 rounded-xl transition-colors cursor-pointer group">

    {/* Overlapping flags */}
    <div className="flex items-center shrink-0">
      <img src={getFlag(item.from)} alt={item.from}
        className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-[#111] relative z-10" />
      <img src={getFlag(item.to)} alt={item.to}
        className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-[#111] -ml-2.5" />
    </div>

    {/* Pair + rate */}
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold leading-none tracking-[-0.2px] truncate
        text-stone-800 dark:text-white/80">
        {item.from} → {item.to}
      </p>
      <p className="text-[10px] font-mono mt-0.5 text-stone-400 dark:text-white/25">
        Rate {item.rate}
      </p>
    </div>

    {/* Amounts */}
    <div className="text-right shrink-0">
      <p className="text-[12px] font-mono font-medium tabular-nums leading-none
        text-stone-800 dark:text-white/80">
        {item.toAmt}
      </p>
      <p className="text-[10px] font-mono mt-0.5 text-stone-400 dark:text-white/25">
        {item.fromAmt}
      </p>
    </div>

    {/* Date — only on sm+ */}
    <p className="text-[10px] font-mono text-stone-300 dark:text-white/20 shrink-0 hidden sm:block">
      {item.date}
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// AMOUNT INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────

const AmountInput = ({
  value, onChange, onFocus, symbol, color, isFocused, label, balance, extra,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  symbol: string;
  color: string;
  isFocused: boolean;
  label: string;
  balance: string;
  extra?: React.ReactNode;
}) => (
  <div>
    <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
      text-stone-400 dark:text-white/25">
      {label}
    </p>
    <div className={cn(
      'flex items-center gap-2 rounded-xl border px-4 py-3 transition-colors',
      'bg-stone-50 dark:bg-white/[0.02]',
      isFocused
        ? 'border-[#C9A84C]/50 dark:border-[#C9A84C]/40'
        : 'border-stone-200 dark:border-white/[0.07]'
    )}>
      <span className="font-mono text-[13px] shrink-0 text-stone-300 dark:text-white/20">
        {symbol}
      </span>
      <input
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onFocus={onFocus}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'flex-1 min-w-0 bg-transparent font-mono font-medium outline-none',
          'text-[20px] sm:text-[22px]',
          'placeholder:text-stone-200 dark:placeholder:text-white/10',
          '[appearance:textfield]',
          '[&::-webkit-outer-spin-button]:appearance-none',
          '[&::-webkit-inner-spin-button]:appearance-none',
          color
        )}
      />
      {extra}
    </div>
    <p className="text-[10px] font-mono mt-1.5 px-1 text-stone-300 dark:text-white/20">
      Balance: {balance}
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'form' | 'review' | 'success';

export const SwapPage = () => {
  const [fromCur, setFromCur]       = useState<Currency>(CURRENCIES[0]);
  const [toCur,   setToCur]         = useState<Currency>(CURRENCIES[1]);
  const [fromAmt, setFromAmt]       = useState('');
  const [toAmt,   setToAmt]         = useState('');
  const [editing, setEditing]       = useState<'from' | 'to'>('from');
  const [step,    setStep]          = useState<Step>('form');
  const [swapRot, setSwapRot]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const rate       = getRate(fromCur.code, toCur.code);
  const sparkData  = getSparkline(fromCur.code, toCur.code);
  const sparkIsUp  = sparkData[sparkData.length - 1] >= sparkData[0];
  const sparkPct   = (((sparkData[sparkData.length - 1] - sparkData[0]) / sparkData[0]) * 100).toFixed(2);
  const sparkChg   = `${sparkIsUp ? '+' : ''}${sparkPct}% (30d)`;

  const fromNum = parseFloat(fromAmt) || 0;
  const fee     = fromNum * FEE_PERCENT;
  const youGet  = (fromNum - fee) * rate;

  const syncFrom = useCallback((val: string) => {
    setFromAmt(val);
    const n = parseFloat(val) || 0;
    setToAmt(n > 0 ? ((n - n * FEE_PERCENT) * rate).toFixed(
      rate >= 100 ? 0 : rate >= 1 ? 2 : 6
    ) : '');
  }, [rate]);

  const syncTo = useCallback((val: string) => {
    setToAmt(val);
    const n = parseFloat(val) || 0;
    setFromAmt(n > 0 ? (n / rate / (1 - FEE_PERCENT)).toFixed(2) : '');
  }, [rate]);

  useEffect(() => {
    if (editing === 'from' && fromAmt) syncFrom(fromAmt);
    else if (editing === 'to' && toAmt) syncTo(toAmt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCur.code, toCur.code]);

  const handleSwap = () => {
    setSwapRot(r => !r);
    const pFrom = fromCur, pTo = toCur;
    setFromCur(pTo); setToCur(pFrom);
    if (toAmt) {
      setFromAmt(toAmt);
      const n = parseFloat(toAmt) || 0;
      const nr = getRate(pTo.code, pFrom.code);
      setToAmt(n > 0 ? ((n - n * FEE_PERCENT) * nr).toFixed(nr >= 100 ? 0 : 2) : '');
    }
  };

  const hasValid          = fromNum > 0 && fromNum <= fromCur.balance;
  const insufficientFunds = fromNum > fromCur.balance && fromNum > 0;

  // ────────────────────────────────────────────────────────────── SUCCESS ───
  if (step === 'success') {
    return (
      <div className="w-full max-w-[520px]">
        <div className={cn(
          'rounded-2xl border p-6 sm:p-10 text-center',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10
            flex items-center justify-center mx-auto mb-5
            ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>

          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2
            text-stone-400 dark:text-white/25">
            Conversion complete
          </p>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1 break-all"
            style={{ fontSize: 'clamp(22px, 6vw, 30px)', letterSpacing: '-0.5px' }}>
            {fmtAmount(youGet, toCur.code)}
          </p>
          <p className="text-[13px] text-stone-400 dark:text-white/30 mb-6">
            converted from {fmtAmount(fromNum, fromCur.code)}
          </p>

          <div className={cn(
            'rounded-xl border p-4 text-left mb-5',
            'bg-stone-50 dark:bg-white/[0.02]',
            'border-stone-100 dark:border-white/[0.06]'
          )}>
            {[
              { l: 'Rate',         v: `1 ${fromCur.code} = ${fmtRate(rate)} ${toCur.code}` },
              { l: 'Fee (0.5%)',   v: fmtAmount(fee, fromCur.code) },
              { l: 'You received', v: fmtAmount(youGet, toCur.code) },
              { l: 'Reference',    v: `NXS-${Math.random().toString(36).slice(2, 8).toUpperCase()}` },
            ].map(r => (
              <div key={r.l} className="flex justify-between gap-4 py-1.5">
                <span className="text-[12px] text-stone-400 dark:text-white/30 shrink-0">{r.l}</span>
                <span className="text-[12px] font-mono text-stone-700 dark:text-white/65 text-right truncate">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => { setStep('form'); setFromAmt(''); setToAmt(''); }}
              className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors
                bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]"
            >
              New conversion
            </button>
            <button className={cn(
              'flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-colors border',
              'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.08]',
              'text-stone-600 dark:text-white/50 hover:text-stone-900 dark:hover:text-white'
            )}>
              View history
            </button>
          </div>
        </div>
        <div className="h-24 lg:h-12" />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────── REVIEW ───
  if (step === 'review') {
    return (
      <div className="w-full max-w-[520px]">
        <button
          onClick={() => setStep('form')}
          className="flex items-center gap-2 text-[12px] font-semibold mb-5 transition-colors
            text-stone-400 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/60"
        >
          ← Back
        </button>

        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Review conversion
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-6"
          style={{ fontSize: 'clamp(22px, 5vw, 28px)', letterSpacing: '-0.4px' }}>
          Confirm your order
        </h1>

        <div className={cn(
          'rounded-2xl border p-4 sm:p-5 mb-4',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          {/* Send / receive visual — stacks on very narrow screens */}
          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch xs:items-center gap-3 mb-5 pb-5
            border-b border-stone-100 dark:border-white/[0.06]">

            {/* You send */}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
                text-stone-400 dark:text-white/25">You send</p>
              <div className="flex items-center gap-2.5">
                <img src={getFlag(fromCur.code)} alt={fromCur.code}
                  className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
                <div className="min-w-0">
                  <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white leading-none truncate"
                    style={{ fontSize: 'clamp(18px, 4vw, 22px)', letterSpacing: '-0.3px' }}>
                    {fmtAmount(fromNum, fromCur.code)}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5">{fromCur.code}</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
              bg-stone-100 dark:bg-white/[0.06] self-center mx-auto xs:mx-0">
              <ArrowLeftRight size={13} className="text-stone-500 dark:text-white/40" />
            </div>

            {/* You receive */}
            <div className="flex-1 min-w-0 xs:text-right sm:text-right">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
                text-stone-400 dark:text-white/25">You receive</p>
              <div className="flex items-center gap-2.5 xs:justify-end sm:justify-end">
                <div className="min-w-0">
                  <p className="font-['DM_Serif_Display',_Georgia,_serif] text-emerald-600 dark:text-emerald-400 leading-none truncate"
                    style={{ fontSize: 'clamp(18px, 4vw, 22px)', letterSpacing: '-0.3px' }}>
                    {fmtAmount(youGet, toCur.code)}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 xs:text-right">{toCur.code}</p>
                </div>
                <img src={getFlag(toCur.code)} alt={toCur.code}
                  className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0" />
              </div>
            </div>
          </div>

          {/* Fee table */}
          <FeeRow label="Exchange rate"    value={`1 ${fromCur.code} = ${fmtRate(rate)} ${toCur.code}`} />
          <FeeRow label="You send"         value={fmtAmount(fromNum, fromCur.code)} />
          <FeeRow label="Fee (0.5%)"       value={fmtAmount(fee, fromCur.code)} muted />
          <FeeRow label="Amount converted" value={fmtAmount(fromNum - fee, fromCur.code)} muted />
          <FeeRow label="You receive"      value={fmtAmount(youGet, toCur.code)} bold accent />
        </div>

        {/* Trust indicators */}
        <div className="space-y-2 mb-5">
          {[
            { icon: Zap,    text: 'Funds delivered instantly to your wallet' },
            { icon: Shield, text: 'Rate locked for 30 seconds after confirmation' },
            { icon: Clock,  text: 'Conversions are final and cannot be reversed' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-[11px]
              text-stone-400 dark:text-white/30">
              <Icon size={12} className="shrink-0 text-stone-300 dark:text-white/20" />
              {text}
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep('success')}
          className="w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all
            bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]
            shadow-lg shadow-[#C9A84C]/20"
        >
          Confirm conversion
        </button>
        <div className="h-24 lg:h-12" />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────── FORM ───
  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Currency exchange
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Convert funds
        </h1>
      </div>

      {/* Two-column on desktop, single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-5 lg:gap-8">

        {/* ── LEFT: Converter ── */}
        <div className="space-y-3.5">

          {/* Rate info */}
          <RateInfoCard
            from={fromCur} to={toCur} rate={rate}
            sparkData={sparkData} isUp={sparkIsUp} change={sparkChg}
          />

          {/* Main conversion card */}
          <div className={cn(
            'rounded-2xl border overflow-visible',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <div className="p-4 sm:p-5">

              {/* FROM currency + input */}
              <div className="mb-1">
                <CurrencySelector
                  selected={fromCur} exclude={toCur.code}
                  onSelect={c => { setFromCur(c); setEditing('from'); }}
                  label="You send"
                />
                <div className="mt-2">
                  <AmountInput
                    value={fromAmt}
                    onChange={v => { setEditing('from'); syncFrom(v); }}
                    onFocus={() => setEditing('from')}
                    symbol={fromCur.symbol}
                    color="text-stone-900 dark:text-white"
                    isFocused={editing === 'from'}
                    label=""
                    balance={fromCur.balanceFmt}
                    extra={
                      <button
                        onClick={() => { setEditing('from'); syncFrom(String(fromCur.balance)); }}
                        className="text-[10px] font-mono text-stone-300 dark:text-white/20
                          hover:text-[#C9A84C] transition-colors shrink-0 ml-1"
                      >
                        Max
                      </button>
                    }
                  />
                </div>
                {insufficientFunds && (
                  <p className="text-[11px] font-bold text-red-400 mt-1.5 px-1">
                    Insufficient funds
                  </p>
                )}
              </div>

              {/* Swap button */}
              <div className="flex items-center gap-3 my-3.5">
                <div className="flex-1 h-px bg-stone-100 dark:bg-white/[0.05]" />
                <button
                  onClick={handleSwap}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                    'border border-stone-200 dark:border-white/[0.10]',
                    'bg-white dark:bg-white/[0.04]',
                    'hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/[0.05] hover:text-[#C9A84C]',
                    'text-stone-400 dark:text-white/30 active:scale-90'
                  )}
                >
                  <ArrowLeftRight
                    size={15}
                    style={{
                      transform: `rotate(${swapRot ? 180 : 0}deg)`,
                      transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                </button>
                <div className="flex-1 h-px bg-stone-100 dark:bg-white/[0.05]" />
              </div>

              {/* TO currency + input */}
              <CurrencySelector
                selected={toCur} exclude={fromCur.code}
                onSelect={c => { setToCur(c); setEditing('to'); }}
                label="You receive"
              />
              <div className="mt-2">
                <AmountInput
                  value={toAmt}
                  onChange={v => { setEditing('to'); syncTo(v); }}
                  onFocus={() => setEditing('to')}
                  symbol={toCur.symbol}
                  color="text-emerald-600 dark:text-emerald-400"
                  isFocused={editing === 'to'}
                  label=""
                  balance={toCur.balanceFmt}
                />
              </div>
            </div>

            {/* Quick amount chips — horizontally scrollable, no scrollbar */}
            <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-white/[0.05]">
              <div
                className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase shrink-0
                  text-stone-300 dark:text-white/20 mr-1">
                  Quick
                </span>
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => { setEditing('from'); syncFrom(String(amt)); }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono shrink-0 transition-all border',
                      parseFloat(fromAmt) === amt
                        ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C] shadow-sm'
                        : cn(
                            'bg-stone-50 dark:bg-white/[0.02]',
                            'border-stone-200 dark:border-white/[0.07]',
                            'text-stone-500 dark:text-white/35',
                            'hover:border-[#C9A84C]/30 hover:text-[#C9A84C]/80'
                          )
                    )}
                  >
                    {fromCur.symbol}{amt.toLocaleString()}
                  </button>
                ))}
                <button
                  onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
                  className="ml-auto shrink-0 p-1.5 text-stone-300 dark:text-white/20
                    hover:text-[#C9A84C] transition-colors rounded-lg"
                >
                  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Fee summary bar */}
            {fromNum > 0 && (
              <div className="px-4 sm:px-5 py-2.5 border-t border-stone-100 dark:border-white/[0.05]
                flex items-center gap-2 bg-stone-50 dark:bg-white/[0.01]">
                <Info size={11} className="text-stone-300 dark:text-white/20 shrink-0" />
                <span className="text-[11px] text-stone-400 dark:text-white/25 font-mono truncate">
                  Fee {fmtAmount(fee, fromCur.code)} · Get {fmtAmount(youGet, toCur.code)}
                </span>
              </div>
            )}
          </div>

          {/* CTA button */}
          <button
            disabled={!hasValid}
            onClick={() => setStep('review')}
            className={cn(
              'w-full py-4 rounded-xl text-[14px] font-bold tracking-[-0.2px] transition-all',
              hasValid
                ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-lg shadow-[#C9A84C]/20 active:scale-[0.99]'
                : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
            )}
          >
            {!fromAmt ? 'Enter an amount' : insufficientFunds ? 'Insufficient funds' : 'Review conversion →'}
          </button>
        </div>

        {/* ── RIGHT: Info panel (desktop sidebar / stacks below on mobile) ── */}
        <div className="space-y-5">

          {/* Fee breakdown */}
          <div>
            <SectionRule label="Fee breakdown" />
            <div className={cn(
              'rounded-2xl border p-4',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              {fromNum > 0 ? (
                <>
                  <FeeRow label="Amount to convert" value={fmtAmount(fromNum, fromCur.code)} />
                  <FeeRow label="Exchange rate"      value={fmtRate(rate)} muted />
                  <FeeRow label="Nexus fee (0.5%)"   value={`– ${fmtAmount(fee, fromCur.code)}`} muted />
                  <FeeRow label="Net converted"      value={fmtAmount(fromNum - fee, fromCur.code)} muted />
                  <FeeRow label="You receive"        value={fmtAmount(youGet, toCur.code)} bold accent />
                </>
              ) : (
                <p className="text-[12px] text-stone-300 dark:text-white/20 font-mono py-2">
                  Enter an amount to see breakdown
                </p>
              )}
            </div>
          </div>

          {/* Why Nexus FX */}
          <div>
            <SectionRule label="Why Nexus FX" />
            <div className="space-y-2.5">
              {[
                { icon: Zap,    title: 'Instant settlement',  sub: 'Funds arrive in seconds, not days'   },
                { icon: Shield, title: 'Mid-market rates',    sub: 'No hidden spread, transparent price' },
                { icon: Clock,  title: '24/7 availability',   sub: 'Convert any time, weekends included' },
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

      {/* Recent conversions */}
      <div className="mt-8 lg:mt-10">
        <SectionRule label="Recent conversions" action={{ text: 'View all' }} />
        <div className={cn(
          'rounded-2xl border overflow-hidden',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-200 dark:border-white/[0.07]'
        )}>
          <div className="px-3 sm:px-4 py-1">
            {RECENT_CONVERSIONS.map((item, i) => (
              <RecentConversionRow key={i} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom clearance for mobile nav */}
      <div className="h-24 lg:h-12" />
    </div>
  );
};