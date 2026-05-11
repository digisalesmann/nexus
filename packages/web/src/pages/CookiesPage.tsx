import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'What are cookies?',
    body: `Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently and to provide information to site owners. Stonegate uses cookies only to the extent necessary for the platform to function securely.`,
  },
  {
    title: 'Cookies we use',
    body: `We use strictly necessary cookies to keep you authenticated between page loads and to protect your session against cross-site request forgery (CSRF). These cookies are essential — without them the platform cannot function. We do not use analytics, advertising, or third-party tracking cookies.`,
  },
  {
    title: 'Session cookies',
    body: `Session cookies are temporary and expire when you close your browser. We use them to maintain your login state during an active session. No personal data is stored in these cookies beyond a cryptographically signed session token.`,
  },
  {
    title: 'Persistent cookies',
    body: `We set one persistent cookie to remember your preferred colour scheme (light or dark mode). This cookie contains no personal data, has a 1-year lifetime, and is stored only on your device.`,
  },
  {
    title: 'Third-party cookies',
    body: `Stonegate does not embed third-party advertising networks, social widgets, or analytics trackers. Supabase, our database and authentication provider, may set session cookies required for secure API communication. These are governed by Supabase's own privacy policy.`,
  },
  {
    title: 'Managing cookies',
    body: `You can control and delete cookies through your browser settings. Deleting essential cookies will sign you out and may disrupt your ability to use the platform. Most browsers allow you to block third-party cookies by default without affecting site functionality — we recommend this setting.`,
  },
  {
    title: 'Updates to this policy',
    body: `We will notify you of any material changes to how we use cookies by displaying a notice in the platform at least 30 days before the change takes effect.`,
  },
];

const CookiesPage = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0A0A0B]">
    <div className="max-w-[760px] mx-auto px-5 sm:px-8 py-16 sm:py-24">

      <Link to="/" className="inline-flex items-center gap-2 mb-10
        text-[13px] font-semibold text-stone-400 dark:text-white/30
        hover:text-stone-700 dark:hover:text-white/60 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 7H3M6 4L3 7l3 3"/>
        </svg>
        Stonegate
      </Link>

      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-3">
        Legal
      </p>
      <h1 className="text-stone-900 dark:text-white mb-3 leading-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1px' }}>
        Cookie Policy
      </h1>
      <p className="text-[13px] font-mono text-stone-400 dark:text-white/25 mb-12">
        Last updated: 1 May 2026 · Stonegate Bank Ltd.
      </p>

      <p className="text-[15px] text-stone-600 dark:text-white/50 leading-relaxed mb-12">
        Stonegate is committed to transparency. This policy explains exactly which cookies we use, why we use them, and how you can control them.
      </p>

      <div className="space-y-10">
        {SECTIONS.map((s, i) => (
          <div key={s.title}>
            <h2 className="text-[17px] font-bold text-stone-900 dark:text-white mb-3">
              {i + 1}. {s.title}
            </h2>
            <p className="text-[14px] text-stone-500 dark:text-white/40 leading-relaxed">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      {/* Cookie summary table */}
      <div className="mt-12 rounded-2xl border border-stone-200 dark:border-white/[0.07] overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-white/[0.07]
          bg-stone-50 dark:bg-white/[0.02]">
          <p className="text-[12px] font-bold text-stone-500 dark:text-white/40 uppercase tracking-widest">
            Cookie summary
          </p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-white/[0.04]">
          {[
            { name: 'sb-auth-token',   purpose: 'Authentication session',       duration: 'Session',  type: 'Essential'  },
            { name: 'sb-csrf',         purpose: 'CSRF attack prevention',        duration: 'Session',  type: 'Essential'  },
            { name: 'stonegate-theme', purpose: 'Remember light / dark mode',   duration: '1 year',   type: 'Preference' },
          ].map(c => (
            <div key={c.name} className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-4">
              <p className="font-mono text-[12px] text-stone-700 dark:text-white/60">{c.name}</p>
              <p className="text-[12px] text-stone-500 dark:text-white/40 sm:col-span-1">{c.purpose}</p>
              <p className="text-[12px] text-stone-400 dark:text-white/25">{c.duration}</p>
              <p className={c.type === 'Essential'
                ? 'text-[11px] font-bold text-[#C9A84C]'
                : 'text-[11px] font-bold text-stone-400 dark:text-white/30'
              }>
                {c.type}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 pt-10 border-t border-stone-200 dark:border-white/[0.07]">
        <p className="text-[13px] text-stone-400 dark:text-white/25">
          Questions?{' '}
          <Link to="/contact" className="text-[#C9A84C] hover:underline">Contact us</Link>
          {' '}or read our{' '}
          <Link to="/privacy" className="text-[#C9A84C] hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  </div>
);

export default CookiesPage;
