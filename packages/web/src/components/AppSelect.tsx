import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
  triggerClassName,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const normalized = (options as (string | { value: string; label: string })[]).map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
  const selectedLabel = normalized.find(o => o.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full px-4 py-3 rounded-xl border text-[14px] outline-none transition-colors',
          'flex items-center justify-between gap-2 text-left cursor-pointer',
          'bg-stone-50 dark:bg-white/[0.03]',
          'border-stone-200 dark:border-white/[0.08]',
          open
            ? 'border-[#C9A84C]/50 dark:border-[#C9A84C]/40'
            : 'hover:border-stone-300 dark:hover:border-white/[0.14]',
          value
            ? 'text-stone-900 dark:text-white'
            : 'text-stone-300 dark:text-white/20',
          triggerClassName
        )}
      >
        <span className="truncate">{selectedLabel ?? placeholder}</span>
        <svg
          width="13" height="13" viewBox="0 0 13 13" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          className={cn(
            'shrink-0 text-stone-400 dark:text-white/30 transition-transform duration-150',
            open && 'rotate-180'
          )}
        >
          <path d="M2 4.5l4.5 4.5 4.5-4.5" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border overflow-hidden',
            'bg-white dark:bg-[#1C1C1E]',
            'border-stone-200 dark:border-white/[0.08]',
            'shadow-xl shadow-black/10 dark:shadow-black/50',
            'max-h-56 overflow-y-auto'
          )}
        >
          {normalized.map(o => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={cn(
                'w-full text-left px-4 py-3 text-[14px] transition-colors',
                o.value === value
                  ? 'bg-[#C9A84C]/[0.08] dark:bg-[#C9A84C]/[0.12] text-[#C9A84C] font-semibold'
                  : 'text-stone-700 dark:text-white/65 hover:bg-stone-50 dark:hover:bg-white/[0.05]'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
