import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, ArrowLeftRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWallets } from '../hooks/useWallets';
import { CURRENCY_SYMBOLS } from '../lib/utils';

const QUICK_ACTIONS = [
  { icon: Plus,           label: 'Add money', primary: true,  path: '/add-money' },
  { icon: Send,           label: 'Send',      primary: false, path: '/send' },
  { icon: ArrowLeftRight, label: 'Convert',   primary: false, path: '/swap' },
  { icon: Clock,          label: 'Request',   primary: false, path: '/request' },
];

export const BalanceHero = () => {
  const navigate = useNavigate();
  const { wallets, loading } = useWallets();
  const [activeCurIdx, setActiveCurIdx] = useState(0);

  const displayWallets = wallets.length > 0
    ? wallets.slice(0, 5)
    : [{ currency: 'USD', balance: 0, id: '', user_id: '', account_number: '', iban: '', is_primary: true, created_at: '' }];

  const cur = displayWallets[activeCurIdx] ?? displayWallets[0];
  const symbol  = CURRENCY_SYMBOLS[cur.currency] ?? cur.currency;
  const [whole, cents] = cur.balance.toFixed(2).split('.');

  return (
    <div className="mb-8 lg:mb-14">

      <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3
        text-stone-400 dark:text-white/25">
        Total available balance
      </p>

      <div className="flex items-start gap-2 mb-3 overflow-hidden">
        <span className="font-mono font-light mt-2 shrink-0
          text-base lg:text-xl text-stone-300 dark:text-white/20">
          {symbol}
        </span>
        {loading ? (
          <div className="h-16 w-48 rounded-xl bg-stone-200 dark:bg-white/[0.06] animate-pulse" />
        ) : (
          <span
            key={cur.currency}
            className="font-['DM_Serif_Display',_Georgia,_serif] font-normal leading-none
              text-stone-900 dark:text-white transition-all truncate"
            style={{ fontSize: 'clamp(40px, 10vw, 80px)', letterSpacing: '-2px' }}
          >
            {Number(whole).toLocaleString()}
          </span>
        )}
        <span className="font-mono font-light mt-2 shrink-0
          text-base lg:text-lg text-stone-300 dark:text-white/20">
          .{cents ?? '00'}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <span className="text-[11px] font-mono text-stone-400 dark:text-white/25">
          {cur.currency} balance
        </span>
      </div>

      {/* Currency switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-8 lg:mb-10
        w-full sm:w-fit
        bg-stone-100 dark:bg-white/[0.04]
        border border-stone-200 dark:border-white/[0.06]">
        {loading
          ? [1,2,3,4].map(i => (
              <div key={i} className="flex-1 sm:w-16 h-7 rounded-lg
                bg-stone-200 dark:bg-white/[0.08] animate-pulse" />
            ))
          : displayWallets.map((w, i) => (
              <button
                key={w.currency}
                onClick={() => setActiveCurIdx(i)}
                className={cn(
                  'flex-1 sm:flex-none px-2 sm:px-4 py-1.5 rounded-lg',
                  'text-[11px] font-bold tracking-widest font-mono transition-all',
                  activeCurIdx === i
                    ? 'bg-[#C9A84C] text-[#0C0C0D] shadow-sm'
                    : 'text-stone-500 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/55'
                )}
              >
                {w.currency}
              </button>
            ))
        }
      </div>

      {/* Section rule */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase shrink-0
          text-stone-400 dark:text-white/25">
          Quick actions
        </span>
        <div className="flex-1 h-px bg-stone-200 dark:bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
        {QUICK_ACTIONS.map(({ icon: Icon, label, primary, path }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
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
