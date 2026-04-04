import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────────────────────

const LogoMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <rect width="22" height="22" rx="6" fill="#C9A84C" />
    <path d="M5 11h12M5 7.5h8M5 14.5h5" stroke="#0C0C0D" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICONS — inline, bank-grade
// ─────────────────────────────────────────────────────────────────────────────

type IconProps = { size?: number; className?: string };

const IcoArrow     = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const IcoArrowOut  = ({ size = 15, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12 12 4M6 4h6v6"/>
  </svg>
);
const IcoChevron   = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 6.75 9 11.25l4.5-4.5"/>
  </svg>
);
const IcoMenu      = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" className={className}>
    <path d="M3 5h12M3 9h12M3 13h8"/>
  </svg>
);
const IcoClose     = ({ size = 17, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" className={className}>
    <path d="M3 3l11 11M14 3L3 14"/>
  </svg>
);
const IcoGlobe     = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="9" r="7"/>
    <path d="M2 9h14M9 2c-2 2.5-2 10.5 0 14M9 2c2 2.5 2 10.5 0 14"/>
  </svg>
);
const IcoZap       = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.5 2L4 10h5.5L7.5 16l6.5-8H8.5z"/>
  </svg>
);
const IcoChart     = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 13l4-4 3 3 5-6"/>
    <path d="M3 15h12"/>
  </svg>
);
const IcoCard      = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4.5" width="14" height="9" rx="2"/>
    <path d="M2 8h14"/>
    <path d="M5 11.5h2"/>
  </svg>
);
const IcoUsers     = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7" cy="6" r="3"/>
    <path d="M1 15c0-3 2.7-5 6-5s6 2 6 5"/>
    <path d="M13 3.5a3 3 0 010 5M17 15c0-2.5-1.5-4-4-4.5"/>
  </svg>
);
const IcoTrend     = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 13l4.5-4.5L9 11l6-6.5"/>
    <path d="M12 4.5h3v3"/>
  </svg>
);
const IcoLock      = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3.5" y="8" width="11" height="7.5" rx="2"/>
    <path d="M6 8V5.5a3 3 0 016 0V8"/>
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const IcoBank      = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 15.5h14M3.5 15.5v-6M7 15.5v-6M11 15.5v-6M14.5 15.5v-6"/>
    <path d="M2 8l7-5 7 5"/>
  </svg>
);
const IcoCheck     = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 7l3 3 6-6"/>
  </svg>
);
const IcoVerified  = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 1.5L9.8 3h2.7l.8 2.6 2.2 1.4L14.6 9l.9 2.6-2.2 1.4-.8 2.6H9.8L8 17 6.2 15.6H3.5l-.8-2.6L.5 11.6 1.4 9 .5 6.4l2.2-1.4L3.5 2.5h2.7z" strokeWidth="1.3"/>
    <path d="M5.5 8l2 2 3-3"/>
  </svg>
);
const IcoBiometric = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5.5 3a6 6 0 017 0"/>
    <path d="M3 5.5a7.5 7.5 0 0012 0"/>
    <path d="M6 9c0-1.7 1.3-3 3-3s3 1.3 3 3"/>
    <path d="M7.5 12c.4.7 1 1 1.5 1s1.1-.3 1.5-1"/>
    <path d="M9 9v3"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features'  },
  { label: 'Security', href: '#security'  },
  { label: 'Pricing',  href: '#pricing'   },
  { label: 'About',    href: '#about'     },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScroll = (href: string) => {
    setOpen(false);
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-[200] transition-all duration-300',
        scrolled
          ? 'bg-[#F5F3EF]/95 dark:bg-[#0C0C0D]/95 backdrop-blur-xl border-b border-stone-200 dark:border-white/[0.06]'
          : 'bg-transparent'
      )}>
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark />
            <span className="text-[16px] font-bold tracking-[-0.4px] text-stone-900 dark:text-white">
              Nexus
            </span>
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase
              text-[#C9A84C] bg-[#C9A84C]/10 px-1.5 py-0.5 rounded-full hidden sm:inline">
              Private
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 flex-1 justify-center">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => handleScroll(l.href)}
                className="text-[13.5px] font-medium text-stone-500 dark:text-white/45
                  hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap">
                {l.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/login"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold
                text-stone-600 dark:text-white/55 hover:text-stone-900 dark:hover:text-white
                transition-colors rounded-xl">
              Sign in
            </Link>
            <Link to="/signup"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold
                bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] transition-colors">
              Get started
              <IcoArrow size={13} />
            </Link>
            <button onClick={() => setOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center
                bg-stone-100 dark:bg-white/[0.06] text-stone-600 dark:text-white/60
                hover:bg-stone-200 dark:hover:bg-white/[0.10] transition-colors">
              {open ? <IcoClose size={16} /> : <IcoMenu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-stone-200 dark:border-white/[0.06]
            bg-[#F5F3EF]/98 dark:bg-[#0C0C0D]/98 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map(l => (
                <button key={l.label} onClick={() => handleScroll(l.href)}
                  className="w-full text-left px-3 py-3.5 rounded-xl text-[14px] font-medium
                    text-stone-700 dark:text-white/65
                    hover:bg-stone-100 dark:hover:bg-white/[0.04]
                    hover:text-stone-900 dark:hover:text-white transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4 pt-1 border-t border-stone-200 dark:border-white/[0.06] flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)}
                className="px-4 py-3.5 text-center rounded-xl text-[14px] font-semibold
                  text-stone-600 dark:text-white/50 border border-stone-200 dark:border-white/[0.08]
                  hover:border-stone-300 transition-colors">
                Sign in
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)}
                className="px-4 py-3.5 text-center rounded-xl text-[14px] font-bold
                  bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] transition-colors">
                Create account
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO DASHBOARD MOCKUP
// ─────────────────────────────────────────────────────────────────────────────

