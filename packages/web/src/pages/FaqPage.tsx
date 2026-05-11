import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const FAQS: { q: string; a: string; category: string }[] = [
  // Getting started
  {
    category: 'Getting started',
    q: 'How do I open a Stonegate account?',
    a: 'Click "Get started" on the homepage and complete the two-step sign-up. You\'ll need a valid email address, a government-issued ID, and proof of your source of funds. The whole process takes under 5 minutes.',
  },
  {
    category: 'Getting started',
    q: 'What documents do I need for verification?',
    a: 'A passport, national ID card, or driver\'s licence is required for identity verification (KYC). We may also ask for a proof of address (utility bill or bank statement dated within 90 days) depending on your account tier.',
  },
  {
    category: 'Getting started',
    q: 'Which countries is Stonegate available in?',
    a: 'Stonegate accounts are available to residents of 185 countries. Some high-risk or sanctioned jurisdictions are excluded. You will be notified at sign-up if your country of residence is not currently supported.',
  },
  // Accounts & currencies
  {
    category: 'Accounts & currencies',
    q: 'Which currencies can I hold?',
    a: 'Free accounts include one currency wallet. Premium accounts support USD, GBP, EUR, and CHF. Private accounts unlock 30+ currencies including JPY, CAD, AED, AUD, SGD, and more. Currency wallets are opened instantly — there is no waiting period.',
  },
  {
    category: 'Accounts & currencies',
    q: 'Do I get a real IBAN and account number?',
    a: 'Yes. Each currency wallet comes with a dedicated account number and sort code (GBP), IBAN (EUR), or routing/account number (USD). These are real accounts you can share with clients, employers, and payment providers.',
  },
  {
    category: 'Accounts & currencies',
    q: 'Is my money protected?',
    a: 'Stonegate is authorised and regulated by the Financial Conduct Authority (FCA No. 987654). Client funds are held in segregated accounts at tier-1 banks and are not used for lending. Eligible deposits are protected by the Financial Services Compensation Scheme (FSCS) up to £85,000.',
  },
  // Transfers
  {
    category: 'Transfers',
    q: 'How fast are international transfers?',
    a: 'Stonegate-to-Stonegate transfers arrive instantly. SEPA transfers within Europe typically arrive same-day. SWIFT transfers to most destinations arrive within 1–2 business days. ACH transfers within the US arrive next business day.',
  },
  {
    category: 'Transfers',
    q: 'What are the transfer fees?',
    a: 'Transfers are charged at 0.5% of the transfer amount. There are no flat fees and no hidden markups on the exchange rate. Private plan customers enjoy zero transfer fees. Full fee details are on the Pricing page.',
  },
  {
    category: 'Transfers',
    q: 'Is there a transfer limit?',
    a: 'Free accounts are limited to $1,000 per month. Premium accounts allow up to $50,000 per month. Private accounts have no monthly cap. Single transfer limits may vary by destination country for compliance reasons.',
  },
  // Cards
  {
    category: 'Cards',
    q: 'How does the Stonegate card work abroad?',
    a: 'Your card is linked to your primary wallet. When you spend in a currency you hold, the balance is debited directly. When you spend in a currency you don\'t hold, it is converted at the live mid-market rate with no FX surcharge.',
  },
  {
    category: 'Cards',
    q: 'Can I freeze my card?',
    a: 'Yes. You can freeze and unfreeze your card instantly from the Cards section in your dashboard. A frozen card cannot be used for new transactions but existing recurring payments are not affected.',
  },
  // Security
  {
    category: 'Security',
    q: 'How do I reset my password?',
    a: 'Go to the login page and click "Forgot password". Enter your email address and we will send a secure reset link. The link expires after 1 hour. If you suspect your account has been compromised, contact our 24/7 security line immediately.',
  },
  {
    category: 'Security',
    q: 'Does Stonegate support two-factor authentication?',
    a: 'Yes. Two-factor authentication (2FA) via email OTP is enabled by default. Authenticator app support is available on Premium and Private plans. We strongly recommend enabling 2FA on all accounts.',
  },
];

const CATEGORIES = Array.from(new Set(FAQS.map(f => f.category)));

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn(
      'rounded-xl border transition-colors overflow-hidden',
      open
        ? 'border-[#C9A84C]/30 dark:border-[#C9A84C]/20'
        : 'border-stone-200 dark:border-white/[0.07]'
    )}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left
          bg-white dark:bg-white/[0.02] hover:bg-stone-50 dark:hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-[14px] font-semibold text-stone-900 dark:text-white leading-snug">
          {q}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          className={cn(
            'shrink-0 mt-0.5 text-stone-400 dark:text-white/30 transition-transform duration-200',
            open && 'rotate-180'
          )}
        >
          <path d="M2 4.5l5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-white dark:bg-white/[0.02]">
          <p className="text-[14px] text-stone-500 dark:text-white/40 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

const FaqPage = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0A0A0B]">
    <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-16 sm:py-24">

      <Link to="/" className="inline-flex items-center gap-2 mb-10
        text-[13px] font-semibold text-stone-400 dark:text-white/30
        hover:text-stone-700 dark:hover:text-white/60 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 7H3M6 4L3 7l3 3"/>
        </svg>
        Stonegate
      </Link>

      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-3">
        Support
      </p>
      <h1 className="text-stone-900 dark:text-white mb-3 leading-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1px' }}>
        Frequently asked
        <br />questions.
      </h1>
      <p className="text-[15px] text-stone-500 dark:text-white/40 leading-relaxed mb-14 max-w-[480px]">
        Can't find an answer?{' '}
        <Link to="/contact" className="text-[#C9A84C] hover:underline">Contact our team</Link>
        {' '}and we'll get back to you within 4 hours.
      </p>

      <div className="space-y-12">
        {CATEGORIES.map(cat => (
          <div key={cat}>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase
              text-stone-400 dark:text-white/25 mb-4">
              {cat}
            </p>
            <div className="space-y-2">
              {FAQS.filter(f => f.category === cat).map(f => (
                <AccordionItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-stone-200 dark:border-white/[0.07]
        bg-white dark:bg-white/[0.02] px-7 py-7 text-center">
        <p className="text-[16px] font-bold text-stone-900 dark:text-white mb-2">
          Still have questions?
        </p>
        <p className="text-[13px] text-stone-400 dark:text-white/30 mb-5">
          Our support team is available Monday to Friday, 8am–8pm GMT.
        </p>
        <Link to="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13.5px] font-bold
            bg-[#C9A84C] text-[#0A0A0B] hover:bg-[#D4B558] transition-colors">
          Contact support
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </Link>
      </div>
    </div>
  </div>
);

export default FaqPage;
