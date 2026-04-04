import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Globe,
  ChevronDown,
  X,
  Moon,
  Sun,
  Settings,
  LogOut,
  Home,
  Repeat,
  CreditCard,
  History,
  Users,
  Landmark,
  Briefcase,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type LanguageCode = 'en' | 'es' | 'fr';

// ── Inline SVG flag icons (no emoji, no external assets) ──────────────────────

const FlagUS = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" className="shrink-0 rounded-sm overflow-hidden">
    <rect width="20" height="14" fill="#B22234"/>
    {[0,2,4,6,8,10,12].map(y => <rect key={y} x="0" y={y} width="20" height="1.07" fill="#B22234"/>)}
    {[1,3,5,7,9,11].map(y => <rect key={y} x="0" y={y} width="20" height="1.07" fill="white"/>)}
    <rect x="0" y="0" width="8" height="7.5" fill="#3C3B6E"/>
    {/* Stars — simplified 3x2 grid */}
    {[1,3,5,7].map(cx => [1.5,3.5,5.5].map(cy => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.4" fill="white"/>
    )))}
  </svg>
);

const FlagES = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" className="shrink-0 rounded-sm overflow-hidden">
    <rect width="20" height="14" fill="#c60b1e"/>
    <rect x="0" y="3.5" width="20" height="7" fill="#ffc400"/>
    <rect x="0" y="0" width="20" height="3.5" fill="#c60b1e"/>
  </svg>
);

const FlagFR = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" className="shrink-0 rounded-sm overflow-hidden">
    <rect width="20" height="14" fill="white"/>
    <rect x="0"    y="0" width="6.67" height="14" fill="#002395"/>
    <rect x="13.3" y="0" width="6.7"  height="14" fill="#ED2939"/>
  </svg>
);

const FLAG_COMPONENTS: Record<LanguageCode, React.FC> = {
  en: FlagUS,
  es: FlagES,
  fr: FlagFR,
};

const langOptions: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English'  },
  { code: 'es', label: 'Español'  },
  { code: 'fr', label: 'Français' },
];

