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
import { useNavigate } from 'react-router-dom';
import { getFlag } from '../lib/utils';
import { cn } from '../lib/utils';

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
  <div className="flex items-center gap-4 mb-5">
    <span className="text-[9px] font-bold tracking-[0.18em] uppercase shrink-0
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
// ACCOUNT CARD
// ─────────────────────────────────────────────────────────────────────────────

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
      'relative rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer group',
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
        <span className="absolute top-3.5 right-12 text-[9px] font-bold tracking-[0.15em] uppercase
          text-[#C9A84C] bg-[#C9A84C]/12 px-2 py-0.5 rounded-full border border-[#C9A84C]/20">
          Primary
        </span>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          <img
            src={getFlag(currency)}
            alt={currency}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0
              border border-stone-200 dark:border-white/[0.08]"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-stone-800 dark:text-white/80
              leading-none tracking-[-0.2px]">
              {currency}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-white/25 mt-0.5 truncate">
              {label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
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
        className="font-['DM_Serif_Display',_Georgia,_serif] font-normal leading-none
          text-stone-900 dark:text-white/85 mb-2"
        style={{ fontSize: 'clamp(22px, 4vw, 28px)', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}
      >
        {hidden ? '••••••' : balance}
      </p>

      {change && (
        <div className="flex items-center gap-1.5 mb-1">
          {up
            ? <TrendingUp   size={11} className="text-emerald-500 shrink-0" />
            : <TrendingDown size={11} className="text-red-400 shrink-0" />
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
      <div className="flex items-center gap-2 mt-3.5 pt-3.5
        border-t border-stone-100 dark:border-white/[0.05]">
        <p className="text-[11px] font-mono text-stone-400 dark:text-white/25 tracking-wider flex-1 truncate">
          {hidden ? '•••• •••• ••••' : accountNumber}
        </p>
        <button
          onClick={handleCopy}
          className="shrink-0 transition-colors"
        >
          {copied
            ? <CheckCircle2 size={13} className="text-emerald-500" />
            : <Copy         size={13} className="text-stone-300 dark:text-white/20
                hover:text-stone-500 dark:hover:text-white/45" />
          }
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QUICK ACTION
// ─────────────────────────────────────────────────────────────────────────────

const QuickAction = ({
  icon: Icon,
  label,
  color,
  bg,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center gap-2 group flex-1 sm:flex-none"
  >
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

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLINE
// ─────────────────────────────────────────────────────────────────────────────

const Sparkline = ({ up }: { up: boolean }) => {
  const points = up
    ? '0,38 20,30 40,34 60,22 80,18 100,10 120,8'
    : '0,8 20,12 40,10 60,18 80,24 100,30 120,38';
  const color = up ? '#34d399' : '#f87171';
  return (
    <svg width="60" height="24" viewBox="0 0 120 46" fill="none" preserveAspectRatio="none"
      className="w-[50px] sm:w-[60px] shrink-0">
      <polyline points={points} stroke={color} strokeWidth="2.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY ROW
// ─────────────────────────────────────────────────────────────────────────────

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
    'flex items-center gap-3 py-3.5 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group',
    'border-b border-stone-100 dark:border-white/[0.04] last:border-0',
    'hover:bg-white dark:hover:bg-white/[0.02]'
  )}>
    <img
      src={getFlag(currency)}
      alt={currency}
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0
        border border-stone-200 dark:border-white/[0.08]"
    />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-stone-800 dark:text-white/80
        leading-none tracking-[-0.2px]">
        {currency}
      </p>
      <p className="text-[11px] text-stone-400 dark:text-white/25 mt-0.5 truncate hidden sm:block">
        {label}
      </p>
    </div>

    {/* Sparkline — hidden on very small screens */}
    <div className="hidden sm:block shrink-0">
      <Sparkline up={up} />
    </div>

    <div className="text-right shrink-0">
      <p className="text-[12px] sm:text-[13px] font-medium text-stone-800 dark:text-white/80
        font-mono tabular-nums">
        {balance}
      </p>
      <p className="text-[10px] sm:text-[11px] text-stone-400 dark:text-white/25 font-mono mt-0.5
        hidden sm:block">
        {rate}
      </p>
    </div>

    <div className="shrink-0">
      <span className={cn(
        'inline-flex items-center text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md',
        up
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
      )}>
        {up ? '+' : ''}{change}
      </span>
    </div>

    <ChevronRight
      size={13}
      className="text-stone-200 dark:text-white/15 shrink-0
        group-hover:text-stone-400 dark:group-hover:text-white/30 transition-colors
        hidden sm:block"
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LIMIT BAR
// ─────────────────────────────────────────────────────────────────────────────

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
      <div className="h-1.5 rounded-full bg-stone-100 dark:bg-white/[0.06] overflow-hidden">
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

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

const AccountsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Your wallets
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          Accounts
        </h1>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]
        gap-x-8 gap-y-0 items-start">

        {/* ═══════════ LEFT COLUMN ═══════════ */}
        <div>

          {/* Account cards grid */}
          <SectionRule label="My accounts" action={{ text: '+ Add account' }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 lg:mb-10">
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

          {/* Quick actions — flex row, equal-width on mobile */}
          <SectionRule label="Actions" />
          <div className="flex items-start gap-3 sm:gap-6 mb-8 lg:mb-10">
            <QuickAction
              icon={ArrowUpRight}
              label="Send"
              color="text-[#C9A84C]"
              bg="bg-[#C9A84C]/10 border-[#C9A84C]/20 dark:bg-[#C9A84C]/[0.08] dark:border-[#C9A84C]/15"
              onClick={() => navigate('/send')}
            />
            <QuickAction
              icon={ArrowDownLeft}
              label="Receive"
              color="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-50 border-emerald-100 dark:bg-emerald-500/[0.08] dark:border-emerald-500/15"
              onClick={() => navigate('/receive')}
            />
            <QuickAction
              icon={ArrowLeftRight}
              label="Swap"
              color="text-sky-600 dark:text-sky-400"
              bg="bg-sky-50 border-sky-100 dark:bg-sky-500/[0.08] dark:border-sky-500/15"
              onClick={() => navigate('/swap')}
            />
            <QuickAction
              icon={Plus}
              label="Top up"
              color="text-violet-600 dark:text-violet-400"
              bg="bg-violet-50 border-violet-100 dark:bg-violet-500/[0.08] dark:border-violet-500/15"
              onClick={() => navigate('/add-money')}
            />
          </div>

          {/* Exchange rates */}
          <SectionRule label="Exchange rates" action={{ text: 'Refresh' }} />
          <div className={cn(
            'rounded-2xl border overflow-hidden mb-8 lg:mb-10',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <div className="px-3 sm:px-4 py-1">
              <CurrencyRow currency="USD" label="United States Dollar"   balance="$14,250.60"   rate="1 USD = 1.000"       change="+0.8%"  up />
              <CurrencyRow currency="GBP" label="British Pound Sterling" balance="£2,100.00"    rate="1 GBP = 1.2634 USD"  change="+1.2%"  up />
              <CurrencyRow currency="EUR" label="European Euro"          balance="€0.00"        rate="1 EUR = 1.0821 USD"  change="-0.2%"  up={false} />
              <CurrencyRow currency="NGN" label="Nigerian Naira"         balance="₦850,000.00"  rate="1 USD = 1,602 NGN"   change="-0.3%"  up={false} />
              <CurrencyRow currency="CAD" label="Canadian Dollar"        balance="$0.00"        rate="1 CAD = 0.7341 USD"  change="+0.1%"  up />
              <CurrencyRow currency="JPY" label="Japanese Yen"           balance="¥0.00"        rate="1 USD = 149.82 JPY"  change="-0.5%"  up={false} />
            </div>
          </div>

        </div>{/* end left column */}

        {/* ═══════════ RIGHT COLUMN ═══════════ */}
        <div>

          {/* Account limits */}
          <SectionRule label="Account limits" />
          <div className={cn(
            'rounded-2xl border p-4 sm:p-5 mb-8',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.07]'
          )}>
            <div className="flex flex-col gap-5">
              <LimitBar label="Daily send"    used={3200}  total={10000} color="#C9A84C" />
              <LimitBar label="Monthly send"  used={8200}  total={50000} color="#C9A84C" />
              <LimitBar label="Daily receive" used={5000}  total={20000} color="#34d399" />
            </div>
            <p className="text-[11px] text-stone-400 dark:text-white/20 mt-5 pt-4
              border-t border-stone-100 dark:border-white/[0.05] font-mono">
              Limits reset at 00:00 UTC ·{' '}
              <button className="text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors font-bold">
                Upgrade →
              </button>
            </p>
          </div>

          {/* Summary stats */}
          <SectionRule label="Overview" />
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {[
              { label: 'Total balance',  value: '$20,350',  sub: 'across 4 accounts' },
              { label: 'Total received', value: '+$14.2k',  sub: 'this month',        accent: true },
              { label: 'Total sent',     value: '-$8.4k',   sub: 'this month'        },
              { label: 'Currencies',     value: '4',        sub: 'active wallets'    },
            ].map(s => (
              <div key={s.label} className={cn(
                'rounded-2xl border p-3.5 flex flex-col gap-2',
                s.accent
                  ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/20 dark:border-[#C9A84C]/15'
                  : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07]'
              )}>
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase
                  text-stone-400 dark:text-white/25">
                  {s.label}
                </p>
                <p className="font-['DM_Serif_Display',_Georgia,_serif] leading-none
                  text-stone-900 dark:text-white"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)', letterSpacing: '-0.3px' }}>
                  {s.value}
                </p>
                <p className="text-[10px] font-mono text-stone-400 dark:text-white/30">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Security tips card */}
          <div className={cn(
            'rounded-2xl border p-4 sm:p-5',
            'bg-[#C9A84C]/[0.04] dark:bg-[#C9A84C]/[0.06]',
            'border-[#C9A84C]/15'
          )}>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-3
              text-[#C9A84C]/70">
              Account tips
            </p>
            <div className="space-y-2.5">
              {[
                'Enable 2FA to protect your wallets',
                'Set spending limits per account',
                'Review linked devices monthly',
              ].map(tip => (
                <div key={tip} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#C9A84C]/50 mt-1.5 shrink-0" />
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

export default AccountsPage;