const MockupCard = ({ children, className, style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) => (
  <div style={style} className={cn(
    'rounded-2xl border bg-white dark:bg-[#111113]',
    'border-stone-200 dark:border-white/[0.08]',
    'shadow-xl shadow-black/[0.07] dark:shadow-black/50',
    className
  )}>
    {children}
  </div>
);

const HeroDashboardPreview = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const currencies = [
    { code: 'USD', sym: '$',  balance: '14,250.60', up: true,  change: '+1.8%' },
    { code: 'GBP', sym: '£',  balance: '2,100.00',  up: true,  change: '+0.6%' },
    { code: 'EUR', sym: '€',  balance: '3,800.00',  up: false, change: '-0.3%' },
    { code: 'NGN', sym: '₦', balance: '850,000',   up: false, change: '-1.1%' },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % currencies.length), 2200);
    return () => clearInterval(t);
  }, []);

  const c = currencies[activeIdx];
  const CHART_PTS = [28,22,30,18,26,14,20,10,16,8,12,6];
  const W = 200, H = 50, MAX = 32;
  const pts = CHART_PTS.map((v, i) =>
    `${(i / (CHART_PTS.length - 1)) * W},${H - (v / MAX) * H}`
  ).join(' ');

  return (
    <div className="relative w-full max-w-[400px] mx-auto select-none"
      style={{ aspectRatio: '1/1.08' }}>

      {/* Balance hero card */}
      <MockupCard className="absolute top-0 left-0 right-0 p-5 z-10">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3
          text-stone-400 dark:text-white/25">
          Total portfolio
        </p>
        <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
          leading-none mb-1 text-[36px]" style={{ letterSpacing: '-0.8px' }}>
          $24,500<span className="text-stone-400 dark:text-white/30 text-[18px]">.00</span>
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-mono text-emerald-500">↑ +$1,840.20</span>
          <span className="text-[11px] font-mono text-stone-300 dark:text-white/20">this month</span>
        </div>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {currencies.map((cu, i) => (
            <button key={cu.code} onClick={() => setActiveIdx(i)}
              className={cn(
                'flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                activeIdx === i
                  ? 'bg-[#C9A84C] text-[#0C0C0D] border-[#C9A84C]'
                  : 'bg-stone-50 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.07] text-stone-500 dark:text-white/35'
              )}>
              {cu.code}
            </button>
          ))}
        </div>
      </MockupCard>

      {/* Currency detail */}
      <MockupCard className="absolute left-0 right-6 z-20 p-4"
        style={{ top: 'clamp(148px, 34%, 178px)' }}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <p className="text-[9px] font-bold tracking-[0.15em] uppercase
              text-stone-400 dark:text-white/25 mb-0.5">
              {c.code} balance
            </p>
            <p className="font-mono text-[18px] font-bold text-stone-900 dark:text-white leading-none">
              {c.sym}{c.balance}
            </p>
          </div>
          <span className={cn(
            'text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg',
            c.up
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
              : 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
          )}>
            {c.change}
          </span>
        </div>
        <svg width="100%" height="50" viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none" className="opacity-70">
          <polyline points={pts} fill="none"
            stroke={c.up ? '#34d399' : '#f87171'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </MockupCard>

      {/* Recent transactions */}
      <MockupCard className="absolute bottom-0 left-6 right-0 z-20 p-4">
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2
          text-stone-400 dark:text-white/25">
          Recent transfer
        </p>
        {[
          { name: 'Sophie Müller', amt: '-€380.00', time: '2h ago', g: 'from-sky-500 to-blue-600',     i: 'SM' },
          { name: 'Marcus Chen',   amt: '+$2,500',  time: '5h ago', g: 'from-emerald-500 to-teal-600', i: 'MC' },
        ].map(tx => (
          <div key={tx.name} className="flex items-center gap-2.5 py-1.5">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0',
              `bg-gradient-to-br ${tx.g}`
            )}>
              {tx.i}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-stone-800 dark:text-white/80 leading-none truncate">{tx.name}</p>
              <p className="text-[10px] text-stone-400 dark:text-white/25 font-mono">{tx.time}</p>
            </div>
            <p className={cn(
              'text-[12px] font-mono font-bold shrink-0',
              tx.amt.startsWith('+') ? 'text-emerald-500' : 'text-stone-700 dark:text-white/65'
            )}>
              {tx.amt}
            </p>
          </div>
        ))}
      </MockupCard>

      {/* Security indicator — no icon lib */}
      <div className={cn(
        'absolute top-1/2 -right-3 sm:-right-6 z-30 -translate-y-1/2',
        'flex items-center gap-2 px-2.5 py-2 rounded-xl border',
        'bg-white dark:bg-[#161618]',
        'border-stone-200 dark:border-white/[0.09]',
        'shadow-lg shadow-black/10 dark:shadow-black/40'
      )}>
        <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10
          flex items-center justify-center shrink-0">
          <IcoLock size={13} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-stone-900 dark:text-white leading-none">Bank-grade</p>
          <p className="text-[9px] text-stone-400 dark:text-white/30">256-bit SSL</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className="min-h-screen flex flex-col justify-center pt-[64px]
    bg-[#F5F3EF] dark:bg-[#0C0C0D]">
    <div className="max-w-[1120px] mx-auto w-full px-5 sm:px-8 py-16 sm:py-24
      grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

      {/* Text */}
      <div className="max-w-[580px]">
        <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
          mb-6 leading-[1.06]"
          style={{ fontSize: 'clamp(38px, 6vw, 72px)', letterSpacing: '-1.8px' }}>
          Your wealth,
          <br />
          <span className="text-[#C9A84C]">borderless.</span>
        </h1>

        <p className="text-stone-500 dark:text-white/45 mb-10 leading-relaxed max-w-[460px]"
          style={{ fontSize: 'clamp(15px, 1.8vw, 18px)' }}>
          Multi-currency accounts, international transfers, and real-time analytics — all in one private banking dashboard built for a global life.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12">
          <Link to="/signup"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
              text-[14px] font-bold bg-[#C9A84C] text-[#0C0C0D]
              hover:bg-[#D4B558] transition-colors shadow-lg shadow-[#C9A84C]/25">
            Open your account
            <IcoArrow size={14} />
          </Link>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
              text-[14px] font-semibold border border-stone-300 dark:border-white/[0.12]
              text-stone-600 dark:text-white/55
              hover:border-stone-400 hover:text-stone-900
              dark:hover:border-white/[0.22] dark:hover:text-white transition-all">
            See how it works
          </button>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex -space-x-2">
            {['from-sky-500 to-blue-600','from-violet-500 to-purple-600','from-emerald-500 to-teal-600',
              'from-amber-500 to-orange-600','from-rose-500 to-pink-600'].map((g, i) => (
              <div key={i} className={cn(
                'w-8 h-8 rounded-full ring-2 ring-[#F5F3EF] dark:ring-[#0C0C0D]',
                `bg-gradient-to-br ${g}`
              )} />
            ))}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-stone-900 dark:text-white leading-none">
              Trusted by 40,000+ clients
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="11" height="11" viewBox="0 0 12 12" fill="#C9A84C">
                  <path d="M6 1l1.4 2.8L10 4.3l-2 1.9.5 2.8L6 7.6 3.5 9l.5-2.8-2-1.9 2.6-.5z" />
                </svg>
              ))}
              <span className="text-[11px] font-mono text-stone-400 dark:text-white/30 ml-1">4.9 / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard preview — desktop only */}
      <div className="hidden lg:flex justify-end">
        <HeroDashboardPreview />
      </div>
    </div>

    <div className="flex justify-center pb-10 animate-bounce">
      <IcoChevron size={20} className="text-stone-300 dark:text-white/20" />
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// STATS BAND
// ─────────────────────────────────────────────────────────────────────────────

