import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Information we collect',
    body: `We collect information you provide when you open an account, including your name, email address, date of birth, nationality, and source of funds. We also collect data about how you use our services — including transaction history, device information, and IP addresses — to keep your account secure and comply with our regulatory obligations.`,
  },
  {
    title: 'How we use your information',
    body: `Your information is used to operate and improve the Stonegate platform, verify your identity (KYC), process transfers and currency exchanges, detect fraud, and meet our obligations under FCA regulations. We never sell your personal data to third parties for marketing purposes.`,
  },
  {
    title: 'Data sharing',
    body: `We share data with regulated payment networks (SWIFT, SEPA, ACH), identity verification partners, and fraud prevention services strictly as required to execute your transactions. All partners are bound by data processing agreements and applicable data protection law.`,
  },
  {
    title: 'Data retention',
    body: `We retain your account data for the period your account is active and for at least six years after closure, as required by UK financial regulations. You may request deletion of non-regulatory data at any time by contacting support.`,
  },
  {
    title: 'Your rights',
    body: `Under UK GDPR you have the right to access, correct, or port your personal data; to object to processing; and to request erasure where lawful. To exercise any of these rights, contact us at privacy@stonegatefinance.com. You also have the right to lodge a complaint with the ICO.`,
  },
  {
    title: 'Cookies',
    body: `We use essential cookies to keep you signed in and session cookies to protect against CSRF attacks. We do not use advertising or tracking cookies. You can manage cookie preferences in your browser settings.`,
  },
  {
    title: 'Changes to this policy',
    body: `We may update this policy to reflect changes in law or our services. When we make material changes we will notify you by email and display a notice in the dashboard at least 30 days before the change takes effect.`,
  },
];

const PrivacyPage = () => (
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
        Privacy Policy
      </h1>
      <p className="text-[13px] font-mono text-stone-400 dark:text-white/25 mb-12">
        Last updated: 1 May 2026 · Stonegate Bank Ltd.
      </p>

      <p className="text-[15px] text-stone-600 dark:text-white/50 leading-relaxed mb-12">
        Stonegate Bank Ltd. ("Stonegate", "we", "us") is registered in England and Wales and authorised by the Financial Conduct Authority (FCA No. 987654). This policy explains how we collect, use, and protect your personal information when you use our platform.
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
          Questions? Contact our Data Protection Officer at{' '}
          <a href="mailto:privacy@stonegatefinance.com"
            className="text-[#C9A84C] hover:underline">
            privacy@stonegatefinance.com
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
