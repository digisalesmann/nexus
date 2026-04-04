import { useState } from 'react';
import { Link } from 'react-router-dom';

const LogoMark = () => (
  <img src="/sg.jpeg" alt="Stonegate" width={28} height={28}
    style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
);

const LoginPage = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0C0C0D] flex flex-col">

      {/* Nav strip */}
      <header className="px-6 sm:px-10 h-[60px] flex items-center justify-between
        border-b border-stone-200 dark:border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-[-0.3px] text-stone-900 dark:text-white">
            Stonegate
          </span>
        </Link>
        <p className="text-[13px] text-stone-500 dark:text-white/40">
          No account?{' '}
          <Link to="/signup"
            className="font-semibold text-[#C9A84C] hover:text-[#D4B558] transition-colors">
            Sign up
          </Link>
        </p>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[400px]">

          <div className="mb-8">
            <h1 className="font-['DM_Serif_Display',_Georgia,_serif] text-stone-900 dark:text-white
              leading-tight mb-2"
              style={{ fontSize: 'clamp(26px, 4vw, 34px)', letterSpacing: '-0.6px' }}>
              Welcome back
            </h1>
            <p className="text-[14px] text-stone-500 dark:text-white/40">
              Sign in to your Stonegate account
            </p>
          </div>

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.12em] uppercase
                text-stone-500 dark:text-white/35 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-[14px]
                  bg-white dark:bg-white/[0.04]
                  border border-stone-200 dark:border-white/[0.08]
                  text-stone-900 dark:text-white
                  placeholder-stone-400 dark:placeholder-white/20
                  focus:outline-none focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40
                  transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-[0.12em] uppercase
                  text-stone-500 dark:text-white/35">
                  Password
                </label>
                <a href="#" className="text-[12px] text-[#C9A84C]/80 hover:text-[#C9A84C] transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-[14px]
                  bg-white dark:bg-white/[0.04]
                  border border-stone-200 dark:border-white/[0.08]
                  text-stone-900 dark:text-white
                  placeholder-stone-400 dark:placeholder-white/20
                  focus:outline-none focus:border-[#C9A84C]/50 dark:focus:border-[#C9A84C]/40
                  transition-colors"
              />
            </div>

            <Link to="/dashboard"
              className="flex items-center justify-center w-full py-3.5 rounded-xl mt-2
                bg-[#C9A84C] text-[#0C0C0D] text-[14px] font-bold
                hover:bg-[#D4B558] transition-colors shadow-md shadow-[#C9A84C]/20">
              Sign in
            </Link>
          </form>

          <p className="text-center text-[11px] font-mono text-stone-400 dark:text-white/20 mt-6">
            FCA regulated · 256-bit SSL encrypted
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
