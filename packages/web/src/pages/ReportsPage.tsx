import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto pb-28">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12 md:mb-20 pt-6 md:pt-10 border-b border-stone-200 dark:border-white/5 pb-12 md:pb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FileText size={32} className="text-stone-400" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-stone-900 dark:text-white">
              Reports
            </h1>
          </div>
          <p className="text-stone-500 dark:text-white/50 text-sm md:text-base">
            View detailed financial reports and statements
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5">
          <p className="text-stone-500 dark:text-white/50 text-center py-12">
            Reports content coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
