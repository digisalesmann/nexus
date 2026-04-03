import {
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import React from 'react';
import { getFlag } from '../lib/utils';
import { cn } from '../lib/utils';

// ── Section rule ──────────────────────────────────────────────────────────────
const SectionRule = ({
  label,
  action,
}: {
  label: string;
  action?: { text: string; onClick?: () => void };
}) => (
  <div className="flex items-center gap-4 mb-6">
    <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-stone-400 dark:text-white/25 shrink-0">
      {label}
    </span>
    <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
    {action && (
      <button
        onClick={action.onClick}
        className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors shrink-0"
      >
        {action.text}
      </button>
    )}
  </div>
);

// ── Account card ──────────────────────────────────────────────────────────────
interface AccountCardProps {
  currency: string;
  label: string;
  balance: string;
  accountNumber: string;
  change?: string;
  up?: boolean;
  primary?: boolean;
}

const AccountCard = ({
  currency,
  label,
  balance,
  accountNumber,
  change,
  up,
  primary,
}: AccountCardProps) => {
  const [copied, setCopied] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(accountNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={cn(
      'relative rounded-2xl p-5 border transition-all cursor-pointer group',
      primary
        ? cn(
            'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08]',
            'border-[#C9A84C]/25 dark:border-[#C9A84C]/20',
            'hover:border-[#C9A84C]/40 dark:hover:border-[#C9A84C]/35'
          )
        : cn(
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]',
            'hover:bg-stone-50 dark:hover:bg-white/[0.04]',
            'hover:border-stone-300 dark:hover:border-white/[0.12]',
            'hover:shadow-sm'
          )
    )}>

      {/* Primary badge */}
      {primary && (
        <span className="absolute top-4 right-14 text-[9px] font-bold tracking-[0.15em] uppercase text-[#C9A84C] bg-[#C9A84C]/12 px-2 py-0.5 rounded-full border border-[#C9A84C]/20">
          Primary
        </span>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <img
            src={getFlag(currency)}
            alt={currency}
            className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-white/[0.08]"
          />
          <div>
            <p className="text-[13px] font-bold text-stone-800 dark:text-white/80 leading-none tracking-[-0.2px]">
              {currency}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-white/25 mt-0.5">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); setHidden((h) => !h); }}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            {hidden
              ? <EyeOff size={13} className="text-stone-300 dark:text-white/20" />
              : <Eye    size={13} className="text-stone-300 dark:text-white/20" />
            }
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <MoreHorizontal size={13} className="text-stone-300 dark:text-white/20" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <p
        className="font-['DM_Serif_Display',_Georgia,_serif] font-normal leading-none text-stone-900 dark:text-white/85 mb-2"
        style={{ fontSize: '28px', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}
      >
        {hidden ? '••••••' : balance}
      </p>

      {change && (
        <div className="flex items-center gap-1.5 mb-2">
          {up
            ? <TrendingUp   size={11} className="text-emerald-500" />
            : <TrendingDown size={11} className="text-red-400" />
          }
          <span className={cn(
            'text-[11px] font-mono',
            up ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-400'
          )}>
            {up ? '+' : ''}{change} this month
          </span>
        </div>
      )}

      {/* Account number */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-white/[0.05]">
        <p className="text-[11px] font-mono text-stone-400 dark:text-white/25 tracking-wider flex-1">
          {hidden ? '•••• •••• ••••' : accountNumber}
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-semibold transition-colors"
        >
          {copied
            ? <CheckCircle2 size={13} className="text-emerald-500" />
            : <Copy         size={13} className="text-stone-300 dark:text-white/20 hover:text-stone-500 dark:hover:text-white/45" />
          }
        </button>
      </div>
    </div>
  );
};

// ── Quick action strip ────────────────────────────────────────────────────────
const QuickAction = ({
  icon: Icon,
  label,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}) => (
  <button className="flex flex-col items-center gap-2.5 group">
    <div className={cn(
      'w-12 h-12 rounded-2xl flex items-center justify-center transition-all border',
      bg,
      'group-hover:scale-105 group-active:scale-95'
    )}>
      <Icon size={16} className={color} />
    </div>
    <span className="text-[11px] font-medium text-stone-500 dark:text-white/40 tracking-[-0.1px]">
      {label}
    </span>
  </button>
);

// ── Mini chart sparkline ──────────────────────────────────────────────────────
const Sparkline = ({ up }: { up: boolean }) => {
  const points = up
    ? '0,38 20,30 40,34 60,22 80,18 100,10 120,8'
    : '0,8 20,12 40,10 60,18 80,24 100,30 120,38';
  const color = up ? '#34d399' : '#f87171';
  return (
    <svg width="60" height="24" viewBox="0 0 120 46" fill="none" preserveAspectRatio="none">
      <polyline points={points} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Currency row ──────────────────────────────────────────────────────────────
interface CurrencyRowProps {
  currency: string;
  label: string;
  balance: string;
  rate: string;
  change: string;
  up: boolean;
}

const CurrencyRow = ({ currency, label, balance, rate, change, up }: CurrencyRowProps) => (
  <div className={cn(
    'flex items-center gap-4 py-4 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group',
    'border-b border-stone-100 dark:border-white/[0.04] last:border-0',
    'hover:bg-white dark:hover:bg-white/[0.02]'
  )}>
    <img
      src={getFlag(currency)}
      alt={currency}
      className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-white/[0.08] shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-stone-800 dark:text-white/80 leading-none tracking-[-0.2px]">
        {currency}
      </p>
      <p className="text-[11px] text-stone-400 dark:text-white/25 mt-0.5">{label}</p>
    </div>
    <div className="shrink-0">
      <Sparkline up={up} />
    </div>
    <div className="text-right shrink-0 w-28">
      <p className="text-[13px] font-medium text-stone-800 dark:text-white/80 font-mono tabular-nums">
        {balance}
      </p>
      <p className="text-[11px] text-stone-400 dark:text-white/25 font-mono mt-0.5">{rate}</p>
    </div>
    <div className="text-right shrink-0 w-16">
      <span className={cn(
        'inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-md',
        up
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
      )}>
        {up ? '+' : ''}{change}
      </span>
    </div>
    <ChevronRight
      size={13}
      className="text-stone-200 dark:text-white/15 shrink-0 group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors"
    />
  </div>
);

// ── Limit bar ─────────────────────────────────────────────────────────────────
const LimitBar = ({
  label,
  used,
  total,
  color,
}: {
  label: string;
  used: number;
  total: number;
  color: string;
}) => {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px] text-stone-500 dark:text-white/35">{label}</span>
        <span className="text-[11px] font-mono text-stone-500 dark:text-white/35">{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-stone-100 dark:bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">$0</span>
        <span className="text-[10px] font-mono text-stone-300 dark:text-white/20">
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const AccountsPage = () => {
  return (
    <div className="w-full max-w-[960px]">

      {/* ── My accounts ── */}
      <SectionRule label="My accounts" action={{ text: '+ Add account' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-14">
        <AccountCard
          currency="USD"
          label="United States Dollar"
          balance="$14,250.60"
          accountNumber="4521 8830 1192 0047"
          change="+$1,140.20"
          up
          primary
        />
        <AccountCard
          currency="GBP"
          label="British Pound Sterling"
          balance="£2,100.00"
          accountNumber="3309 5512 8820 1134"
          change="+£88.00"
          up
        />
        <AccountCard
          currency="NGN"
          label="Nigerian Naira"
          balance="₦850,000.00"
          accountNumber="0123 4567 8901"
          change="-₦12,000.00"
          up={false}
        />
        <AccountCard
          currency="EUR"
          label="European Euro"
          balance="€0.00"
          accountNumber="7712 0044 3391 6680"
        />
      </div>

      {/* ── Quick actions ── */}
      <SectionRule label="Actions" />
      <div className="flex items-start gap-8 mb-14">
        <QuickAction
          icon={ArrowUpRight}
          label="Send"
          color="text-[#C9A84C]"
          bg="bg-[#C9A84C]/10 border-[#C9A84C]/20 dark:bg-[#C9A84C]/[0.08] dark:border-[#C9A84C]/15"
        />
        <QuickAction
          icon={ArrowDownLeft}
          label="Receive"
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 border-emerald-100 dark:bg-emerald-500/[0.08] dark:border-emerald-500/15"
        />
        <QuickAction
          icon={ArrowLeftRight}
          label="Swap"
          color="text-sky-600 dark:text-sky-400"
          bg="bg-sky-50 border-sky-100 dark:bg-sky-500/[0.08] dark:border-sky-500/15"
        />
        <QuickAction
          icon={Plus}
          label="Top up"
          color="text-violet-600 dark:text-violet-400"
          bg="bg-violet-50 border-violet-100 dark:bg-violet-500/[0.08] dark:border-violet-500/15"
        />
      </div>

      {/* ── Account limits ── */}
      <SectionRule label="Account limits" />
      <div className={cn(
        'rounded-2xl border p-6 mb-14',
        'bg-white dark:bg-white/[0.02]',
        'border-stone-200 dark:border-white/[0.07]'
      )}>
        <div className="flex flex-col sm:flex-row gap-8">
          <LimitBar label="Daily send"     used={3200}  total={10000} color="#C9A84C" />
          <LimitBar label="Monthly send"   used={8200}  total={50000} color="#C9A84C" />
          <LimitBar label="Daily receive"  used={5000}  total={20000} color="#34d399" />
        </div>
        <p className="text-[11px] text-stone-400 dark:text-white/20 mt-5 pt-4 border-t border-stone-100 dark:border-white/[0.05] font-mono">
          Limits reset at 00:00 UTC daily ·{' '}
          <button className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors font-bold not-italic">
            Upgrade plan →
          </button>
        </p>
      </div>

      {/* ── Exchange rates ── */}
      <SectionRule label="Exchange rates" action={{ text: 'Refresh' }} />
      <div className="mb-20">
        <CurrencyRow currency="USD" label="United States Dollar"   balance="$14,250.60"   rate="1 USD = 1.000"       change="+0.8%"  up />
        <CurrencyRow currency="GBP" label="British Pound Sterling" balance="£2,100.00"    rate="1 GBP = 1.2634 USD"  change="+1.2%"  up />
        <CurrencyRow currency="EUR" label="European Euro"          balance="€0.00"        rate="1 EUR = 1.0821 USD"  change="-0.2%"  up={false} />
        <CurrencyRow currency="NGN" label="Nigerian Naira"         balance="₦850,000.00"  rate="1 USD = 1,602 NGN"   change="-0.3%"  up={false} />
        <CurrencyRow currency="CAD" label="Canadian Dollar"        balance="$0.00"        rate="1 CAD = 0.7341 USD"  change="+0.1%"  up />
        <CurrencyRow currency="JPY" label="Japanese Yen"           balance="¥0.00"        rate="1 USD = 149.82 JPY"  change="-0.5%"  up={false} />
      </div>

    </div>
  );
};

export default AccountsPage;