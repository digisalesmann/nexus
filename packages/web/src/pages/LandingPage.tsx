import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN LANGUAGE
// Dark canvas (#0A0A0B). Large editorial typography. Human photography (via
// Unsplash direct URLs). Feature cards as big visual blocks, not bullet lists.
// No SaaS stat strips. CTA is emotional, not transactional.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────────────────────

const LogoMark = ({ size = 28 }: { size?: number }) => (
  <img src="/sg.jpeg" alt="Stonegate" width={size} height={size}
    style={{ width: size, height: size, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
);

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────

type IP = { size?: number; className?: string };
const IcoArrow   = ({ size=16, className }: IP) => <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 8h10M9 4l4 4-4 4"/></svg>;
const IcoMenu    = ({ size=18, className }: IP) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}><path d="M3 5h12M3 9h12M3 13h8"/></svg>;
const IcoClose   = ({ size=17, className }: IP) => <svg width={size} height={size} viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}><path d="M3 3l11 11M14 3L3 14"/></svg>;
const IcoChevron = ({ size=18, className }: IP) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 6.75L9 11.25l4.5-4.5"/></svg>;
const IcoStar    = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="#C9A84C"><path d="M6 1l1.4 2.8L10 4.3l-2 1.9.5 2.8L6 7.6 3.5 9l.5-2.8-2-1.9 2.6-.5z"/></svg>;
const IcoCheck   = ({ className }: IP) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 8l3.5 3.5 6.5-7"/></svg>;

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-[200] transition-all duration-300',
        scrolled
          ? 'bg-[#F5F3EF]/95 dark:bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-stone-200 dark:border-white/[0.06]'
          : 'bg-transparent'
      )}>
        <div className="max-w-[1160px] mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark />
            <span className="text-[16px] font-bold tracking-[-0.4px] text-stone-900 dark:text-white transition-colors">
              Stonegate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => go(l.href)}
                className="text-[13.5px] font-medium transition-colors
                  text-stone-500 dark:text-white/45
                  hover:text-stone-900 dark:hover:text-white">
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Link to="/login"
              className="hidden sm:block px-3.5 py-2 text-[13px] font-semibold rounded-xl
                text-stone-600 dark:text-white/50
                hover:text-stone-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/signup"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold
                bg-[#C9A84C] text-[#0A0A0B] hover:bg-[#D4B558] transition-colors">
              Get started <IcoArrow size={13} />
            </Link>
            <button onClick={() => setOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                bg-stone-100 dark:bg-white/[0.06]
                text-stone-600 dark:text-white/60
                hover:bg-stone-200 dark:hover:bg-white/[0.10]">
              {open ? <IcoClose size={16} /> : <IcoMenu size={17} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden bg-[#F5F3EF]/98 dark:bg-[#0A0A0B]/98 backdrop-blur-xl
            border-t border-stone-200 dark:border-white/[0.06]">
            <div className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map(l => (
                <button key={l.label} onClick={() => go(l.href)}
                  className="w-full text-left px-3 py-3.5 rounded-xl text-[14px] font-medium
                    text-stone-700 dark:text-white/60
                    hover:bg-stone-100 dark:hover:bg-white/[0.04]
                    hover:text-stone-900 dark:hover:text-white transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
            <div className="px-4 pb-5 pt-2 border-t border-stone-200 dark:border-white/[0.06] flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 py-2">
                <span className="text-[13px] font-medium text-stone-500 dark:text-white/45">Appearance</span>
                <ThemeToggle />
              </div>
              <Link to="/login" onClick={() => setOpen(false)}
                className="py-3.5 text-center rounded-xl text-[14px] font-semibold
                  text-stone-600 dark:text-white/50 border border-stone-200 dark:border-white/[0.10]">
                Sign in
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)}
                className="py-3.5 text-center rounded-xl text-[14px] font-bold
                  bg-[#C9A84C] text-[#0A0A0B]">
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
// HERO
// Full-bleed dark hero. One powerful line. Real people photo.
// No stats, no feature bullets. Just the premise.
// ─────────────────────────────────────────────────────────────────────────────

const Hero = () => {
  const currencies = ['USD', 'GBP', 'EUR', 'NGN', 'JPY', 'CHF', 'AED', 'CAD'];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % currencies.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#F5F3EF] dark:bg-[#0A0A0B] pt-[64px] overflow-hidden flex items-center">

      {/* ── RIGHT SIDE: hero person image (desktop only, bleeds to viewport edge) ── */}
      <div className="hidden lg:block absolute right-0 top-[64px] bottom-0 w-[52%] pointer-events-none select-none">
        <img
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1400&q=95&auto=format&fit=crop&crop=top"
          alt=""
          className="w-full h-full object-cover object-top"
          loading="eager"
        />
        {/* Fade left edge into page bg */}
        <div className="absolute inset-y-0 left-0 w-[200px]"
          style={{ background: 'linear-gradient(to right, var(--lp-bg-primary) 30%, transparent)' }} />
        {/* Fade bottom edge */}
        <div className="absolute inset-x-0 bottom-0 h-[160px]"
          style={{ background: 'linear-gradient(to top, var(--lp-bg-primary) 20%, transparent)' }} />
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 w-full max-w-[1160px] mx-auto px-5 sm:px-8 py-24 sm:py-32">
        <div className="max-w-[560px]">

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#C9A84C]">
              Private banking · 185 countries
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-stone-900 dark:text-white leading-[1.04] mb-6"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(44px, 6.5vw, 76px)', letterSpacing: '-2px' }}>
            The world
            <br />
            is your{' '}
            <span style={{ color: '#C9A84C' }}>bank.</span>
          </h1>

          {/* Sub */}
          <p className="text-stone-500 dark:text-white/50 leading-relaxed mb-4 max-w-[440px]"
            style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}>
            Open{' '}
            <span className="text-stone-900 dark:text-white font-semibold transition-all duration-300">
              {currencies[idx]}
            </span>
            {' '}accounts, send money anywhere, and spend in every currency, from one place.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex -space-x-2">
              {['from-sky-500 to-blue-600','from-violet-500 to-purple-600','from-emerald-500 to-teal-600'].map((g, i) => (
                <div key={i} className={cn(
                  'w-7 h-7 rounded-full ring-2 ring-[#F5F3EF] dark:ring-[#0A0A0B]',
                  `bg-gradient-to-br ${g}`
                )} />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[0,1,2,3,4].map(i => <IcoStar key={i} />)}
            </div>
            <span className="text-[12px] text-stone-400 dark:text-white/35 font-mono">40,000+ clients</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/signup"
              className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl
                text-[15px] font-bold bg-[#C9A84C] text-[#0A0A0B]
                hover:bg-[#D4B558] transition-colors shadow-2xl shadow-[#C9A84C]/30">
              Open a free account
              <IcoArrow size={14} />
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl
                text-[15px] font-semibold
                border border-stone-300 dark:border-white/[0.14]
                text-stone-600 dark:text-white/55
                hover:border-stone-500 dark:hover:border-white/[0.28]
                hover:text-stone-900 dark:hover:text-white/80 transition-all">
              See what's inside
            </button>
          </div>
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <IcoChevron size={20} className="text-stone-400 dark:text-white/20" />
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE STRIP — currency flags scrolling
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCIES_LIST = [
  { code: 'USD', name: 'US Dollar',         sym: '$'  },
  { code: 'GBP', name: 'British Pound',     sym: '£'  },
  { code: 'EUR', name: 'Euro',              sym: '€'  },
  { code: 'NGN', name: 'Nigerian Naira',    sym: '₦' },
  { code: 'JPY', name: 'Japanese Yen',      sym: '¥'  },
  { code: 'CAD', name: 'Canadian Dollar',   sym: 'CA$' },
  { code: 'AED', name: 'UAE Dirham',        sym: 'د.إ' },
  { code: 'CHF', name: 'Swiss Franc',       sym: 'CHF' },
  { code: 'AUD', name: 'Australian Dollar', sym: 'A$' },
  { code: 'SGD', name: 'Singapore Dollar',  sym: 'S$' },
  { code: 'ZAR', name: 'South African Rand',sym: 'R'  },
  { code: 'BRL', name: 'Brazilian Real',    sym: 'R$' },
];

const MarqueeStrip = () => (
  <div className="bg-stone-100 dark:bg-[#111113] border-y border-stone-200 dark:border-white/[0.05] py-4 overflow-hidden">
    <div className="flex gap-8 animate-[marquee_30s_linear_infinite] whitespace-nowrap w-max">
      {[...CURRENCIES_LIST, ...CURRENCIES_LIST].map((c, i) => (
        <div key={i} className="flex items-center gap-2.5 shrink-0">
          <span className="text-[13px] font-bold font-mono text-stone-600 dark:text-white/70">{c.sym}</span>
          <span className="text-[12px] font-medium text-stone-500 dark:text-white/50">{c.name}</span>
          <span className="w-px h-3 bg-stone-300 dark:bg-white/[0.18]" />
        </div>
      ))}
    </div>
    <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LIFESTYLE FEATURE BLOCKS
// Grey.co pattern: alternating left/right full-bleed sections with a big photo
// and a concise value prop beside it.
// ─────────────────────────────────────────────────────────────────────────────

const FeatureBlock = ({
  tag, headline, body, imgSrc, imgAlt, reverse = false, accent = '#C9A84C',
  cta, ctaHref = '/signup',
}: {
  tag: string; headline: React.ReactNode; body: string;
  imgSrc: string; imgAlt: string; reverse?: boolean;
  accent?: string; cta?: string; ctaHref?: string;
}) => (
  <div className={cn(
    'flex flex-col gap-0',
    reverse ? 'lg:flex-row-reverse' : 'lg:flex-row',
    'min-h-[520px] lg:min-h-[580px]'
  )}>
    {/* Image half */}
    <div className="relative w-full lg:w-1/2 min-h-[280px] sm:min-h-[380px] lg:min-h-0 overflow-hidden">
      <img
        src={imgSrc}
        alt={imgAlt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0"
        style={{
          background: reverse
            ? 'linear-gradient(to right, transparent 60%, var(--lp-bg-primary))'
            : 'linear-gradient(to left, transparent 60%, var(--lp-bg-primary))'
        }} />
    </div>

    {/* Text half */}
    <div className={cn(
      'w-full lg:w-1/2 bg-[#F5F3EF] dark:bg-[#0A0A0B] flex items-center',
      'px-6 py-12 sm:px-10 sm:py-16 lg:px-16 xl:px-20'
    )}>
      <div className="max-w-[420px]">
        <span className="text-[10px] font-bold tracking-[0.22em] uppercase mb-4 block"
          style={{ color: accent }}>
          {tag}
        </span>
        <h2 className="text-stone-900 dark:text-white leading-tight mb-5"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.8px' }}>
          {headline}
        </h2>
        <p className="text-stone-500 dark:text-white/45 leading-relaxed mb-8"
          style={{ fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
          {body}
        </p>
        {cta && (
          <Link to={ctaHref}
            className="inline-flex items-center gap-2 text-[14px] font-bold transition-colors"
            style={{ color: accent }}>
            {cta} <IcoArrow size={14} />
          </Link>
        )}
      </div>
    </div>
  </div>
);

const FeaturesSection = () => (
  <section id="features" className="bg-[#F5F3EF] dark:bg-[#0A0A0B]">
    {/* Section intro */}
    <div className="max-w-[1160px] mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-16">
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-4">
        Built for you
      </p>
      <h2 className="text-stone-900 dark:text-white max-w-[560px]"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-1px' }}>
        Banking that moves
        <br />
        <span className="text-stone-400 dark:text-white/35">as fast as you do.</span>
      </h2>
    </div>

    {/* Feature blocks */}
    <FeatureBlock
      tag="Multi-currency accounts"
      headline={<>Hold <em style={{ fontStyle:'normal', color:'#C9A84C' }}>every</em> currency<br />you work in.</>}
      body="Open USD, GBP, EUR, NGN and 30+ currency accounts instantly. Real balances, real IBANs, not just conversion wrappers. Your money lives where you need it."
      imgSrc="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1400&q=95&auto=format&fit=crop"
      imgAlt="Person managing multiple currency accounts on phone"
      cta="Open your first account"
    />

    <FeatureBlock
      tag="Global transfers"
      headline={<>Send money.<br />Land in minutes.</>}
      body="SWIFT, SEPA, ACH or Stonegate-to-Stonegate. Transfers to 185 countries at 0.5% with no hidden markups. Your recipient gets notified instantly."
      imgSrc="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1400&q=95&auto=format&fit=crop"
      imgAlt="Global money transfer"
      reverse
      cta="See transfer fees"
    />

    <FeatureBlock
      tag="Virtual & physical cards"
      headline={<>One card.<br />Every currency.</>}
      body="Your Stonegate card auto-converts at the live rate when you spend abroad. No FX surcharges. Freeze it in seconds if you ever need to."
      imgSrc="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=95&auto=format&fit=crop"
      imgAlt="Card payment anywhere in the world"
      cta="Get your card"
    />

    <FeatureBlock
      tag="Currency exchange"
      headline={<>Convert at the<br />real rate.</>}
      body="We use the mid-market rate, the same one banks use with each other, not the inflated tourist rate. No rate markups, ever."
      imgSrc="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=95&auto=format&fit=crop"
      imgAlt="Live currency exchange rates"
      reverse
      cta="See live rates"
    />
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// WHO IS NEXUS FOR — lifestyle photography grid
// ─────────────────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    title: 'Freelancers',
    body: 'Get paid in USD or EUR from clients worldwide. No more losing 5% to currency conversion.',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=95&auto=format&fit=crop',
    color: '#C9A84C',
  },
  {
    title: 'Digital nomads',
    body: 'Bank from anywhere. Your accounts follow your timezone, not your zip code.',
    img: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=900&q=95&auto=format&fit=crop',
    color: '#60a5fa',
  },
  {
    title: 'Global businesses',
    body: 'Pay suppliers, receive client payments and manage team expenses, all in the same dashboard.',
    img: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=900&q=95&auto=format&fit=crop',
    color: '#34d399',
  },
];

const PersonaSection = () => (
  <section id="how"
    className="bg-white dark:bg-[#111113] py-20 sm:py-28">
    <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
      <div className="mb-14">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-4">
          Who it's for
        </p>
        <h2 className="text-stone-900 dark:text-white"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(30px, 4.5vw, 52px)', letterSpacing: '-0.8px' }}>
          Built for a world
          <br />
          <span className="text-stone-400 dark:text-white/35">without borders.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {PERSONAS.map(p => (
          <div key={p.title}
            className="rounded-3xl overflow-hidden bg-[#F5F3EF] dark:bg-[#0A0A0B] border border-stone-200 dark:border-white/[0.07]
              group cursor-pointer transition-all hover:border-stone-300 dark:hover:border-white/[0.15]">
            {/* Photo */}
            <div className="relative h-[220px] sm:h-[260px] overflow-hidden">
              <img src={p.img} alt={p.title}
                className="w-full h-full object-cover transition-transform duration-700
                  group-hover:scale-105" />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, var(--lp-bg-primary) 20%, transparent 70%)' }} />
            </div>
            {/* Text */}
            <div className="px-6 pb-7 pt-2">
              <h3 className="text-white text-[18px] font-bold tracking-[-0.3px] mb-2"
                style={{ color: p.color }}>
                {p.title}
              </h3>
              <p className="text-stone-500 dark:text-white/40 text-[13.5px] leading-relaxed">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// APP PREVIEW — dark phone mockup with UI screenshot
// ─────────────────────────────────────────────────────────────────────────────

const AppPreview = () => {
  const [tab, setTab] = useState<'send' | 'receive' | 'convert'>('send');

  const TABS = [
    { id: 'send'    as const, label: 'Send'    },
    { id: 'receive' as const, label: 'Receive' },
    { id: 'convert' as const, label: 'Convert' },
  ];

  return (
    <section className="bg-[#F5F3EF] dark:bg-[#0A0A0B] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8
        grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left text */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-4">
            The dashboard
          </p>
          <h2 className="text-stone-900 dark:text-white mb-6 leading-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-0.8px' }}>
            Everything in
            <br />one clean view.
          </h2>
          <p className="text-stone-500 dark:text-white/40 leading-relaxed mb-10 max-w-[400px]"
            style={{ fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
            Your balances, recent activity, exchange rates and transfer history, designed to be understood at a glance, even across 4 currencies.
          </p>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-8">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-[13px] font-bold border transition-all',
                  tab === t.id
                    ? 'bg-[#C9A84C] text-[#0A0A0B] border-[#C9A84C]'
                    : 'bg-stone-100 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08] text-stone-500 dark:text-white/40 hover:text-stone-800 dark:hover:text-white/65'
                )}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab detail */}
          <div className="space-y-3">
            {tab === 'send' && [
              '185 countries, SWIFT and SEPA supported',
              'Saved recipients, send in 2 taps',
              'Arrive in minutes, not days',
            ].map(s => (
              <div key={s} className="flex items-center gap-3">
                <IcoCheck className="text-[#C9A84C] shrink-0" />
                <span className="text-[13.5px] text-stone-600 dark:text-white/50">{s}</span>
              </div>
            ))}
            {tab === 'receive' && [
              'Your own IBAN and account number',
              'QR code for instant payments',
              'Payment requests via link or email',
            ].map(s => (
              <div key={s} className="flex items-center gap-3">
                <IcoCheck className="text-[#C9A84C] shrink-0" />
                <span className="text-[13.5px] text-stone-600 dark:text-white/50">{s}</span>
              </div>
            ))}
            {tab === 'convert' && [
              'Mid-market rate, zero markup',
              'Convert between 30+ currencies instantly',
              'Set rate alerts for your pairs',
            ].map(s => (
              <div key={s} className="flex items-center gap-3">
                <IcoCheck className="text-[#C9A84C] shrink-0" />
                <span className="text-[13.5px] text-stone-600 dark:text-white/50">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: stylized UI preview block */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
          </div>

          {/* Phone-ish card */}
          <div className="relative w-full max-w-[360px] rounded-3xl overflow-hidden
            border border-white/[0.09] bg-[#111113] shadow-2xl shadow-black/60">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-3
              border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-white/30 font-mono">
                NEXUS PRIVATE
              </span>
              <LogoMark size={18} />
            </div>

            {/* Balance */}
            <div className="px-5 py-5 border-b border-white/[0.06]">
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase
                text-white/25 mb-1">
                Total balance
              </p>
              <p className="text-white font-bold leading-none mb-0.5"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '34px', letterSpacing: '-0.5px' }}>
                $24,500<span className="text-white/30 text-[18px]">.00</span>
              </p>
              <p className="text-[11px] font-mono text-emerald-400">↑ +$1,840.20 this month</p>
            </div>

            {/* Currency tiles */}
            <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06]">
              {[
                { code:'USD', sym:'$',  val:'14,250', up:true  },
                { code:'GBP', sym:'£',  val:'2,100',  up:true  },
                { code:'EUR', sym:'€',  val:'3,800',  up:false },
                { code:'NGN', sym:'₦', val:'850K',   up:false },
              ].map(c => (
                <div key={c.code} className="px-4 py-4">
                  <p className="text-[9px] font-bold tracking-[0.12em] uppercase
                    text-white/25 mb-1">
                    {c.code}
                  </p>
                  <p className="font-mono font-bold text-white text-[15px]">
                    {c.sym}{c.val}
                  </p>
                  <p className={cn(
                    'text-[10px] font-mono mt-0.5',
                    c.up ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {c.up ? '↑' : '↓'} {c.up ? '+1.2%' : '-0.8%'}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="px-5 pb-5 pt-4">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase
                text-white/25 mb-3">
                Recent
              </p>
              {[
                { name:'Sophie Müller',  amt:'+€380',  g:'from-sky-500 to-blue-600',     i:'SM' },
                { name:'TechCorp Ltd.',  amt:'-$4,500', g:'from-slate-500 to-slate-700',  i:'TC' },
                { name:'Marcus Chen',   amt:'+$2,500', g:'from-emerald-500 to-teal-600', i:'MC' },
              ].map(tx => (
                <div key={tx.name} className="flex items-center gap-2.5 py-2.5
                  border-b border-white/[0.04] last:border-0">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center',
                    'text-white text-[10px] font-bold shrink-0',
                    `bg-gradient-to-br ${tx.g}`
                  )}>
                    {tx.i}
                  </div>
                  <p className="flex-1 text-[12px] font-medium text-white/65 truncate">
                    {tx.name}
                  </p>
                  <p className={cn(
                    'text-[12px] font-mono font-bold shrink-0',
                    tx.amt.startsWith('+') ? 'text-emerald-400' : 'text-white/50'
                  )}>
                    {tx.amt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS — minimal, editorial, no cards
// ─────────────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'Finally a bank that understands my life isn\'t limited to one country.',
    name: 'Amara O.', role: 'Freelance developer · Lagos & London',
    img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=95&auto=format&fit=crop&crop=faces',
    color: 'from-violet-500 to-purple-600',
  },
  {
    quote: 'I pay suppliers in Germany and clients in the US. Stonegate is the only tool that handles both without eating my margins.',
    name: 'James T.', role: 'Import business owner · Accra',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=95&auto=format&fit=crop&crop=faces',
    color: 'from-sky-500 to-blue-600',
  },
  {
    quote: 'I\'ve been a digital nomad for 3 years. Stonegate is the first bank that didn\'t make me feel like a problem to solve.',
    name: 'Sophie M.', role: 'UX designer · Remote',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=95&auto=format&fit=crop&crop=faces',
    color: 'from-emerald-500 to-teal-600',
  },
];

const Testimonials = () => (
  <section className="bg-white dark:bg-[#111113] py-20 sm:py-28">
    <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
      <div className="mb-16">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-4">
          Real people
        </p>
        <h2 className="text-stone-900 dark:text-white"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(30px, 4.5vw, 52px)', letterSpacing: '-0.8px' }}>
          Their words,
          <br />
          <span className="text-stone-400 dark:text-white/30">not ours.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-16">
        {TESTIMONIALS.map(t => (
          <div key={t.name} className="flex flex-col gap-6">
            {/* Stars */}
            <div className="flex gap-1">
              {[0,1,2,3,4].map(i => <IcoStar key={i} />)}
            </div>
            {/* Quote */}
            <p className="text-stone-600 dark:text-white/60 text-[15px] sm:text-[16px] leading-relaxed italic flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            {/* Person */}
            <div className="flex items-center gap-3.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img src={t.img} alt={t.name}
                  className="w-full h-full object-cover" />
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
// PRICING
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    sub: 'forever',
    features: ['1 currency account', '$1,000 monthly transfers', 'Stonegate wallet', 'Virtual card'],
    cta: 'Start for free',
    featured: false,
  },
  {
    name: 'Premium',
    price: '$19',
    sub: 'per month',
    features: ['4 currency accounts', '$50K monthly transfers', 'Physical + virtual card', 'Priority support', 'FX alerts', 'Loan access'],
    cta: 'Start free trial',
    featured: true,
    badge: 'Most popular',
  },
  {
    name: 'Private',
    price: '$79',
    sub: 'per month',
    features: ['Unlimited currencies', 'Unlimited transfers', 'Dedicated banker', 'Zero transfer fee', 'API access', 'Team & roles'],
    cta: 'Talk to us',
    featured: false,
  },
];

const Pricing = () => (
  <section id="pricing" className="bg-[#F5F3EF] dark:bg-[#0A0A0B] py-20 sm:py-28">
    <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
      <div className="max-w-[480px] mb-14">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-4">
          Pricing
        </p>
        <h2 className="text-stone-900 dark:text-white"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.8px' }}>
          Honest pricing.
          <br />
          <span className="text-stone-400 dark:text-white/30">No fine print.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        {PLANS.map(p => (
          <div key={p.name}
            className={cn(
              'rounded-3xl border p-7 transition-all',
              p.featured
                ? 'bg-[#C9A84C]/[0.06] dark:bg-white/[0.04] border-[#C9A84C]/30 ring-1 ring-[#C9A84C]/15'
                : 'bg-white dark:bg-[#111113] border-stone-200 dark:border-white/[0.07]'
            )}>
            {p.badge && (
              <span className="inline-block text-[9px] font-bold uppercase tracking-[0.14em]
                text-[#C9A84C] bg-[#C9A84C]/15 px-2.5 py-1 rounded-full mb-5">
                {p.badge}
              </span>
            )}
            {!p.badge && <div className="mb-5 h-[28px]" />}

            <p className="text-[13px] font-bold text-stone-500 dark:text-white/50 mb-2">{p.name}</p>
            <p className="text-stone-900 dark:text-white font-bold leading-none mb-1"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(32px, 4vw, 42px)', letterSpacing: '-0.5px' }}>
              {p.price}
            </p>
            <p className="text-[12px] font-mono text-stone-400 dark:text-white/25 mb-8">{p.sub}</p>

            <div className="space-y-3 mb-8">
              {p.features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0
                    bg-[#C9A84C]/15">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4l2 2 4-4"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-stone-600 dark:text-white/45">{f}</span>
                </div>
              ))}
            </div>

            <Link to="/signup"
              className={cn(
                'flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[13.5px] font-bold transition-all',
                p.featured
                  ? 'bg-[#C9A84C] text-[#0A0A0B] hover:bg-[#D4B558]'
                  : 'border border-stone-300 dark:border-white/[0.12] text-stone-600 dark:text-white/55 hover:border-stone-400 dark:hover:border-white/[0.25] hover:text-stone-900 dark:hover:text-white/80'
              )}>
              {p.cta} <IcoArrow size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// FINAL CTA — full-bleed photo with overlay text
// ─────────────────────────────────────────────────────────────────────────────

const FinalCTA = () => (
  <section id="about" className="relative overflow-hidden min-h-[500px] flex items-center">
    {/* Background photo */}
    <img
      src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=95&auto=format&fit=crop"
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-30"
      loading="lazy"
    />
    {/* Overlay — dark in dark mode, light in light mode */}
    <div className="absolute inset-0 bg-[#F5F3EF]/80 dark:bg-[#0A0A0B]/70" />

    {/* Content */}
    <div className="relative z-10 max-w-[1160px] mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center w-full">
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-5">
        Ready?
      </p>
      <h2 className="text-stone-900 dark:text-white max-w-[640px] mx-auto mb-6 leading-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(36px, 6vw, 72px)', letterSpacing: '-1.5px' }}>
        Join the world.
        <br />
        <span className="text-stone-400 dark:text-white/35">Leave the limits.</span>
      </h2>
      <p className="text-stone-500 dark:text-white/40 text-[16px] mb-10 max-w-[420px] mx-auto leading-relaxed">
        Open your account in under 3 minutes. No paperwork. No branch visits. No borders.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/signup"
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl
            text-[15px] font-bold bg-[#C9A84C] text-[#0A0A0B]
            hover:bg-[#D4B558] transition-colors w-full sm:w-auto
            shadow-2xl shadow-[#C9A84C]/30">
          Open a free account
          <IcoArrow size={14} />
        </Link>
        <Link to="/login"
          className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl
            text-[15px] font-semibold
            border border-stone-400 dark:border-white/[0.18]
            text-stone-700 dark:text-white/55
            hover:border-stone-600 dark:hover:border-white/[0.32]
            hover:text-stone-900 dark:hover:text-white/80
            transition-all w-full sm:w-auto">
          Sign in
        </Link>
      </div>
      <p className="text-[11px] font-mono text-stone-500 dark:text-white/20 mt-6">
        FCA regulated · No credit card needed · Cancel any time
      </p>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="bg-stone-100 dark:bg-[#0A0A0B] border-t border-stone-200 dark:border-white/[0.05]">
    <div className="max-w-[1160px] mx-auto px-5 sm:px-8 py-14 sm:py-18">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <LogoMark size={24} />
            <span className="text-[15px] font-bold text-stone-900 dark:text-white tracking-[-0.3px]">Stonegate</span>
          </div>
          <p className="text-[12px] text-stone-500 dark:text-white/25 leading-relaxed max-w-[200px]">
            Private banking for a borderless world.
          </p>
        </div>
        {[
          { heading:'Product', links:['Features','Pricing','Cards','API docs','Changelog'] },
          { heading:'Company', links:['About','Blog','Careers','Press','Contact']          },
          { heading:'Legal',   links:['Privacy','Terms','Cookies','Compliance','Licenses'] },
          { heading:'Support', links:['Help centre','Status','Community','Partners','FAQs']},
        ].map(g => (
          <div key={g.heading}>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-stone-400 dark:text-white/20 mb-4">
              {g.heading}
            </p>
            <div className="space-y-2.5">
              {g.links.map(l => (
                <p key={l}>
                  <a href="#" className="text-[13px] text-stone-500 dark:text-white/35 hover:text-stone-900 dark:hover:text-white/65 transition-colors">
                    {l}
                  </a>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-200 dark:border-white/[0.05] pt-8 flex flex-col sm:flex-row
        items-start sm:items-center justify-between gap-4">
        <p className="text-[12px] text-stone-400 dark:text-white/20 font-mono">
          © 2026 Stonegate Bank Ltd. FCA No. 987654.
        </p>
        <div className="flex gap-2 flex-wrap">
          {['FCA','PCI-DSS','ISO 27001','SOC 2'].map(b => (
            <span key={b} className="text-[9px] font-bold uppercase tracking-widest
              px-2 py-1 rounded-lg border border-stone-300 dark:border-white/[0.07] text-stone-400 dark:text-white/20">
              {b}
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
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0A0A0B]">
    <Nav />
    <main>
      <Hero />
      <MarqueeStrip />
      <FeaturesSection />
      <PersonaSection />
      <AppPreview />
      <Testimonials />
      <Pricing />
      <FinalCTA />
    </main>
    <Footer />
  </div>
);

export default LandingPage;