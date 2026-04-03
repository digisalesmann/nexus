import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Plus,
  Lock,
  Unlock,
  Settings,
  X,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Coffee,
  Plane,
  Wifi,
  Shield,
  Bell,
  Sliders,
  CreditCard,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

type CardNetwork  = 'visa' | 'mastercard';
type CardType     = 'physical' | 'virtual';
type CardStatus   = 'active' | 'frozen' | 'blocked';

interface Card {
  id:         string;
  type:       CardType;
  network:    CardNetwork;
  label:      string;
  last4:      string;
  fullNumber: string;
  expiry:     string;
  cvv:        string;
  holder:     string;
  currency:   string;
  balance:    number;
  balanceFmt: string;
  spent:      number;
  limit:      number;
  status:     CardStatus;
  color:      'dark' | 'gold' | 'slate';
}

interface CardTx {
  id:       string;
  merchant: string;
  category: string;
  amount:   string;
  isDebit:  boolean;
  date:     string;
  icon:     React.ElementType;
}

const CARDS: Card[] = [
  {
    id:         'C001',
    type:       'physical',
    network:    'visa',
    label:      'Primary card',
    last4:      '4782',
    fullNumber: '4521 8830 1192 4782',
    expiry:     '09/27',
    cvv:        '391',
    holder:     'VICTOR OKAFOR',
    currency:   'USD',
    balance:    14250.60,
    balanceFmt: '$14,250.60',
    spent:      3840,
    limit:      10000,
    status:     'active',
    color:      'dark',
  },
  {
    id:         'C002',
    type:       'virtual',
    network:    'mastercard',
    label:      'Virtual card',
    last4:      '9134',
    fullNumber: '5412 7563 0021 9134',
    expiry:     '12/26',
    cvv:        '847',
    holder:     'VICTOR OKAFOR',
    currency:   'USD',
    balance:    2500.00,
    balanceFmt: '$2,500.00',
    spent:      620,
    limit:      2500,
    status:     'active',
    color:      'gold',
  },
  {
    id:         'C003',
    type:       'physical',
    network:    'visa',
    label:      'NGN card',
    last4:      '3301',
    fullNumber: '4716 2290 5583 3301',
    expiry:     '03/26',
    cvv:        '512',
    holder:     'VICTOR OKAFOR',
    currency:   'NGN',
    balance:    850000,
    balanceFmt: '₦850,000',
    spent:      120000,
    limit:      500000,
    status:     'frozen',
    color:      'slate',
  },
];

const CARD_TRANSACTIONS: CardTx[] = [
  { id: 't1', merchant: 'Apple Store',       category: 'Shopping',    amount: '-$299.00',  isDebit: true,  date: 'Today',     icon: ShoppingCart },
  { id: 't2', merchant: 'Starbucks',          category: 'Food & drink',amount: '-$8.50',    isDebit: true,  date: 'Today',     icon: Coffee       },
  { id: 't3', merchant: 'Top-up',             category: 'Credit',      amount: '+$500.00',  isDebit: false, date: 'Yesterday', icon: ArrowDownLeft},
  { id: 't4', merchant: 'Netflix',            category: 'Subscriptions',amount: '-$15.99',  isDebit: true,  date: 'Yesterday', icon: Wifi         },
  { id: 't5', merchant: 'Emirates Airlines',  category: 'Travel',      amount: '-$842.00',  isDebit: true,  date: '2d ago',    icon: Plane        },
  { id: 't6', merchant: 'Amazon',             category: 'Shopping',    amount: '-$124.50',  isDebit: true,  date: '3d ago',    icon: ShoppingCart },
];

