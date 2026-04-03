import { useState } from 'react';
import { Plus, Send, ArrowLeftRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const CURRENCIES = [
  { code: 'USD', symbol: '$',  balance: '24,500',    cents: '00' },
  { code: 'NGN', symbol: '₦', balance: '18,200,000', cents: '00' },
  { code: 'GBP', symbol: '£', balance: '4,100',      cents: '50' },
  { code: 'EUR', symbol: '€', balance: '3,800',      cents: '20' },
];

const QUICK_ACTIONS = [
  { icon: Plus,           label: 'Add money', primary: true  },
  { icon: Send,           label: 'Send',      primary: false },
  { icon: ArrowLeftRight, label: 'Convert',   primary: false },
  { icon: Clock,          label: 'Request',   primary: false },
];

export const BalanceHero = () => {
  const [activeCur, setActiveCur] = useState(0);
  const cur = CURRENCIES[activeCur];

  return (
    <div className="mb-8 lg:mb-14">

      {/* ── Balance label ── */}
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3
        text-stone-400 dark:text-white/25">
        Total available balance
      </p>

      {/* ── Balance amount ── */}
      <div className="flex items-start gap-2 mb-3 overflow-hidden">
        <span className="font-mono font-light mt-2 shrink-0
          text-base lg:text-xl text-stone-300 dark:text-white/20">
          {cur.symbol}
        </span>
        <span
          key={cur.code}
          className="font-['DM_Serif_Display',_Georgia,_serif] font-normal leading-none
            text-stone-900 dark:text-white transition-all truncate"
          style={{ fontSize: 'clamp(40px, 10vw, 80px)', letterSpacing: '-2px' }}
        >
          {cur.balance}
        </span>
        <span className="font-mono font-light mt-2 shrink-0
          text-base lg:text-lg text-stone-300 dark:text-white/20">
          .{cur.cents}
        </span>
      </div>

      {/* ── Change badge ── */}
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <span className="flex items-center gap-1.5 text-[11px] font-mono
          text-emerald-500 dark:text-emerald-400">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 8V2M2.5 4.5L5 2l2.5 2.5"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          +3.4%
        </span>
        <span className="w-px h-3 bg-stone-200 dark:bg-white/[0.08]" />
        <span className="text-[11px] font-mono text-stone-400 dark:text-white/25">
          vs last month
        </span>
      </div>

      {/* ── Currency switcher ──
          Full-width on mobile (flex-1 per button), natural width on sm+ */}
      <div className="flex gap-1 p-1 rounded-xl mb-8 lg:mb-10
        w-full sm:w-fit
        bg-stone-100 dark:bg-white/[0.04]
        border border-stone-200 dark:border-white/[0.06]">
        {CURRENCIES.map((c, i) => (
          <button
            key={c.code}
            onClick={() => setActiveCur(i)}
            className={cn(
              'flex-1 sm:flex-none px-2 sm:px-4 py-1.5 rounded-lg',
              'text-[11px] font-bold tracking-widest font-mono transition-all',
              activeCur === i
                ? 'bg-[#C9A84C] text-[#0C0C0D] shadow-sm'
                : 'text-stone-500 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/55'
            )}
          >
            {c.code}
          </button>
        ))}
      </div>

      {/* ── Section rule ── */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase shrink-0
          text-stone-400 dark:text-white/25">
          Quick actions
        </span>
        <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
      </div>

      {/* ── Action buttons ──
          2-col grid on mobile, natural row on sm+ */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
        {QUICK_ACTIONS.map(({ icon: Icon, label, primary }) => (
          <button
            key={label}
            className={cn(
              'flex items-center justify-center sm:justify-start gap-2.5',
              'px-4 py-3 sm:py-2.5 rounded-xl',
              'text-[12.5px] font-semibold transition-all tracking-[-0.1px]',
              primary
                ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20'
                : cn(
                    'border',
                    'bg-white dark:bg-white/[0.03]',
                    'border-stone-200 dark:border-white/[0.08]',
                    'text-stone-600 dark:text-white/50',
                    'hover:text-stone-900 dark:hover:text-white',
                    'hover:bg-stone-50 dark:hover:bg-white/[0.06]',
                    'hover:border-stone-300 dark:hover:border-white/[0.14]'
                  )
            )}
          >
            <Icon size={14} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};