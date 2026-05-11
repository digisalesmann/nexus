import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Acceptance of terms',
    body: `By creating a Stonegate account you confirm that you are at least 18 years old, that you are opening the account for yourself (not on behalf of a third party unless disclosed), and that you agree to be bound by these terms. If you do not agree, do not use the service.`,
  },
  {
    title: 'The service',
    body: `Stonegate provides multi-currency accounts, international transfers, virtual and physical debit cards, and currency exchange. Features vary by account tier. We may add, modify, or withdraw features at any time with reasonable notice. The platform is provided "as is" and we do not guarantee uninterrupted availability.`,
  },
  {
    title: 'Account eligibility',
    body: `Accounts are available to individuals aged 18 and over who pass our identity verification (KYC) process. We reserve the right to decline any application or close any account that poses a regulatory, fraud, or reputational risk, including accounts from jurisdictions we are unable to serve.`,
  },
  {
    title: 'Acceptable use',
    body: `You may only use Stonegate for lawful purposes. Prohibited uses include money laundering, terrorist financing, fraud, sanctions evasion, and any activity that violates applicable law. We monitor transactions for suspicious activity and report to relevant authorities as required.`,
  },
  {
    title: 'Fees and rates',
    body: `Current fees are published on our Pricing page. Transfers are charged at 0.5% of the transfer amount unless a higher fee applies to your account tier. Currency exchange uses the mid-market rate plus any applicable spread shown at the time of conversion. We reserve the right to update fees with 30 days' notice.`,
  },
  {
    title: 'Liability',
    body: `Stonegate is not liable for losses arising from events outside our reasonable control, including third-party payment network outages, regulatory freezes, or force majeure events. Our aggregate liability to you is capped at the greater of £500 or the fees you paid us in the preceding 12 months. Nothing in these terms limits liability for fraud or death/personal injury caused by negligence.`,
  },
  {
    title: 'Termination',
    body: `Either party may close the account with 30 days' written notice. We may suspend or close accounts immediately for breach of these terms, suspected fraud, or regulatory requirements. On closure, remaining balances will be transferred to your nominated bank account within 5 business days, minus any outstanding fees.`,
  },
  {
    title: 'Governing law',
    body: `These terms are governed by English law. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. You may also refer disputes to the UK Financial Ombudsman Service (FOS) if we are unable to resolve them internally.`,
  },
];

const TermsPage = () => (
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
        Terms of Use
      </h1>
      <p className="text-[13px] font-mono text-stone-400 dark:text-white/25 mb-12">
        Last updated: 1 May 2026 · Stonegate Bank Ltd.
      </p>

      <p className="text-[15px] text-stone-600 dark:text-white/50 leading-relaxed mb-12">
        These Terms of Use ("Terms") form a legal agreement between you and Stonegate Bank Ltd. (company no. 12345678, registered in England and Wales, authorised by the FCA No. 987654). Please read them carefully before using our platform.
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

      <div className="mt-14 pt-10 border-t border-stone-200 dark:border-white/[0.07]">
        <p className="text-[13px] text-stone-400 dark:text-white/25">
          Questions about these terms?{' '}
          <Link to="/contact" className="text-[#C9A84C] hover:underline">
            Contact us
          </Link>{' '}
          or email{' '}
          <a href="mailto:legal@stonegatefinance.com" className="text-[#C9A84C] hover:underline">
            legal@stonegatefinance.com
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default TermsPage;
