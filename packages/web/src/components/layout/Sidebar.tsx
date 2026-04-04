import {
  Home, Repeat, CreditCard, History, Users,
  Settings, LogOut, Landmark, Briefcase, FileText,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: 'Main',
    items: [
      { icon: Home,       label: 'Overview',      href: '/'             },
      { icon: Landmark,   label: 'Accounts',      href: '/accounts'     },
      { icon: Repeat,     label: 'Convert',        href: '/swap'         },
      { icon: History,    label: 'History',        href: '/transactions' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: Briefcase,  label: 'Loans',          href: '/loans'        },
      { icon: CreditCard, label: 'My Cards',        href: '/cards'        },
      { icon: Users,      label: 'Beneficiaries',   href: '/recipients'   },
      { icon: FileText,   label: 'Reports',         href: '/reports'      },
    ],
  },
];

// First 4 shown in bottom nav, rest in "More" sheet
const PRIMARY_NAV  = navGroups[0].items;                          // Overview, Accounts, Convert, History
const SECONDARY_NAV = navGroups[1].items;                         // Loans, Cards, Beneficiaries, Reports

// ─────────────────────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────────────────────

const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect width="22" height="22" rx="6" className="fill-[#C9A84C]" />
    <path d="M5 11h12M5 7.5h8M5 14.5h5" stroke="#0C0C0D" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR (desktop only)
// ─────────────────────────────────────────────────────────────────────────────