const navGroups = [
  {
    label: 'Main',
    items: [
      { icon: Home,       label: 'Overview',      href: '/'             },
      { icon: Landmark,   label: 'Accounts',      href: '/accounts'     },
      { icon: Repeat,     label: 'Convert',       href: '/swap'         },
      { icon: History,    label: 'History',       href: '/transactions' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: Briefcase,  label: 'Loans',         href: '/loans'        },
      { icon: CreditCard, label: 'My Cards',      href: '/cards'        },
      { icon: Users,      label: 'Beneficiaries', href: '/recipients'   },
      { icon: FileText,   label: 'Reports',       href: '/reports'      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LOGO MARK
// ─────────────────────────────────────────────────────────────────────────────

const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
    <rect width="22" height="22" rx="6" className="fill-[#C9A84C]" />
    <path d="M5 11h12M5 7.5h8M5 14.5h5" stroke="#0C0C0D" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { title: 'Transfer received', sub: '$1,200.00 from James O.', time: '2m ago',  dot: true  },
  { title: 'FX rate alert',     sub: '1 USD = 1,620 NGN',       time: '1h ago',  dot: true  },
  { title: 'Statement ready',   sub: 'March 2025 summary',       time: '1d ago',  dot: false },
];

const NotifDropdown = () => {
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  const unread            = NOTIFICATIONS.filter(n => n.dot).length;

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
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative p-2 rounded-xl transition-colors',
          'text-stone-400 dark:text-white/30',
          'hover:bg-stone-100 dark:hover:bg-white/[0.05]',
          'hover:text-stone-600 dark:hover:text-white/55',
          open && 'bg-stone-100 dark:bg-white/[0.05] text-stone-600 dark:text-white/55'
        )}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 mt-2 w-[300px] rounded-2xl overflow-hidden z-[120]',
              'bg-white dark:bg-[#1A1A1C]',
              'border border-stone-150 dark:border-white/[0.07]',
              'shadow-2xl shadow-black/10 dark:shadow-black/50'
            )}
          >
            <div className="px-4 py-3 flex items-center justify-between
              border-b border-stone-100 dark:border-white/[0.05]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em]
                text-stone-400 dark:text-white/30">
                Notifications
              </p>
              {unread > 0 && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full
                  bg-[#C9A84C]/15 text-[#C9A84C]">
                  {unread} new
                </span>
              )}
            </div>

            {NOTIFICATIONS.map((n, i) => (
              <div key={i}
                className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors
                  border-b border-stone-50 dark:border-white/[0.03] last:border-0
                  hover:bg-stone-50 dark:hover:bg-white/[0.03]">
                <div className="mt-1 shrink-0">
                  {n.dot
                    ? <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] block" />
                    : <span className="w-1.5 h-1.5 block" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold leading-none
                    text-stone-800 dark:text-white/80">
                    {n.title}
                  </p>
                  <p className="text-[11px] mt-0.5 text-stone-400 dark:text-white/30">{n.sub}</p>
                </div>
                <span className="text-[10px] font-mono text-stone-300 dark:text-white/20 shrink-0">
                  {n.time}
                </span>
              </div>
            ))}

            <div className="px-4 py-2.5 bg-stone-50 dark:bg-white/[0.02]">
              <button className="text-[11px] font-bold text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                Mark all as read
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const LangDropdown = ({ language, setLanguage }: {
  language: string;
  setLanguage: (c: LanguageCode) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

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
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors',
          'text-stone-500 dark:text-white/35',
          'hover:bg-stone-100 dark:hover:bg-white/[0.04]',
          'hover:text-stone-700 dark:hover:text-white/60',
          open && 'bg-stone-100 dark:bg-white/[0.04]'
        )}
      >
        <Globe size={12} />
        <span>{language}</span>
        <ChevronDown size={11} className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 mt-2 w-40 rounded-xl p-1 z-[120]',
              'bg-white dark:bg-[#1A1A1C]',
              'border border-stone-150 dark:border-white/[0.07]',
              'shadow-xl shadow-black/10 dark:shadow-black/40'
            )}
          >
            {langOptions.map(opt => {
              const FlagIcon = FLAG_COMPONENTS[opt.code];
              return (
                <button
                  key={opt.code}
                  onClick={() => { setLanguage(opt.code); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-lg transition-colors',
                    language === opt.code
                      ? 'text-[#C9A84C] bg-[#C9A84C]/[0.07]'
                      : 'text-stone-600 dark:text-white/50 hover:bg-stone-50 dark:hover:bg-white/[0.04] hover:text-stone-900 dark:hover:text-white'
                  )}
                >
                  <FlagIcon />
                  <span className="font-medium flex-1 text-left">{opt.label}</span>
                  {language === opt.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE DRAWER
// A right-sliding panel — completely different from the desktop sidebar.
// Shows: account summary card → nav links → settings footer
// ─────────────────────────────────────────────────────────────────────────────

const MobileDrawer = ({
  open, onClose, language, setLanguage,
}: {
  open: boolean;
  onClose: () => void;
  language: string;
  setLanguage: (c: LanguageCode) => void;
}) => {
  const location = useLocation();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer panel — slides in from right */}
          <motion.div
            className={cn(
              'fixed top-0 right-0 bottom-0 z-[210] lg:hidden',
              'w-[300px] max-w-[85vw]',
              'bg-white dark:bg-[#111113]',
              'flex flex-col',
              'shadow-2xl shadow-black/30'
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0     }}
            exit={{    x: '100%' }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
          >
            {/* ── DRAWER HEADER ── */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4
              border-b border-stone-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <LogoMark />
                <span className="text-[14px] font-bold tracking-[-0.3px]
                  text-stone-900 dark:text-white">
                  Nexus
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors
                  text-stone-400 dark:text-white/30
                  hover:bg-stone-100 dark:hover:bg-white/[0.06]
                  hover:text-stone-700 dark:hover:text-white/60"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── ACCOUNT CARD ── */}
            <div className="px-4 py-4">
              <div className={cn(
                'rounded-2xl p-4',
                'bg-gradient-to-br from-[#C9A84C] to-[#8B6F2E]',
                'relative overflow-hidden'
              )}>
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/[0.08]" />
                <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/[0.05]" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center
                      text-[#C9A84C] text-[12px] font-bold bg-white/20">
                      V
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white leading-none">Victor Okafor</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/60 mt-0.5">
                        Premium
                      </p>
                    </div>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 mb-0.5">
                    Total balance
                  </p>
                  <p className="text-[22px] font-light text-white leading-none tracking-[-1px]"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    $24,500<span className="text-[14px] text-white/40">.00</span>
                  </p>
                </div>
              </div>
            </div>

            {/* ── NAV LINKS + APPEARANCE (all scrollable) ── */}
            <div
              className="flex-1 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {navGroups.map(group => (
                <div key={group.label} className="mb-4">
                  <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2 px-1
                    text-stone-400 dark:text-white/20">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                            isActive
                              ? 'bg-[#C9A84C]/10 dark:bg-[#C9A84C]/[0.12]'
                              : 'hover:bg-stone-100 dark:hover:bg-white/[0.04]'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                            isActive
                              ? 'bg-[#C9A84C]/20 dark:bg-[#C9A84C]/[0.15]'
                              : 'bg-stone-100 dark:bg-white/[0.06]'
                          )}>
                            <item.icon
                              size={15}
                              className={cn(
                                isActive
                                  ? 'text-[#C9A84C]'
                                  : 'text-stone-500 dark:text-white/35'
                              )}
                            />
                          </div>
                          <span className={cn(
                            'text-[13.5px] font-medium tracking-[-0.1px] flex-1',
                            isActive
                              ? 'text-[#C9A84C] font-semibold'
                              : 'text-stone-700 dark:text-white/60'
                          )}>
                            {item.label}
                          </span>
                          {isActive && (
                            <ChevronRight size={13} className="text-[#C9A84C]/50 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* ── APPEARANCE — inside scroll area ── */}
              <div className="mt-2 mb-1">
                <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2 px-1
                  text-stone-400 dark:text-white/20">
                  Preferences
                </p>

                {/* Theme toggle row */}
                <div className={cn(
                  'flex items-center justify-between px-3 py-3 rounded-xl mb-1',
                  'bg-stone-50 dark:bg-white/[0.03]'
                )}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center
                      bg-stone-100 dark:bg-white/[0.06] shrink-0">
                      <Sun size={14} className="text-stone-500 dark:hidden" />
                      <Moon size={14} className="text-white/40 hidden dark:block" />
                    </div>
                    <span className="text-[13px] font-medium text-stone-700 dark:text-white/60">
                      Appearance
                    </span>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Language selector */}
                <div className={cn(
                  'px-3 py-3 rounded-xl',
                  'bg-stone-50 dark:bg-white/[0.03]'
                )}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2.5
                    text-stone-400 dark:text-white/25">
                    Language
                  </p>
                  <div className="flex gap-2">
                    {langOptions.map(opt => {
                      const FlagIcon = FLAG_COMPONENTS[opt.code];
                      return (
                        <button
                          key={opt.code}
                          onClick={() => setLanguage(opt.code)}
                          className={cn(
                            'flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all',
                            language === opt.code
                              ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30'
                              : 'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.07]'
                          )}
                        >
                          <FlagIcon />
                          <span className={cn(
                            'text-[10px] font-bold uppercase tracking-wide',
                            language === opt.code
                              ? 'text-[#C9A84C]'
                              : 'text-stone-400 dark:text-white/25'
                          )}>
                            {opt.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── ACCOUNT ACTIONS — inside scroll area so nothing clips ── */}
              <div className="mt-2 pt-3 border-t border-stone-100 dark:border-white/[0.06] space-y-1 pb-8">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                  text-stone-500 dark:text-white/35
                  hover:bg-stone-100 dark:hover:bg-white/[0.04]
                  hover:text-stone-800 dark:hover:text-white/65">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                    bg-stone-100 dark:bg-white/[0.06]">
                    <Settings size={14} className="text-stone-500 dark:text-white/40" />
                  </div>
                  <span className="text-[13px] font-medium">Settings</span>
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                  text-red-400/70 hover:text-red-500
                  hover:bg-red-50 dark:hover:bg-red-500/[0.06]">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                    bg-red-50 dark:bg-red-500/[0.08]">
                    <LogOut size={14} className="text-red-400" />
                  </div>
                  <span className="text-[13px] font-medium">Log out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HAMBURGER ICON (animated)
// ─────────────────────────────────────────────────────────────────────────────

const HamburgerIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
    className="transition-all duration-200">
    <motion.path
      d={open ? 'M3 3L15 15' : 'M3 4.5H15'}
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      animate={{ d: open ? 'M3 3L15 15' : 'M3 4.5H15' }}
      transition={{ duration: 0.2 }}
    />
    <motion.path
      d={open ? 'M9 9L9 9' : 'M3 9H15'}
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      animate={{ opacity: open ? 0 : 1 }}
      transition={{ duration: 0.15 }}
    />
    <motion.path
      d={open ? 'M15 3L3 15' : 'M3 13.5H11'}
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      animate={{ d: open ? 'M15 3L3 15' : 'M3 13.5H11' }}
      transition={{ duration: 0.2 }}
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────────────────────

export const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { language, setLanguage }   = useLanguage();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Close drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className={cn(
        'h-[64px] w-full flex items-center',
        // No border — seamless integration with the page background
        'bg-[#F5F3EF]/90 dark:bg-[#0C0C0D]/90 backdrop-blur-xl',
        'transition-colors duration-300'
      )}>
        <div className="w-full h-full flex items-center justify-between px-5 lg:px-10">

          {/* LEFT — Greeting */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-[14px] font-medium tracking-[-0.2px] truncate
              text-stone-500 dark:text-white/40">
              {getGreeting()},{' '}
              <span className="text-stone-900 dark:text-white font-semibold">Victor</span>
            </h1>
            <p className="hidden md:block text-[11px] mt-0.5 font-mono tracking-wide
              text-stone-400 dark:text-white/20">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>

          {/* RIGHT — Desktop controls */}
          <div className="flex items-center gap-2">

            {/* Language — desktop only */}
            <div className="hidden md:block">
              <LangDropdown language={language} setLanguage={setLanguage} />
            </div>

            {/* Theme — desktop only */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-stone-200 dark:bg-white/[0.06] mx-1" />

            {/* Notifications — always visible */}
            <NotifDropdown />

            {/* Avatar — always visible */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              'bg-gradient-to-br from-[#C9A84C] to-[#8B6F2E]',
              'text-[#0C0C0D] text-[11px] font-bold',
              'shadow-sm shadow-[#C9A84C]/20'
            )}>
              V
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(o => !o)}
              className={cn(
                'lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all ml-1',
                drawerOpen
                  ? 'bg-stone-200 dark:bg-white/[0.10] text-stone-900 dark:text-white'
                  : 'bg-stone-100 dark:bg-white/[0.06] text-stone-600 dark:text-white/60',
                'hover:bg-stone-200 dark:hover:bg-white/[0.10]'
              )}
              aria-label="Open menu"
            >
              <HamburgerIcon open={drawerOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────────────── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        language={language}
        setLanguage={setLanguage}
      />
    </>
  );
};