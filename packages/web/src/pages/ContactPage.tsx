import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { AppSelect } from '../components/AppSelect';

const TOPICS = [
  'Account access',
  'Transfers & payments',
  'Currency exchange',
  'Cards',
  'KYC / verification',
  'Billing & fees',
  'Other',
];

const inputCls = cn(
  'w-full px-4 py-3 rounded-xl border text-[14px] outline-none transition-colors',
  'bg-stone-50 dark:bg-white/[0.02]',
  'border-stone-200 dark:border-white/[0.08]',
  'text-stone-900 dark:text-white',
  'placeholder:text-stone-300 dark:placeholder:text-white/20',
  'focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40'
);

const ContactPage = () => {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [topic,   setTopic]   = useState('');
  const [message, setMessage] = useState('');
  const [sent,    setSent]    = useState(false);

  const valid = name.trim() && email.includes('@') && topic && message.trim().length >= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0A0A0B]">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 py-16 sm:py-24">

        <Link to="/" className="inline-flex items-center gap-2 mb-10
          text-[13px] font-semibold text-stone-400 dark:text-white/30
          hover:text-stone-700 dark:hover:text-white/60 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 7H3M6 4L3 7l3 3"/>
          </svg>
          Stonegate
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A84C] mb-3">
              Support
            </p>
            <h1 className="text-stone-900 dark:text-white mb-5 leading-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1px' }}>
              How can we help?
            </h1>
            <p className="text-[15px] text-stone-500 dark:text-white/40 leading-relaxed mb-12 max-w-[400px]">
              Our support team typically responds within 4 business hours. For urgent account security issues, call our 24/7 line.
            </p>

            <div className="space-y-6">
              {[
                {
                  label: 'Email support',
                  value: 'support@stonegatefinance.com',
                  href: 'mailto:support@stonegatefinance.com',
                  note: 'Response within 4 hours',
                },
                {
                  label: '24/7 security line',
                  value: '+44 20 7946 0958',
                  href: 'tel:+442079460958',
                  note: 'For lost cards and account security only',
                },
                {
                  label: 'Registered office',
                  value: '25 Canary Wharf, London E14 5AB',
                  href: undefined,
                  note: 'Stonegate Bank Ltd. · FCA No. 987654',
                },
              ].map(c => (
                <div key={c.label} className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-stone-400 dark:text-white/20">
                    {c.label}
                  </p>
                  {c.href
                    ? <a href={c.href} className="text-[14px] font-semibold text-stone-900 dark:text-white hover:text-[#C9A84C] transition-colors">
                        {c.value}
                      </a>
                    : <p className="text-[14px] font-semibold text-stone-900 dark:text-white">{c.value}</p>
                  }
                  <p className="text-[12px] text-stone-400 dark:text-white/25">{c.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className={cn(
            'rounded-2xl border p-7 sm:p-9',
            'bg-white dark:bg-white/[0.02]',
            'border-stone-200 dark:border-white/[0.08]',
            'shadow-xl shadow-black/[0.04] dark:shadow-black/30'
          )}>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10
                  flex items-center justify-center ring-4 ring-emerald-50 dark:ring-emerald-500/[0.08]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <p className="text-[18px] font-bold text-stone-900 dark:text-white">Message sent</p>
                <p className="text-[13px] text-stone-400 dark:text-white/30 max-w-[260px]">
                  We&apos;ll get back to you within 4 business hours.
                </p>
                <button
                  onClick={() => { setSent(false); setName(''); setEmail(''); setTopic(''); setMessage(''); }}
                  className="mt-2 text-[13px] font-semibold text-[#C9A84C] hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                    Topic
                  </label>
                  <AppSelect
                    value={topic}
                    onChange={setTopic}
                    options={TOPICS}
                    placeholder="Select a topic…"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/40 mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Describe your issue in detail…"
                    className={cn(inputCls, 'resize-none')}
                  />
                  <p className="text-[10px] font-mono text-stone-300 dark:text-white/15 mt-1">
                    {message.length}/500
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!valid}
                  className={cn(
                    'w-full py-3.5 rounded-xl text-[14px] font-bold transition-all mt-2',
                    valid
                      ? 'bg-[#C9A84C] text-[#0C0C0D] hover:bg-[#D4B558] shadow-md shadow-[#C9A84C]/20'
                      : 'bg-stone-100 dark:bg-white/[0.04] text-stone-300 dark:text-white/20 cursor-not-allowed'
                  )}
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