const StatsBand = () => (
  <section className="border-y border-stone-200 dark:border-white/[0.06]
    bg-white dark:bg-[#111113]">
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-10 sm:py-14
      grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
      {[
        { value: '$4.2B+', label: 'Assets under management' },
        { value: '185+',   label: 'Countries supported'     },
        { value: '40K+',   label: 'Private clients'         },
        { value: '0.5%',   label: 'Industry-low transfer fee' },
      ].map(s => (
        <div key={s.label}>
          <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
            leading-none mb-2"
            style={{ fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-0.5px' }}>
            {s.value}
          </p>
          <p className="text-[12px] font-mono text-stone-400 dark:text-white/30 leading-snug">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  { Icon: IcoGlobe,  title: 'Multi-currency accounts',  body: 'Hold, send, and receive in USD, GBP, EUR, NGN and 30+ currencies. Real-time exchange rates, always.',       color: 'text-sky-500'     },
  { Icon: IcoZap,    title: 'Instant global transfers',  body: 'Send money to 185 countries via SWIFT, SEPA, or our Nexus network. Most arrive in seconds.',               color: 'text-[#C9A84C]'  },
  { Icon: IcoChart,  title: 'Intelligent analytics',     body: 'Track spending, income, and FX exposure across all currencies with interactive dashboards.',               color: 'text-violet-500' },
  { Icon: IcoCard,   title: 'Virtual & physical cards',  body: 'Issue cards tied to any currency account. Freeze, set limits, and monitor usage in real time.',           color: 'text-emerald-500' },
  { Icon: IcoTrend,  title: 'Portfolio visibility',      body: 'One view across all accounts, currencies, and instruments. Your full financial picture, always on.',      color: 'text-amber-500'  },
  { Icon: IcoUsers,  title: 'Team & business access',    body: 'Invite team members with custom roles, approval workflows, and full audit trails.',                       color: 'text-rose-500'   },
];

const FeaturesSection = () => (
  <section id="features" className="bg-[#F5F3EF] dark:bg-[#0C0C0D] py-20 sm:py-28">
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8">

      <div className="max-w-[540px] mb-16">
        <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3 text-[#C9A84C]">
          Platform
        </p>
        <h2 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
          leading-tight"
          style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', letterSpacing: '-0.8px' }}>
          Everything private banking should be
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
        {FEATURES.map((f, i) => (
          <div key={f.title}
            className={cn(
              'py-8 flex gap-5',
              i < FEATURES.length - (FEATURES.length % 3 === 0 ? 3 : FEATURES.length % 3)
                ? 'border-b border-stone-200 dark:border-white/[0.06]'
                : '',
              'sm:border-b sm:border-stone-200 sm:dark:border-white/[0.06]',
              'last:border-0'
            )}>
            <f.Icon size={18} className={cn('shrink-0 mt-0.5', f.color)} />
            <div>
              <h3 className="text-[14px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-[13px] text-stone-500 dark:text-white/40 leading-relaxed">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY
// ─────────────────────────────────────────────────────────────────────────────

const SecuritySection = () => (
  <section id="security"
    className="bg-stone-900 dark:bg-[#0A0A0B] py-20 sm:py-28 overflow-hidden">
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8
      grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

      {/* Left */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-4 text-[#C9A84C]">
          Security
        </p>
        <h2 className="font-['DM_Serif_Display',_Georgia,_serif] text-white mb-5 leading-tight"
          style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', letterSpacing: '-0.8px' }}>
          Bank-grade security,<br />not bank-grade friction
        </h2>
        <p className="text-[15px] text-white/45 leading-relaxed mb-10 max-w-[440px]">
          Every transaction is protected by military-grade encryption. We never compromise security — but we refuse to make it painful.
        </p>

        <div className="space-y-6">
          {[
            { Icon: IcoLock,      title: '256-bit SSL encryption',    sub: 'All data in transit and at rest is fully encrypted'       },
            { Icon: IcoVerified,  title: 'PCI-DSS Level 1 compliant', sub: 'The highest standard for payment security globally'      },
            { Icon: IcoBank,      title: 'Regulated & licensed',      sub: 'Licensed by FCA (UK), CBN (Nigeria), and EU regulators'  },
            { Icon: IcoBiometric, title: 'Biometric & 2FA',           sub: 'Multi-layer authentication — your choice of method'      },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                bg-white/[0.05] border border-white/[0.07]">
                <item.Icon size={16} className="text-[#C9A84C]" />
              </div>
              <div>
                <p className="text-[13.5px] font-bold text-white leading-none mb-1">{item.title}</p>
                <p className="text-[12px] text-white/38">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: metrics */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { value: '99.9%', label: 'Uptime SLA',          sub: 'over 36 months'         },
          { value: '0',     label: 'Security breaches',   sub: 'since founding'         },
          { value: '256',   label: 'Bit encryption',      sub: 'AES-GCM standard'       },
          { value: 'FCA',   label: 'Regulated',           sub: '+ CBN · EU passported'  },
        ].map(m => (
          <div key={m.label}
            className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-white leading-none mb-1"
              style={{ fontSize: 'clamp(26px, 4vw, 36px)', letterSpacing: '-0.5px' }}>
              {m.value}
            </p>
            <p className="text-[12px] font-semibold text-white/55 mb-0.5">{m.label}</p>
            <p className="text-[11px] font-mono text-white/25">{m.sub}</p>
          </div>
        ))}

        {/* Certification strip */}
        <div className="col-span-2 flex flex-wrap gap-2 pt-1">
          {['FCA licensed', 'PCI-DSS L1', 'ISO 27001', 'SOC 2 Type II', 'GDPR compliant'].map(b => (
            <span key={b}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold
                bg-white/[0.05] border border-white/[0.08] text-white/45">
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Starter', price: 'Free', sub: 'for individuals',
    features: ['1 currency account', '$1,000 monthly transfers', 'Nexus wallet access', 'Standard support'],
    cta: 'Get started', gold: false,
  },
  {
    name: 'Premium', price: '$19', sub: 'per month',
    features: ['4 currency accounts', '$50,000 monthly transfers', 'Virtual & physical cards', '0.5% transfer fee', 'Priority support', 'FX rate alerts'],
    cta: 'Start free trial', gold: true, badge: 'Most popular',
  },
  {
    name: 'Private', price: '$79', sub: 'per month',
    features: ['Unlimited currencies', 'Unlimited transfers', 'Dedicated relationship manager', 'Zero transfer fee', 'API access', 'Team accounts & roles', 'Custom reporting'],
    cta: 'Talk to us', gold: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="bg-[#F5F3EF] dark:bg-[#0C0C0D] py-20 sm:py-28">
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8">

      <div className="text-center max-w-[500px] mx-auto mb-14">
        <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3 text-[#C9A84C]">
          Pricing
        </p>
        <h2 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-4"
          style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', letterSpacing: '-0.8px' }}>
          Simple, honest pricing
        </h2>
        <p className="text-[15px] text-stone-500 dark:text-white/45">
          No hidden fees. No surprise charges. Cancel any time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-start">
        {PLANS.map(p => (
          <div key={p.name} className={cn(
            'rounded-2xl border p-6 sm:p-7',
            p.gold
              ? 'bg-[#C9A84C]/[0.06] dark:bg-[#C9A84C]/[0.08] border-[#C9A84C]/25 ring-1 ring-[#C9A84C]/10'
              : 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.07]'
          )}>
            {p.badge && (
              <span className="inline-block text-[9px] font-bold uppercase tracking-[0.14em]
                text-[#C9A84C] bg-[#C9A84C]/15 px-2.5 py-1 rounded-full mb-4">
                {p.badge}
              </span>
            )}
            <p className="text-[13px] font-bold text-stone-600 dark:text-white/60 mb-1">{p.name}</p>
            <p className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white mb-1"
              style={{ fontSize: 'clamp(28px, 4vw, 38px)', letterSpacing: '-0.5px' }}>
              {p.price}
            </p>
            <p className="text-[12px] font-mono text-stone-400 dark:text-white/30 mb-7">{p.sub}</p>

            <div className="space-y-2.5 mb-8">
              {p.features.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0
                    bg-[#C9A84C]/15">
                    <IcoCheck size={9} className="text-[#C9A84C]" />
                  </div>
                  <span className="text-[13px] text-stone-600 dark:text-white/55">{f}</span>
                </div>
              ))}
            </div>

            <Link to="/signup"
              className={cn(
                'flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold transition-all',
                p.gold
                  ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558]'
                  : 'border border-stone-300 dark:border-white/[0.12] text-stone-700 dark:text-white/60 hover:border-stone-400 hover:text-stone-900 dark:hover:text-white'
              )}>
              {p.cta}
              <IcoArrow size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'Nexus completely changed how I manage my freelance income across Europe and Nigeria. The SEPA and local transfers are seamless.',
    name: 'Sophie M.',  role: 'Freelance designer, Germany', color: 'from-sky-500 to-blue-600',      init: 'SM',
  },
  {
    quote: 'As a business with clients in 12 countries, Nexus is the only banking platform that handles our complexity without friction.',
    name: 'TechCorp Finance', role: 'Finance director, USA', color: 'from-slate-500 to-slate-700', init: 'TC',
  },
  {
    quote: 'The FX rates are genuinely competitive and the dashboard is beautiful. I moved my entire personal banking here within a week.',
    name: 'Marcus C.', role: 'Software engineer, Singapore', color: 'from-emerald-500 to-teal-600', init: 'MC',
  },
];

const TestimonialsSection = () => (
  <section className="bg-white dark:bg-[#111113] py-20 sm:py-28">
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8">

      <div className="mb-14">
        <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3 text-[#C9A84C]">
          Testimonials
        </p>
        <h2 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white"
          style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', letterSpacing: '-0.8px' }}>
          Loved by clients worldwide
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10">
        {TESTIMONIALS.map(t => (
          <div key={t.name}>
            <div className="flex gap-0.5 mb-5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="#C9A84C">
                  <path d="M6 1l1.4 2.8L10 4.3l-2 1.9.5 2.8L6 7.6 3.5 9l.5-2.8-2-1.9 2.6-.5z" />
                </svg>
              ))}
            </div>
            <p className="text-[14px] text-stone-600 dark:text-white/55 leading-relaxed mb-6 italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0',
                `bg-gradient-to-br ${t.color}`
              )}>
                {t.init}
              </div>
              <div>
                <p className="text-[13px] font-bold text-stone-900 dark:text-white leading-none">{t.name}</p>
                <p className="text-[11px] text-stone-400 dark:text-white/30 mt-0.5">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────────────

const CTASection = () => (
  <section id="about" className="bg-[#F5F3EF] dark:bg-[#0C0C0D] py-20 sm:py-28">
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
      <div className={cn(
        'rounded-3xl px-8 py-16 sm:px-16 sm:py-20 text-center relative overflow-hidden',
        'bg-stone-900 dark:bg-white/[0.03]',
        'border border-stone-800 dark:border-white/[0.07]'
      )}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[380px] h-[380px] rounded-full border border-white/[0.04] pointer-events-none" />

        <div className="relative z-10 max-w-[520px] mx-auto">
          <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-4 text-[#C9A84C]">
            Get started today
          </p>
          <h2 className="font-['DM_Serif_Display',_Georgia,_serif] text-white mb-5 leading-tight"
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '-0.8px' }}>
            Ready to bank without borders?
          </h2>
          <p className="text-[15px] text-white/40 leading-relaxed mb-8">
            Join 40,000+ clients who trust Nexus for their global banking. Open your account in under 3 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup"
              className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl
                text-[14px] font-bold bg-[#C9A84C] text-[#0C0C0D]
                hover:bg-[#D4B558] transition-colors w-full sm:w-auto
                shadow-xl shadow-[#C9A84C]/20">
              Open your account — it's free
              <IcoArrow size={14} />
            </Link>
            <Link to="/login"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                text-[14px] font-semibold border border-white/[0.12]
                text-white/50 hover:border-white/[0.22] hover:text-white/80
                transition-all w-full sm:w-auto">
              Sign in
              <IcoArrowOut size={13} />
            </Link>
          </div>

          <p className="text-[11px] font-mono text-white/20 mt-6">
            No credit card required · FCA regulated · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="bg-stone-900 dark:bg-[#0A0A0B] border-t border-white/[0.05]">
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">

        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <LogoMark size={22} />
            <span className="text-[15px] font-bold text-white tracking-[-0.3px]">Nexus</span>
          </div>
          <p className="text-[12px] text-white/30 leading-relaxed max-w-[200px]">
            Private banking for a borderless world. Built for global citizens.
          </p>
        </div>

        {[
          { heading: 'Product', links: [
            { label: 'Features', href: '#features' },
            { label: 'Security', href: '#security' },
            { label: 'Pricing',  href: '#pricing'  },
            { label: 'Changelog', href: '#' },
            { label: 'API docs', href: '#' },
          ]},
          { heading: 'Company', links: [
            { label: 'About',   href: '#about' },
            { label: 'Blog',    href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Press',   href: '#' },
            { label: 'Contact', href: '#' },
          ]},
          { heading: 'Legal', links: [
            { label: 'Privacy',    href: '#' },
            { label: 'Terms',      href: '#' },
            { label: 'Cookies',    href: '#' },
            { label: 'Compliance', href: '#' },
            { label: 'Licenses',   href: '#' },
          ]},
          { heading: 'Support', links: [
            { label: 'Help centre', href: '#' },
            { label: 'Status',      href: '#' },
            { label: 'Community',   href: '#' },
            { label: 'Partners',    href: '#' },
            { label: 'FAQs',        href: '#' },
          ]},
        ].map(group => (
          <div key={group.heading}>
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/25 mb-4">
              {group.heading}
            </p>
            <div className="space-y-2.5">
              {group.links.map(l => (
                <p key={l.label}>
                  <a href={l.href}
                    className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
                    {l.label}
                  </a>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row
        items-start sm:items-center justify-between gap-4">
        <p className="text-[12px] text-white/20 font-mono">
          © 2026 Nexus Private Bank Ltd. FCA registered. No. 987654.
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['FCA', 'PCI-DSS', 'ISO 27001', 'SOC 2'].map(badge => (
            <span key={badge}
              className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-lg
                bg-white/[0.04] border border-white/[0.07] text-white/25">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

const LandingPage = () => (
  <div className="min-h-screen font-sans">
    <Nav />
    <main>
      <HeroSection />
      <StatsBand />
      <FeaturesSection />
      <SecuritySection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
