import {
  Home, Repeat, CreditCard, History, Users,
  Settings, LogOut, Landmark, Briefcase, FileText,
  MoreHorizontal, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const navGroups = [
  {
    label: 'Main',
    items: [
      { icon: Home,      label: 'Overview',      href: '/' },
      { icon: Landmark,  label: 'Accounts',      href: '/accounts' },
      { icon: Repeat,    label: 'Convert',        href: '/swap' },
      { icon: History,   label: 'History',        href: '/transactions' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: Briefcase,  label: 'Loans',          href: '/loans' },
      { icon: CreditCard, label: 'My Cards',        href: '/cards' },
      { icon: Users,      label: 'Beneficiaries',   href: '/recipients' },
      { icon: FileText,   label: 'Reports',         href: '/reports' },
    ],
  },
];

const allItems = navGroups.flatMap((g) => g.items);

// ── Logo mark ─────────────────────────────────────────────────────────────────
const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect width="22" height="22" rx="6" className="fill-[#C9A84C]" />
    <path d="M5 11h12M5 7.5h8M5 14.5h5" stroke="#0C0C0D" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Sidebar = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className={cn(
        'hidden lg:flex flex-col w-[240px] h-screen fixed left-0 top-0 z-[100]',
        'bg-white dark:bg-[#111113]',
        'border-r border-stone-200 dark:border-white/[0.06]',
        'transition-colors duration-300'
      )}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-8 flex items-center gap-3">
          <LogoMark />
          <span className="text-stone-900 dark:text-white font-semibold text-[15px] tracking-[-0.4px]">
            Nexus
          </span>
          <span className="ml-auto text-[9px] font-bold tracking-[0.15em] uppercase text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">
            Private
          </span>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-stone-100 dark:bg-white/[0.05] mb-6" />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[9px] font-bold tracking-[0.18em] uppercase text-stone-400 dark:text-white/20">
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
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors',
                        isActive
                          ? 'text-stone-900 dark:text-white'
                          : 'text-stone-500 dark:text-white/35 hover:text-stone-800 dark:hover:text-white/65 hover:bg-stone-100 dark:hover:bg-white/[0.04]'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-pill"
                          className="absolute inset-0 rounded-xl bg-stone-100 dark:bg-white/[0.06]"
                          style={{ borderLeft: '2px solid #C9A84C' }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                      <item.icon
                        size={14}
                        className={cn(
                          'z-10 shrink-0 transition-colors',
                          isActive ? 'text-[#C9A84C]' : 'opacity-50'
                        )}
                      />
                      <span className="z-10 tracking-[-0.1px]">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pt-4 pb-6 border-t border-stone-100 dark:border-white/[0.05] space-y-0.5">
          <Link
            to="/settings"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors',
              'text-stone-500 dark:text-white/35',
              'hover:text-stone-800 dark:hover:text-white/70',
              'hover:bg-stone-100 dark:hover:bg-white/[0.04]'
            )}
          >
            <Settings size={14} className="opacity-50 shrink-0" />
            Settings
          </Link>
          <button className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors',
            'text-red-400/70 dark:text-red-400/50',
            'hover:text-red-500 dark:hover:text-red-400',
            'hover:bg-red-50 dark:hover:bg-red-500/[0.06]'
          )}>
            <LogOut size={14} className="shrink-0" />
            Logout
          </button>

          {/* Avatar row */}
          <div className="flex items-center gap-3 px-3 pt-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6F2E] flex items-center justify-center text-[#0C0C0D] text-[11px] font-bold shrink-0">
              V
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-stone-900 dark:text-white leading-none tracking-[-0.2px]">
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

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────────── */}
      <nav className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 h-[64px] z-[100]',
        'bg-white/95 dark:bg-[#111113]/95 backdrop-blur-2xl',
        'border-t border-stone-200 dark:border-white/[0.06]',
        'px-2 flex items-center justify-around'
      )}>
        {allItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <div className={cn(
                'p-2 rounded-xl transition-all',
                isActive
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                  : 'text-stone-400 dark:text-white/30'
              )}>
                <item.icon size={18} />
              </div>
              <span className={cn(
                'text-[9px] font-bold tracking-wide uppercase transition-colors',
                isActive
                  ? 'text-[#C9A84C]'
                  : 'text-stone-400 dark:text-white/25'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setShowMore(true)}
          className="flex flex-col items-center gap-1 px-3 py-1"
        >
          <div className="p-2 rounded-xl text-stone-400 dark:text-white/30">
            <MoreHorizontal size={18} />
          </div>
          <span className="text-[9px] font-bold tracking-wide uppercase text-stone-400 dark:text-white/25">
            More
          </span>
        </button>
      </nav>

      {/* ── MOBILE MORE SHEET ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMore && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              className="absolute bottom-0 inset-x-0 bg-white dark:bg-[#161618] rounded-t-2xl p-6 pb-10"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-stone-900 dark:text-white font-semibold text-[15px] tracking-[-0.3px]">
                  More
                </span>
                <button
                  onClick={() => setShowMore(false)}
                  className="text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-white/[0.06]"
                >
                  ×
                </button>
              </div>
              <div className="space-y-0.5">
                {allItems.slice(4).map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] font-medium transition-colors',
                        isActive
                          ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                          : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className="shrink-0" />
                        {item.label}
                      </div>
                      <ChevronRight size={13} className="opacity-30" />
                    </Link>
                  );
                })}

                <div className="pt-3 border-t border-stone-100 dark:border-white/[0.06] mt-3 space-y-0.5">
                  <button className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-medium transition-colors',
                    'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/[0.04]'
                  )}>
                    <Settings size={16} /> Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-medium text-red-400/70 hover:text-red-500 transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};