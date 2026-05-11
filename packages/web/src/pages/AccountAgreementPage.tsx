import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Account opening and eligibility',
    body: `By completing the Stonegate account application you confirm that you are at least 18 years old, that all information provided is accurate and complete, and that you are opening the account for your own lawful use. Providing false or misleading information is a criminal offence and will result in immediate account closure and referral to relevant authorities.`,
  },
  {
    title: 'Identity verification (KYC/AML)',
    body: `Stonegate is required by law to verify the identity of all account holders under the UK Money Laundering Regulations 2017. You agree to provide any documents or information we request to complete this verification, including government-issued photo ID, proof of address, and evidence of source of funds. We may use third-party identity verification providers to assist with this process. We may suspend or close your account if verification cannot be completed or if we identify suspicious activity.`,
  },
  {
    title: 'Account operation',
    body: `You are responsible for all transactions made from your account and for keeping your login credentials secure. You must not share your password, allow another person to access your account, or use the account for business transactions unless you have a registered business account. You agree to notify Stonegate immediately at security@stonegatefinance.com if you suspect unauthorised access to your account.`,
  },
  {
    title: 'Currency accounts and balances',
    body: `Each currency wallet is a distinct account balance denominated in the specified currency. Balances do not earn interest unless a Savings feature is activated. Exchange rates applied to currency conversions are the mid-market rates at the time of the transaction plus any applicable spread disclosed at the point of conversion. Rates are not guaranteed in advance.`,
  },
  {
    title: 'Authorised transactions',
    body: `You authorise Stonegate to debit your account to execute transfers, currency exchanges, card transactions, and fee deductions that you initiate through the platform. Transactions are deemed authorised when you confirm them within the app. You may cancel a transaction only before it is processed. Once a payment order has been submitted to a correspondent bank or payment network it cannot be recalled without the cooperation of the receiving institution.`,
  },
  {
    title: 'Fees and charges',
    body: `Fees applicable to your account tier are published on the Stonegate Pricing page and may be updated with 30 days' notice. You authorise Stonegate to deduct fees directly from your account balance. If your balance is insufficient to cover a fee, we may restrict account functionality until the balance is restored. We will never charge a fee without prior disclosure.`,
  },
  {
    title: 'Card terms',
    body: `Stonegate debit cards are issued subject to the card scheme rules of Visa or Mastercard (as applicable). You agree to use the card only for lawful purchases. Stonegate may decline or reverse transactions that appear fraudulent, violate card scheme rules, or breach this agreement. Chargebacks must be raised within 13 months of the transaction date. Virtual cards are for online use only; physical cards may be used at any point-of-sale terminal worldwide.`,
  },
  {
    title: 'Account closure',
    body: `You may close your account at any time by contacting support. Any outstanding balance will be transferred to your nominated external account within 5 business days of closure, after deduction of any outstanding fees. Stonegate may close your account immediately if you breach this agreement, if we are required to do so by a regulator or court order, or if we determine that continued operation poses a legal or regulatory risk. We will give 30 days' notice for voluntary closures where possible.`,
  },
  {
    title: 'Liability and disputes',
    body: `Stonegate is not liable for losses arising from authorised transactions you have initiated, network outages outside our reasonable control, or actions taken by correspondent banks. If you believe a transaction was made without your authorisation, you must notify us within 13 months. We will investigate and, if the transaction is confirmed to be unauthorised, refund the amount within 10 business days. Disputes that cannot be resolved with our support team may be referred to the Financial Ombudsman Service (FOS).`,
  },
  {
    title: 'Amendments',
    body: `Stonegate may amend the terms of this agreement with 30 days' written notice sent to the email address registered on your account. Continued use of the account after the notice period constitutes acceptance of the amended terms. If you do not accept an amendment, you may close your account before the change takes effect without penalty.`,
  },
];

const AccountAgreementPage = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0A0A0B]">
    <div className="max-w-[760px] mx-auto px-5 sm:px-8 py-16 sm:py-24">

      <Link to="/signup" className="inline-flex items-center gap-2 mb-10
        text-[13px] font-semibold text-stone-400 dark:text-white/30
        hover:text-stone-700 dark:hover:text-white/60 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 7H3M6 4L3 7l3 3"/>
        </svg>
        Back to sign up
      </Link>

      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-3">
        Legal
      </p>
      <h1 className="text-stone-900 dark:text-white mb-3 leading-tight"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1px' }}>
        Account Agreement
      </h1>
      <p className="text-[13px] font-mono text-stone-400 dark:text-white/25 mb-12">
        Last updated: 1 May 2026 · Stonegate Bank Ltd.
      </p>

      <p className="text-[15px] text-stone-600 dark:text-white/50 leading-relaxed mb-12">
        This Account Agreement ("Agreement") governs your use of all Stonegate Bank Ltd. accounts, products, and services. By opening an account you confirm that you have read, understood, and agree to be bound by this Agreement, our{' '}
        <Link to="/terms" target="_blank" className="text-[#C9A84C] hover:underline">Terms of Use</Link>,{' '}
        and our{' '}
        <Link to="/privacy" target="_blank" className="text-[#C9A84C] hover:underline">Privacy Policy</Link>.
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

      <div className="mt-14 rounded-2xl border border-[#C9A84C]/20 dark:border-[#C9A84C]/15
        bg-[#C9A84C]/[0.04] dark:bg-[#C9A84C]/[0.06] px-6 py-5">
        <p className="text-[13px] text-stone-600 dark:text-white/50 leading-relaxed">
          By ticking the checkbox on the sign-up form, you confirm that you have read and agree to this Agreement. Stonegate Bank Ltd. is authorised and regulated by the Financial Conduct Authority (FCA No. 987654), registered in England and Wales (Company No. 12345678).
        </p>
      </div>

      <div className="mt-10 pt-8 border-t border-stone-200 dark:border-white/[0.07]">
        <p className="text-[13px] text-stone-400 dark:text-white/25">
          Questions?{' '}
          <Link to="/contact" className="text-[#C9A84C] hover:underline">Contact us</Link>
          {' '}or email{' '}
          <a href="mailto:legal@stonegatefinance.com" className="text-[#C9A84C] hover:underline">
            legal@stonegatefinance.com
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default AccountAgreementPage;
