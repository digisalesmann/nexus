import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, Globe, ChevronDown, X, Moon, Sun, Settings } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { cn } from '../../lib/utils';

type LanguageCode = 'en' | 'es' | 'fr';

const langOptions: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen]                 = useState(false);
  const [notifOpen, setNotifOpen]               = useState(false);
  const { language, setLanguage }               = useLanguage();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => { setLangOpen(false); setNotifOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header className={cn(
        'h-[64px] w-full flex items-center',
        'bg-[#F5F3EF]/90 dark:bg-[#0C0C0D]/90 backdrop-blur-xl',
        'border-b border-stone-200 dark:border-white/[0.05]',
        'transition-colors duration-300'
      )}>
        <div className="w-full h-full flex items-center justify-between px-6 lg:px-10">

          {/* LEFT — Greeting */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-[14px] font-medium tracking-[-0.2px] truncate text-stone-500 dark:text-white/40">
              {getGreeting()},{' '}
              <span className="text-stone-900 dark:text-white font-semibold">Victor</span>
            </h1>
            <p className="hidden md:block text-[11px] text-stone-400 dark:text-white/20 mt-0.5 font-mono tracking-wide">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* Language picker — desktop only */}
            <div
              className="hidden md:block relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors',
                  'text-stone-500 dark:text-white/35',
                  'border border-stone-200 dark:border-white/[0.07]',
                  'hover:bg-stone-100 dark:hover:bg-white/[0.04]',
                  'hover:text-stone-700 dark:hover:text-white/60'
                )}
              >
                <Globe size={12} />
                {language}
                <ChevronDown size={11} className={cn('transition-transform', langOpen && 'rotate-180')} />
              </button>

              {langOpen && (
                <div className={cn(
                  'absolute right-0 mt-2 w-40 rounded-xl p-1 z-50',
                  'bg-white dark:bg-[#1A1A1C]',
                  'border border-stone-200 dark:border-white/[0.08]',
                  'shadow-xl shadow-black/10 dark:shadow-black/40'
                )}>
                  {langOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => { setLanguage(opt.code); setLangOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-lg transition-colors',
                        language === opt.code
                          ? 'text-[#C9A84C] bg-[#C9A84C]/08'
                          : 'text-stone-600 dark:text-white/50 hover:bg-stone-50 dark:hover:bg-white/[0.04] hover:text-stone-900 dark:hover:text-white'
                      )}
                    >
                      <span>{opt.flag}</span>
                      <span className="font-medium">{opt.label}</span>
                      {language === opt.code && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle — desktop only */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-stone-200 dark:bg-white/[0.06]" />

            {/* Notifications */}
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={cn(
                  'relative p-2 rounded-lg transition-colors',
                  'text-stone-400 dark:text-white/30',
                  'hover:bg-stone-100 dark:hover:bg-white/[0.05]',
                  'hover:text-stone-700 dark:hover:text-white/60'
                )}
              >
                <Bell size={18} />
                {/* Unread dot */}
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
              </button>

              {notifOpen && (
                <div className={cn(
                  'absolute right-0 mt-2 w-[300px] rounded-xl overflow-hidden z-50',
                  'bg-white dark:bg-[#1A1A1C]',
                  'border border-stone-200 dark:border-white/[0.08]',
                  'shadow-xl shadow-black/10 dark:shadow-black/40'
                )}>
                  <div className="px-4 py-3 border-b border-stone-100 dark:border-white/[0.05]">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-stone-400 dark:text-white/30">
                      Notifications
                    </p>
                  </div>
                  {[
                    { title: 'Transfer received', sub: '$1,200.00 from James O.', time: '2m ago', dot: true },
                    { title: 'FX rate alert',     sub: '1 USD = 1,620 NGN',       time: '1h ago', dot: true },
                    { title: 'Statement ready',   sub: 'March 2025 summary',       time: '1d ago', dot: false },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-stone-50 dark:border-white/[0.03] last:border-0">
                      {n.dot && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />}
                      {!n.dot && <span className="mt-1.5 w-1.5 h-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-stone-800 dark:text-white/80 leading-none">{n.title}</p>
                        <p className="text-[11px] text-stone-400 dark:text-white/30 mt-0.5">{n.sub}</p>
                      </div>
                      <span className="text-[10px] text-stone-300 dark:text-white/20 font-mono shrink-0">{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6F2E] flex items-center justify-center text-[#0C0C0D] text-[11px] font-bold shadow-md shadow-[#C9A84C]/20">
              V
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                'bg-stone-100 dark:bg-white/[0.06]',
                'text-stone-700 dark:text-white/70',
                'hover:bg-stone-200 dark:hover:bg-white/[0.10]'
              )}
            >
              {isMobileMenuOpen ? <X size={20} /> : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE OVERLAY MENU ────────────────────────────────────────────── */}
      <div className={cn(
        'fixed inset-0 z-[90] lg:hidden transition-all duration-300',
        'bg-[#F5F3EF] dark:bg-[#0C0C0D]',
        isMobileMenuOpen
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      )}>
        <div className="flex flex-col h-full pt-20 px-6 pb-10">
          <div className="space-y-6">

            {/* Appearance */}
            <div>
              <p className="text-[9px] font-bold text-stone-400 dark:text-white/20 uppercase tracking-[0.2em] mb-4">
                Appearance
              </p>
              <div className={cn(
                'flex items-center justify-between p-4 rounded-2xl',
                'bg-white dark:bg-white/[0.04]',
                'border border-stone-200 dark:border-white/[0.07]'
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-stone-100 dark:bg-white/[0.06]">
                    <Sun size={16} className="text-stone-500 dark:hidden" />
                    <Moon size={16} className="hidden dark:block text-white/50" />
                  </div>
                  <span className="font-semibold text-[14px] text-stone-700 dark:text-white/70">Theme</span>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="text-[9px] font-bold text-stone-400 dark:text-white/20 uppercase tracking-[0.2em] mb-4">
                Language
              </p>
              <div className="grid grid-cols-3 gap-2">
                {langOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => { setLanguage(opt.code); setIsMobileMenuOpen(false); }}
                    className={cn(
                      'flex flex-col items-center py-4 rounded-2xl border transition-all',
                      language === opt.code
                        ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#C9A84C]'
                        : 'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.07] text-stone-400 dark:text-white/30'
                    )}
                  >
                    <span className="text-2xl mb-1">{opt.flag}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{opt.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <button className={cn(
              'w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-[14px] transition-colors',
              'bg-stone-900 dark:bg-white',
              'text-white dark:text-[#0C0C0D]',
              'hover:bg-stone-800 dark:hover:bg-stone-100'
            )}>
              <Settings size={16} /> Account Settings
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 text-stone-400 dark:text-white/25 text-[13px] font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
};