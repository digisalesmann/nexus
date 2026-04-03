import { Sun, Moon } from 'lucide-react';
import React from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    if (localStorage.theme) return localStorage.theme as 'dark' | 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.theme = theme;
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="
        relative w-[52px] h-[28px] rounded-full transition-all duration-300
        bg-stone-200 dark:bg-[#1C1C1E]
        border border-stone-300 dark:border-white/10
        hover:border-stone-400 dark:hover:border-white/20
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/40
      "
    >
      {/* Track fill when dark */}
      <span
        className={`
          absolute inset-0 rounded-full transition-opacity duration-300
          bg-[#C9A84C]/15
          ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Thumb */}
      <span
        className={`
          absolute top-[3px] w-[20px] h-[20px] rounded-full flex items-center justify-center
          transition-all duration-300 shadow-sm
          ${theme === 'dark'
            ? 'left-[28px] bg-[#C9A84C]'
            : 'left-[3px] bg-white border border-stone-200'
          }
        `}
      >
        {theme === 'dark' ? (
          <Moon size={10} className="text-[#0A0A0B]" />
        ) : (
          <Sun size={10} className="text-stone-500" />
        )}
      </span>
    </button>
  );
}