const SPENDING_CATS = [
  { label: 'Shopping',     pct: 42, color: '#C9A84C' },
  { label: 'Travel',       pct: 22, color: '#60a5fa' },
  { label: 'Food',         pct: 18, color: '#34d399' },
  { label: 'Subscriptions',pct: 10, color: '#a78bfa' },
  { label: 'Other',        pct: 8,  color: '#94a3b8' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const CARD_THEMES = {
  dark:  { bg: 'from-[#1C1C1E] to-[#2C2C2E]',   text: 'text-white',         sub: 'text-white/40',  chip: 'bg-white/10',     network: 'text-white/60'   },
  gold:  { bg: 'from-[#C9A84C] to-[#8B6F2E]',   text: 'text-[#0C0C0D]',    sub: 'text-black/40',  chip: 'bg-black/10',     network: 'text-black/50'   },
  slate: { bg: 'from-[#374151] to-[#1f2937]',   text: 'text-white',         sub: 'text-white/40',  chip: 'bg-white/10',     network: 'text-white/60'   },
};

function maskNumber(full: string): string {
  const parts = full.split(' ');
  return `${parts[0]} •••• •••• ${parts[3]}`;
}

function pct(used: number, total: number): number {
  return Math.min(100, Math.round((used / total) * 100));
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
// VISA / MASTERCARD LOGOS (pure SVG, no external assets)
// ─────────────────────────────────────────────────────────────────────────────

const VisaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 26" className={className} fill="currentColor">
    <path d="M31.4 1.4L20.2 24.6h-7.4L7.4 6.8C7 5.6 6.7 5.2 5.8 4.7 4.3 3.9 1.8 3.2 0 2.8l.2-.9h11.9c1.5 0 2.9 1 3.2 2.8l3 16 7.4-18.8h7.3l.4.5zM57 16.6c0-7.3-10.1-7.7-10-10.9 0-1 1-2 3.1-2.3 1-.1 3.8-.2 7 1.4l1.2-5.8C56.9-.4 54.7 0 52 0c-6.9 0-11.7 3.7-11.8 8.9-.1 3.9 3.4 6.1 6 7.4 2.7 1.3 3.6 2.2 3.6 3.4 0 1.8-2.1 2.6-4.1 2.7-3.5.1-5.5-.9-7.1-1.7l-1.3 5.9c1.6.7 4.6 1.4 7.7 1.4 7.3 0 12-3.6 12-9.4zm18.1 8h6.4L76.1 1.4h-5.9c-1.3 0-2.4.8-2.9 2L57.8 24.6h7.3l1.4-4h8.9l.7 4zm-7.8-9.5l3.7-10.1 2.1 10.1h-5.8zM40.8 1.4L35 24.6h-7L34 1.4h6.8z"/>
  </svg>
);

const MastercardLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 32" className={className}>
    <circle cx="18" cy="16" r="14" fill="#EB001B" opacity="0.9"/>
    <circle cx="32" cy="16" r="14" fill="#F79E1B" opacity="0.9"/>
    <path d="M25 6.8a14 14 0 0 1 0 18.4A14 14 0 0 1 25 6.8z" fill="#FF5F00" opacity="0.9"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL CARD FACE (front + back)
// ─────────────────────────────────────────────────────────────────────────────

const CardFace = ({
  card, revealed, flipped,
}: {
  card: Card; revealed: boolean; flipped: boolean;
}) => {
  const theme = CARD_THEMES[card.color];
  const isFrozen = card.status === 'frozen';

  return (
    <div
      className="relative w-full select-none"
      style={{ perspective: '1000px', aspectRatio: '1.586' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl p-5 sm:p-6 flex flex-col justify-between',
            'bg-gradient-to-br', theme.bg,
            'overflow-hidden',
            isFrozen && 'opacity-70',
          )}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/[0.04]" />
          <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white/[0.03]" />

          {/* Top row */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className={cn('text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5', theme.sub)}>
                {card.type === 'virtual' ? 'Virtual' : 'Physical'} · {card.currency}
              </p>
              <p className={cn('text-[13px] font-bold tracking-[-0.2px]', theme.text)}>
                {card.label}
              </p>
            </div>
            {card.network === 'visa'
              ? <VisaLogo className={cn('w-10 h-auto', theme.network)} />
              : <MastercardLogo className="w-9 h-auto" />
            }
          </div>

          {/* Chip */}
          <div className="relative z-10">
            <div className={cn(
              'w-9 h-7 rounded-md mb-4 flex items-center justify-center',
              theme.chip
            )}>
              <svg viewBox="0 0 36 28" className="w-6 h-5 opacity-60" fill="none">
                <rect x="1" y="1" width="34" height="26" rx="3" stroke="currentColor" strokeWidth="1.5"
                  className={card.color === 'gold' ? 'text-black/40' : 'text-white/40'} />
                <line x1="1" y1="10" x2="35" y2="10" stroke="currentColor" strokeWidth="1"
                  className={card.color === 'gold' ? 'text-black/30' : 'text-white/30'} />
                <line x1="1" y1="18" x2="35" y2="18" stroke="currentColor" strokeWidth="1"
                  className={card.color === 'gold' ? 'text-black/30' : 'text-white/30'} />
                <line x1="13" y1="1" x2="13" y2="27" stroke="currentColor" strokeWidth="1"
                  className={card.color === 'gold' ? 'text-black/30' : 'text-white/30'} />
                <line x1="23" y1="1" x2="23" y2="27" stroke="currentColor" strokeWidth="1"
                  className={card.color === 'gold' ? 'text-black/30' : 'text-white/30'} />
              </svg>
            </div>

            {/* Card number */}
            <p className={cn(
              'font-mono tracking-[0.18em] mb-4',
              theme.text,
              'text-[13px] sm:text-[15px]'
            )}>
              {revealed ? card.fullNumber : maskNumber(card.fullNumber)}
            </p>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <p className={cn('text-[8px] font-bold tracking-[0.15em] uppercase mb-0.5', theme.sub)}>
                  Card holder
                </p>
                <p className={cn('text-[11px] sm:text-[12px] font-bold tracking-[0.08em]', theme.text)}>
                  {card.holder}
                </p>
              </div>
              <div className="text-right">
                <p className={cn('text-[8px] font-bold tracking-[0.15em] uppercase mb-0.5', theme.sub)}>
                  Expires
                </p>
                <p className={cn('text-[11px] sm:text-[12px] font-bold font-mono', theme.text)}>
                  {card.expiry}
                </p>
              </div>
            </div>
          </div>

          {/* Frozen overlay */}
          {isFrozen && (
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center
              bg-black/20 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full
                bg-black/40 backdrop-blur-sm">
                <Lock size={13} className="text-white/80" />
                <span className="text-[11px] font-bold text-white/80 tracking-[0.08em]">
                  Card frozen
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── BACK ── */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl flex flex-col justify-between overflow-hidden',
            'bg-gradient-to-br', theme.bg,
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Magnetic stripe */}
          <div className={cn(
            'w-full mt-8 h-10',
            card.color === 'gold' ? 'bg-black/25' : 'bg-black/40'
          )} />

          {/* Signature + CVV */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'flex-1 h-9 rounded-md flex items-center px-3',
                card.color === 'gold' ? 'bg-white/30' : 'bg-white/10'
              )}>
                <span className={cn('text-[11px] italic font-serif', theme.sub)}>
                  {card.holder.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className={cn(
                'w-14 h-9 rounded-md flex flex-col items-center justify-center',
                card.color === 'gold' ? 'bg-white/20' : 'bg-white/15'
              )}>
                <p className={cn('text-[7px] font-bold tracking-widest mb-0.5', theme.sub)}>CVV</p>
                <p className={cn('text-[13px] font-bold font-mono', theme.text)}>
                  {revealed ? card.cvv : '•••'}
                </p>
              </div>
            </div>

            <p className={cn('text-[9px] leading-relaxed', theme.sub)}>
              This card is issued by Nexus Financial Services. Use is subject to the cardholder agreement.
              For support: +1 800 NEXUS FIN
            </p>

            <div className="flex items-center justify-between mt-3">
              {card.network === 'visa'
                ? <VisaLogo className={cn('w-8 h-auto', theme.network)} />
                : <MastercardLogo className="w-7 h-auto" />
              }
              <p className={cn('text-[10px] font-mono', theme.sub)}>
                **** {card.last4}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

const CardControls = ({
  card, revealed, flipped,
  onReveal, onFlip, onFreeze, onSettings,
}: {
  card: Card;
  revealed: boolean;
  flipped: boolean;
  onReveal: () => void;
  onFlip: () => void;
  onFreeze: () => void;
  onSettings: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(card.fullNumber.replace(/\s/g, '')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const actions = [
    {
      icon: revealed ? EyeOff : Eye,
      label: revealed ? 'Hide' : 'Show',
      onClick: onReveal,
      active: revealed,
    },
    {
      icon: flipped ? CreditCard : RefreshCw,
      label: flipped ? 'Front' : 'Flip',
      onClick: onFlip,
      active: flipped,
    },
    {
      icon: copied ? CheckCircle2 : Copy,
      label: copied ? 'Copied!' : 'Copy',
      onClick: handleCopy,
      active: copied,
    },
    {
      icon: card.status === 'frozen' ? Unlock : Lock,
      label: card.status === 'frozen' ? 'Unfreeze' : 'Freeze',
      onClick: onFreeze,
      active: card.status === 'frozen',
      danger: card.status !== 'frozen',
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onSettings,
      active: false,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5
      [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={cn(
            'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border shrink-0 transition-all',
            'min-w-[60px]',
            a.active && !a.danger
              ? 'bg-[#C9A84C]/10 border-[#C9A84C]/25 text-[#C9A84C]'
              : a.active && a.danger
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400'
              : cn(
                  'bg-white dark:bg-white/[0.02]',
                  'border-stone-200 dark:border-white/[0.07]',
                  'text-stone-500 dark:text-white/40',
                  'hover:border-stone-300 dark:hover:border-white/[0.14]',
                  'hover:text-stone-800 dark:hover:text-white/65'
                )
          )}
        >
          <a.icon size={15} />
          <span className="text-[10px] font-bold">{a.label}</span>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SPENDING PROGRESS
// ─────────────────────────────────────────────────────────────────────────────

const SpendingBar = ({ card }: { card: Card }) => {
  const used    = pct(card.spent, card.limit);
  const isNear  = used >= 80;
  const color   = isNear ? '#f87171' : '#C9A84C';
  const sym     = card.currency === 'NGN' ? '₦' : '$';

  return (
    <div className={cn(
      'rounded-2xl border p-4',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase
          text-stone-400 dark:text-white/25">
          Monthly spending limit
        </p>
        <span className={cn(
          'text-[10px] font-bold font-mono px-2 py-0.5 rounded-full',
          isNear
            ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
            : 'text-[#C9A84C] bg-[#C9A84C]/10'
        )}>
          {used}% used
        </span>
      </div>

      <div className="h-2 rounded-full overflow-hidden bg-stone-100 dark:bg-white/[0.06] mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${used}%`, background: color }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-[11px] font-mono text-stone-500 dark:text-white/40">
          {sym}{card.spent.toLocaleString()} spent
        </span>
        <span className="text-[11px] font-mono text-stone-300 dark:text-white/20">
          {sym}{card.limit.toLocaleString()} limit
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SPENDING BREAKDOWN DONUT
// ─────────────────────────────────────────────────────────────────────────────

const SpendingBreakdown = () => {
  const R = 48, cx = 60, cy = 60, stroke = 14;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className={cn(
      'rounded-2xl border p-4',
      'bg-white dark:bg-white/[0.02]',
      'border-stone-200 dark:border-white/[0.07]'
    )}>
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-4
        text-stone-400 dark:text-white/25">
        Spending by category
      </p>
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120"
            className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px]">
            <circle cx={cx} cy={cy} r={R} fill="none" strokeWidth={stroke}
              className="stroke-stone-100 dark:stroke-white/[0.05]" />
            {SPENDING_CATS.map((seg, i) => {
              const dash   = (seg.pct / 100) * circ;
              const gap    = circ - dash;
              const rotate = (offset / 100) * 360 - 90;
              offset += seg.pct;
              return (
                <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                  stroke={seg.color} strokeWidth={stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  style={{ transform: `rotate(${rotate}deg)`, transformOrigin: `${cx}px ${cy}px` }}
                  strokeLinecap="butt" />
              );
            })}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9"
              className="fill-stone-400 dark:fill-white/30">This month</text>
            <text x={cx} y={cx + 8} textAnchor="middle" fontSize="13" fontWeight="600"
              className="fill-stone-900 dark:fill-white" fontFamily="'DM Mono', monospace">
              $3,840
            </text>
          </svg>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {SPENDING_CATS.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] flex-1 truncate text-stone-600 dark:text-white/50">
                {s.label}
              </span>
              <span className="text-[11px] font-mono shrink-0 text-stone-400 dark:text-white/30">
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const CardTxRow = ({ tx }: { tx: CardTx }) => {
  const Icon = tx.icon;
  const iconBg = tx.isDebit
    ? 'bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.08] text-[#C9A84C]'
    : 'bg-emerald-50 dark:bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400';

  return (
    <div className="flex items-center gap-3 py-3
      border-b border-stone-100 dark:border-white/[0.04] last:border-0
      hover:bg-stone-50 dark:hover:bg-white/[0.02]
      -mx-2 px-2 rounded-xl transition-colors cursor-pointer group">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-none tracking-[-0.2px] truncate
          text-stone-800 dark:text-white/80">
          {tx.merchant}
        </p>
        <p className="text-[10px] mt-0.5 truncate text-stone-400 dark:text-white/25">
          {tx.category}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn(
          'text-[13px] font-mono font-medium tabular-nums leading-none',
          tx.isDebit ? 'text-stone-700 dark:text-white/65' : 'text-emerald-600 dark:text-emerald-400'
        )}>
          {tx.amount}
        </p>
        <p className="text-[10px] font-mono mt-0.5 text-stone-300 dark:text-white/20">
          {tx.date}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD SETTINGS SHEET
// ─────────────────────────────────────────────────────────────────────────────

const CardSettingsSheet = ({ card, onClose, onFreeze }: {
  card: Card; onClose: () => void; onFreeze: () => void;
}) => {
  const settings = [
    { icon: Bell,         label: 'Transaction alerts',  sub: 'Push + email on every transaction', toggled: true  },
    { icon: ArrowUpRight, label: 'Online payments',     sub: 'Allow card for online purchases',   toggled: true  },
    { icon: Plane,        label: 'International use',   sub: 'Enable payments abroad',            toggled: false },
    { icon: Sliders,      label: 'Contactless',         sub: 'Enable tap-to-pay',                 toggled: true  },
  ];

  const [toggles, setToggles] = useState(
    Object.fromEntries(settings.map(s => [s.label, s.toggled]))
  );

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={cn(
          'fixed z-[160] bg-white dark:bg-[#161618]',
          'border-stone-200 dark:border-white/[0.08]',
          '[&::-webkit-scrollbar]:hidden',
          'bottom-0 left-0 right-0 rounded-t-2xl border-t',
          'p-5 pb-10 max-h-[85vh] overflow-y-auto',
          'lg:bottom-auto lg:top-0 lg:right-0 lg:left-auto',
          'lg:h-full lg:w-[380px] lg:rounded-none lg:rounded-l-2xl',
          'lg:border-t-0 lg:border-l lg:overflow-y-auto lg:p-8'
        )}
      >
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10]
          mx-auto mb-5 lg:hidden" />

        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5
              text-stone-400 dark:text-white/25">
              Card settings
            </p>
            <p className="text-[15px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white">
              {card.label} ···· {card.last4}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        {/* Toggle settings */}
        <div className={cn(
          'rounded-xl border divide-y overflow-hidden mb-4',
          'border-stone-100 dark:border-white/[0.06]',
          'divide-stone-100 dark:divide-white/[0.06]'
        )}>
          {settings.map(s => (
            <div key={s.label}
              className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-white/[0.01]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                bg-stone-100 dark:bg-white/[0.06]">
                <s.icon size={14} className="text-stone-500 dark:text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-stone-800 dark:text-white/80 leading-none">
                  {s.label}
                </p>
                <p className="text-[10px] text-stone-400 dark:text-white/25 mt-0.5 truncate">
                  {s.sub}
                </p>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setToggles(t => ({ ...t, [s.label]: !t[s.label] }))}
                className={cn(
                  'relative w-10 h-5.5 rounded-full shrink-0 transition-colors duration-200',
                  toggles[s.label]
                    ? 'bg-[#C9A84C]'
                    : 'bg-stone-200 dark:bg-white/[0.10]'
                )}
                style={{ width: 40, height: 22 }}
              >
                <span
                  className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                  style={{ left: toggles[s.label] ? 20 : 3 }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Spending limit */}
        <div className={cn(
          'rounded-xl border p-4 mb-4',
          'bg-white dark:bg-white/[0.02]',
          'border-stone-100 dark:border-white/[0.06]'
        )}>
          <p className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-3">
            Spending limit
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              defaultValue={card.limit}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border text-[13px] font-mono outline-none
                bg-stone-50 dark:bg-white/[0.02]
                border-stone-200 dark:border-white/[0.08]
                text-stone-900 dark:text-white
                focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button className="px-4 py-2 rounded-lg text-[12px] font-bold transition-colors
              bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shrink-0">
              Save
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="space-y-2.5">
          <button
            onClick={onFreeze}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-bold transition-colors',
              card.status === 'frozen'
                ? 'bg-emerald-50 dark:bg-emerald-500/[0.07] border-emerald-200 dark:border-emerald-500/[0.15] text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08] text-stone-600 dark:text-white/50 hover:border-stone-300'
            )}
          >
            {card.status === 'frozen'
              ? <Unlock size={15} className="shrink-0" />
              : <Lock size={15} className="shrink-0" />
            }
            {card.status === 'frozen' ? 'Unfreeze card' : 'Freeze card'}
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-bold
            transition-colors bg-red-50 dark:bg-red-500/[0.07]
            border-red-200 dark:border-red-500/[0.15]
            text-red-500 dark:text-red-400
            hover:bg-red-100 dark:hover:bg-red-500/[0.12]">
            <Trash2 size={15} className="shrink-0" />
            Block & replace card
          </button>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD CARD SHEET
// ─────────────────────────────────────────────────────────────────────────────

const AddCardSheet = ({ onClose }: { onClose: () => void }) => {
  const [type, setType] = useState<'virtual' | 'physical'>('virtual');

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={cn(
          'fixed z-[160] bg-white dark:bg-[#161618]',
          'border-stone-200 dark:border-white/[0.08]',
          '[&::-webkit-scrollbar]:hidden',
          'bottom-0 left-0 right-0 rounded-t-2xl border-t',
          'p-5 pb-10 max-h-[80vh] overflow-y-auto',
          'lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2',
          'lg:w-[440px] lg:rounded-2xl lg:border lg:max-h-[85vh]'
        )}
      >
        <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-white/[0.10]
          mx-auto mb-5 lg:hidden" />

        <div className="flex items-center justify-between mb-5">
          <p className="text-[15px] font-bold tracking-[-0.2px] text-stone-900 dark:text-white">
            Add new card
          </p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              text-stone-400 dark:text-white/30 hover:bg-stone-100 dark:hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        {/* Card type selector */}
        <div className="flex gap-2.5 mb-5">
          {(['virtual', 'physical'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'flex-1 py-3 rounded-xl border text-[12.5px] font-bold transition-all',
                type === t
                  ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#C9A84C]'
                  : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08] text-stone-500 dark:text-white/35'
              )}
            >
              {t === 'virtual' ? '💳 Virtual' : '💳 Physical'}
            </button>
          ))}
        </div>

        {type === 'virtual' && (
          <div className={cn(
            'rounded-xl border p-4 mb-5',
            'bg-emerald-50 dark:bg-emerald-500/[0.06]',
            'border-emerald-100 dark:border-emerald-500/[0.15]'
          )}>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Virtual cards are issued instantly and can be used for online payments immediately.
              </p>
            </div>
          </div>
        )}

        {type === 'physical' && (
          <div className={cn(
            'rounded-xl border p-4 mb-5',
            'bg-stone-50 dark:bg-white/[0.02]',
            'border-stone-100 dark:border-white/[0.06]'
          )}>
            <p className="text-[11px] text-stone-500 dark:text-white/40">
              Physical cards are delivered in 3–5 business days to your registered address.
            </p>
          </div>
        )}

        {[
          { label: 'Card label',     placeholder: 'e.g. Shopping card',    type: 'text'  },
          { label: 'Linked account', placeholder: 'USD · $14,250.60',      type: 'text'  },
          { label: 'Spending limit', placeholder: '$5,000.00',             type: 'number'},
        ].map(f => (
          <div key={f.label} className="mb-4">
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
                'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40',
                '[appearance:textfield]',
                '[&::-webkit-outer-spin-button]:appearance-none',
                '[&::-webkit-inner-spin-button]:appearance-none'
              )}
            />
          </div>
        ))}

        <button className="w-full py-3.5 rounded-xl text-[13px] font-bold transition-all
          bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]
          shadow-md shadow-[#C9A84C]/20">
          {type === 'virtual' ? 'Create virtual card instantly' : 'Order physical card'}
        </button>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD SELECTOR TABS (mini card thumbnails)
// ─────────────────────────────────────────────────────────────────────────────

const CardTabs = ({ cards, activeId, onSelect }: {
  cards: Card[]; activeId: string; onSelect: (id: string) => void;
}) => (
  <div className="flex gap-2.5 overflow-x-auto pb-1
    [&::-webkit-scrollbar]:hidden"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    {cards.map(c => {
      const theme = CARD_THEMES[c.color];
      const isActive = c.id === activeId;
      return (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn(
            'flex flex-col items-start shrink-0 rounded-xl p-3 border transition-all',
            'w-[130px] sm:w-[150px]',
            `bg-gradient-to-br ${theme.bg}`,
            isActive
              ? 'ring-2 ring-[#C9A84C]/50 ring-offset-2 ring-offset-[#F5F3EF] dark:ring-offset-[#0C0C0D]'
              : 'opacity-60 hover:opacity-80',
            c.status === 'frozen' && 'opacity-40',
            'border-transparent'
          )}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className={cn('w-5 h-4 rounded-sm', theme.chip)} />
            {c.network === 'visa'
              ? <VisaLogo className={cn('w-7 h-auto', theme.network)} />
              : <MastercardLogo className="w-6 h-auto" />
            }
          </div>
          <p className={cn('text-[11px] font-mono tracking-wider', theme.text)}>
            ···· {c.last4}
          </p>
          <p className={cn('text-[9px] mt-0.5 truncate w-full', theme.sub)}>
            {c.label}
          </p>
          {c.status === 'frozen' && (
            <div className="flex items-center gap-1 mt-1">
              <Lock size={8} className={theme.sub.replace('text-', 'text-')} />
              <span className={cn('text-[8px] font-bold', theme.sub)}>Frozen</span>
            </div>
          )}
        </button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const CardsPage = () => {
  const [cards, setCards]             = useState<Card[]>(CARDS);
  const [activeId, setActiveId]       = useState(CARDS[0].id);
  const [revealed, setRevealed]       = useState(false);
  const [flipped, setFlipped]         = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const card = cards.find(c => c.id === activeId) ?? cards[0];

  const handleSelectCard = (id: string) => {
    setActiveId(id);
    setRevealed(false);
    setFlipped(false);
  };

  const handleFreeze = () => {
    setCards(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, status: c.status === 'frozen' ? 'active' : 'frozen' }
        : c
    ));
  };

  const totalSpent    = cards.reduce((s, c) => s + c.spent, 0);
  const activeCards   = cards.filter(c => c.status === 'active').length;
  const frozenCards   = cards.filter(c => c.status === 'frozen').length;

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1
          text-stone-400 dark:text-white/25">
          Payment cards
        </p>
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.8px' }}>
          My Cards
        </h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-6 lg:mb-8">
        {[
          { label: 'Total cards',   value: String(cards.length), sub: `${activeCards} active` },
          { label: 'Frozen',        value: String(frozenCards),  sub: 'tap to unfreeze'       },
          { label: 'Monthly spend', value: `$${(totalSpent / 1000).toFixed(1)}k`, sub: 'this month', accent: true },
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
              style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', letterSpacing: '-0.3px' }}>
              {s.value}
            </p>
            <p className="text-[10px] font-mono text-stone-400 dark:text-white/30">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-5 lg:gap-8">

        {/* ── LEFT: Card display ── */}
        <div className="space-y-4">

          {/* Card tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase
                text-stone-400 dark:text-white/25">
                Select card
              </p>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] uppercase
                  text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors"
              >
                <Plus size={12} />
                Add card
              </button>
            </div>
            <CardTabs cards={cards} activeId={activeId} onSelect={handleSelectCard} />
          </div>

          {/* Active card face */}
          <div className="max-w-[420px]">
            <CardFace card={card} revealed={revealed} flipped={flipped} />
          </div>

          {/* Card controls */}
          <CardControls
            card={card}
            revealed={revealed}
            flipped={flipped}
            onReveal={() => setRevealed(r => !r)}
            onFlip={() => setFlipped(f => !f)}
            onFreeze={handleFreeze}
            onSettings={() => setShowSettings(true)}
          />

          {/* Card number detail (when revealed) */}
          {revealed && !flipped && (
            <div className={cn(
              'rounded-2xl border p-4',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-3
                text-stone-400 dark:text-white/25">
                Card details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Card number', value: card.fullNumber },
                  { label: 'Expiry',      value: card.expiry     },
                  { label: 'CVV',         value: card.cvv        },
                ].map(d => (
                  <div key={d.label} className={cn(
                    'rounded-xl p-3 border',
                    'bg-stone-50 dark:bg-white/[0.02]',
                    'border-stone-100 dark:border-white/[0.06]'
                  )}>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1.5
                      text-stone-400 dark:text-white/25">
                      {d.label}
                    </p>
                    <p className="text-[13px] font-mono font-bold text-stone-900 dark:text-white">
                      {d.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spending limit bar */}
          <SpendingBar card={card} />

          {/* Card transactions */}
          <div>
            <SectionRule label={`Recent transactions · ${card.label}`} action={{ text: 'View all' }} />
            <div className={cn(
              'rounded-2xl border overflow-hidden',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              <div className="px-3 sm:px-4 py-1">
                {CARD_TRANSACTIONS.map(tx => (
                  <CardTxRow key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Insights + security ── */}
        <div className="space-y-4">

          {/* Spending breakdown */}
          <div>
            <SectionRule label="Spending breakdown" />
            <SpendingBreakdown />
          </div>

          {/* Security info */}
          <div>
            <SectionRule label="Card security" />
            <div className="space-y-2.5">
              {[
                { icon: Shield,    title: '3D Secure enabled',    sub: 'Extra verification on online payments' },
                { icon: Bell,      title: 'Instant alerts',       sub: 'Notified on every transaction'        },
                { icon: Lock,      title: 'Freeze protection',    sub: 'Freeze your card in one tap'          },
                { icon: RefreshCw, title: 'Virtual card refresh', sub: 'Generate new number anytime'          },
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

          {/* Manage all cards */}
          <div>
            <SectionRule label="All cards" />
            <div className={cn(
              'rounded-2xl border overflow-hidden',
              'bg-white dark:bg-white/[0.02]',
              'border-stone-200 dark:border-white/[0.07]'
            )}>
              {cards.map((c, i) => {
                const theme = CARD_THEMES[c.color];
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCard(c.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left',
                      i < cards.length - 1 && 'border-b border-stone-100 dark:border-white/[0.04]',
                      c.id === activeId
                        ? 'bg-[#C9A84C]/[0.04] dark:bg-[#C9A84C]/[0.06]'
                        : 'hover:bg-stone-50 dark:hover:bg-white/[0.02]'
                    )}
                  >
                    {/* Mini card swatch */}
                    <div className={cn(
                      'w-10 h-6 rounded-md shrink-0 bg-gradient-to-br',
                      theme.bg
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold leading-none tracking-[-0.2px]
                        text-stone-800 dark:text-white/80">
                        {c.label}
                      </p>
                      <p className="text-[10px] font-mono mt-0.5 text-stone-400 dark:text-white/25">
                        ···· {c.last4} · {c.currency}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn(
                        'text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full',
                        c.status === 'active'
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                          : c.status === 'frozen'
                          ? 'text-[#C9A84C] bg-[#C9A84C]/10'
                          : 'text-red-400 bg-red-50 dark:bg-red-500/10'
                      )}>
                        {c.status}
                      </span>
                    </div>
                    <ChevronRight size={13}
                      className="text-stone-200 dark:text-white/15 shrink-0
                        group-hover:text-stone-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom clearance for mobile nav */}
      <div className="h-24 lg:h-12" />

      {/* Sheets */}
      {showSettings && (
        <CardSettingsSheet
          card={card}
          onClose={() => setShowSettings(false)}
          onFreeze={() => { handleFreeze(); setShowSettings(false); }}
        />
      )}
      {showAddCard && (
        <AddCardSheet onClose={() => setShowAddCard(false)} />
      )}
    </div>
  );
};

export default CardsPage;