export const Sidebar = () => {
  const location  = useLocation();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* ════════════════════════════════ DESKTOP SIDEBAR ══════════════════════ */}
      <aside className={cn(
        'hidden lg:flex flex-col w-[240px] h-screen fixed left-0 top-0 z-[100]',
        'bg-white dark:bg-[#111113]',
        'border-r border-stone-200 dark:border-white/[0.06]',
        'transition-colors duration-300'
      )}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-6 flex items-center gap-3">
          <LogoMark />
          <span className="text-stone-900 dark:text-white font-semibold text-[15px] tracking-[-0.4px]">
            Nexus
          </span>
          <span className="ml-auto text-[9px] font-bold tracking-[0.15em] uppercase
            text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">
            Private
          </span>
        </div>

        <div className="mx-6 h-px bg-stone-100 dark:bg-white/[0.05] mb-5" />

        {/* Nav groups */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-5
          [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[9px] font-bold tracking-[0.18em] uppercase
                text-stone-400 dark:text-white/20">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                        'text-[13px] font-medium transition-all group',
                        isActive
                          ? 'text-stone-900 dark:text-white bg-stone-100 dark:bg-white/[0.06]'
                          : 'text-stone-500 dark:text-white/35 hover:text-stone-800 dark:hover:text-white/65 hover:bg-stone-50 dark:hover:bg-white/[0.03]'
                      )}
                    >
                      {/* Active indicator — small gold dot on the right, no border */}
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-dot"
                          className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
                          transition={{ type: 'spring', bounce: 0.3, duration: 0.35 }}
                        />
                      )}

                      <item.icon
                        size={14}
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive ? 'text-[#C9A84C]' : 'opacity-40 group-hover:opacity-70'
                        )}
                      />
                      <span className="tracking-[-0.1px]">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pt-3 pb-6 border-t border-stone-100 dark:border-white/[0.05] space-y-0.5">
          <Link
            to="/settings"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors',
              'text-stone-500 dark:text-white/35',
              'hover:text-stone-800 dark:hover:text-white/70',
              'hover:bg-stone-50 dark:hover:bg-white/[0.03]'
            )}
          >
            <Settings size={14} className="opacity-40 shrink-0" />
            Settings
          </Link>
          <button className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors',
            'text-red-400/60 dark:text-red-400/40',
            'hover:text-red-500 dark:hover:text-red-400',
            'hover:bg-red-50 dark:hover:bg-red-500/[0.06]'
          )}>
            <LogOut size={14} className="shrink-0" />
            Logout
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3 px-3 pt-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6F2E]
              flex items-center justify-center text-[#0C0C0D] text-[11px] font-bold shrink-0">
              V
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-stone-900 dark:text-white
                leading-none tracking-[-0.2px]">
                Victor
              </p>
              <p className="text-[9px] text-[#C9A84C] font-bold uppercase tracking-[0.15em] mt-0.5">
                Premium
              </p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════ MOBILE BOTTOM NAV ════════════════════ */}
      {/*
        Design: floating pill bar that sits above the safe area.
        4 primary items + a "More" grid button.
        Active item gets a gold filled icon + label; inactive items are just icons.
      */}
      <nav className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 z-[100]',
        'px-3 pb-3 pt-2',
        'bg-transparent pointer-events-none'   // outer wrapper transparent so shadow clips naturally
      )}>
        <div className={cn(
          'pointer-events-auto',
          'flex items-center justify-around',
          'h-[60px] rounded-2xl',
          'bg-white/95 dark:bg-[#111113]/95 backdrop-blur-2xl',
          'border border-stone-200/80 dark:border-white/[0.08]',
          'shadow-lg shadow-black/[0.08] dark:shadow-black/40',
          'px-1'
        )}>

          {/* 4 primary nav items */}
          {PRIMARY_NAV.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 group"
              >
                <div className={cn(
                  'relative flex items-center justify-center w-9 h-8 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-[#C9A84C] shadow-sm shadow-[#C9A84C]/30'
                    : 'group-active:bg-stone-100 dark:group-active:bg-white/[0.06]'
                )}>
                  <item.icon
                    size={17}
                    className={cn(
                      'transition-colors duration-200',
                      isActive
                        ? 'text-[#0C0C0D]'
                        : 'text-stone-400 dark:text-white/30'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[9px] font-bold tracking-wide transition-colors duration-200',
                  isActive
                    ? 'text-[#C9A84C]'
                    : 'text-stone-400 dark:text-white/25'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-stone-200 dark:bg-white/[0.07] shrink-0" />

          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 group"
          >
            <div className="flex items-center justify-center w-9 h-8 rounded-xl transition-all
              group-active:bg-stone-100 dark:group-active:bg-white/[0.06]">
              {/* 2×2 grid of dots — "More" icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="4.5" cy="4.5" r="1.5" className="fill-stone-400 dark:fill-white/30" />
                <circle cx="11.5" cy="4.5" r="1.5" className="fill-stone-400 dark:fill-white/30" />
                <circle cx="4.5" cy="11.5" r="1.5" className="fill-stone-400 dark:fill-white/30" />
                <circle cx="11.5" cy="11.5" r="1.5" className="fill-stone-400 dark:fill-white/30" />
              </svg>
            </div>
            <span className="text-[9px] font-bold tracking-wide text-stone-400 dark:text-white/25">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════ MORE SHEET ═══════════════════════════ */}
      <AnimatePresence>
        {showMore && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
            />

            {/* Sheet */}
            <motion.div
              className="absolute bottom-0 inset-x-0 rounded-t-2xl overflow-hidden
                bg-white dark:bg-[#161618]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.08, duration: 0.38 }}
            >
              {/* Handle + header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <LogoMark />
                  <span className="text-[15px] font-bold tracking-[-0.3px]
                    text-stone-900 dark:text-white">
                    Menu
                  </span>
                </div>
                <button
                  onClick={() => setShowMore(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors
                    text-stone-400 dark:text-white/30
                    hover:bg-stone-100 dark:hover:bg-white/[0.06]
                    hover:text-stone-700 dark:hover:text-white/60"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Finance section — 2×2 grid of icon cards */}
              <div className="px-4 pb-2">
                <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-3
                  text-stone-400 dark:text-white/25">
                  Finance
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SECONDARY_NAV.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setShowMore(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all',
                          isActive
                            ? 'bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.12] border-[#C9A84C]/25'
                            : 'bg-stone-50 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.07] hover:border-stone-300 dark:hover:border-white/[0.14]'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                          isActive
                            ? 'bg-[#C9A84C]/20 dark:bg-[#C9A84C]/[0.15]'
                            : 'bg-white dark:bg-white/[0.06]'
                        )}>
                          <item.icon
                            size={15}
                            className={isActive ? 'text-[#C9A84C]' : 'text-stone-500 dark:text-white/35'}
                          />
                        </div>
                        <span className={cn(
                          'text-[13px] font-semibold tracking-[-0.1px]',
                          isActive
                            ? 'text-[#C9A84C]'
                            : 'text-stone-700 dark:text-white/60'
                        )}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Settings + Logout */}
              <div className="mx-4 my-3 pt-3 border-t border-stone-100 dark:border-white/[0.06]
                flex items-center gap-2">
                <Link
                  to="/settings"
                  onClick={() => setShowMore(false)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl border text-[13px] font-semibold transition-colors',
                    'bg-stone-50 dark:bg-white/[0.03]',
                    'border-stone-200 dark:border-white/[0.07]',
                    'text-stone-600 dark:text-white/50',
                    'hover:text-stone-900 dark:hover:text-white hover:border-stone-300'
                  )}
                >
                  <Settings size={14} className="shrink-0 opacity-60" />
                  Settings
                </Link>
                <button className={cn(
                  'flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl border text-[13px] font-semibold transition-colors',
                  'bg-red-50 dark:bg-red-500/[0.07]',
                  'border-red-100 dark:border-red-500/[0.15]',
                  'text-red-500/80 dark:text-red-400/70',
                  'hover:text-red-500 dark:hover:text-red-400'
                )}>
                  <LogOut size={14} className="shrink-0" />
                  Log out
                </button>
              </div>

              {/* Safe area spacer */}
              <div className="h-6" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};