import React from 'react';
import { Eye, EyeOff, ArrowUpRight, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Wallet } from '../../../../types/dist/index.d';

interface WalletCardProps {
  wallet: Wallet;
  isActive?: boolean;
}

export const WalletCard = ({ wallet, isActive }: WalletCardProps) => {
  const [showBalance, setShowBalance] = React.useState(true);

  return (
    <div className={cn(
      "relative min-w-[320px] p-6 rounded-[32px] transition-all duration-300 border",
      isActive 
        ? "bg-light-primary dark:bg-primary text-white border-transparent shadow-[0_20px_40px_-15px_#0052ff30] dark:shadow-[0_20px_40px_-15px_rgba(0,82,255,0.3)]" 
        : "bg-light-surface dark:bg-surface text-gray-900 dark:text-secondary border-light-secondary/10 dark:border-white/5 hover:border-light-primary/20 dark:hover:border-white/10"
    )}>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-light-primary/10 dark:bg-white/10 flex items-center justify-center font-bold text-light-primary dark:text-white">
            {wallet.balance.currency === 'USD' ? '$' : wallet.balance.currency === 'GBP' ? '£' : '€'}
          </div>
          <div>
            <p className="text-xs opacity-70 font-medium tracking-wide uppercase text-light-secondary dark:text-secondary">
              {wallet.balance.currency} Balance
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {wallet.accountNumber}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 hover:bg-light-primary/10 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {showBalance ? `${wallet.balance.currency === 'USD' ? '$' : '€'}${wallet.balance.amount.toLocaleString()}` : '••••••'}
        </h2>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 bg-light-primary/10 dark:bg-white/10 hover:bg-light-primary/20 dark:hover:bg-white/20 py-3 rounded-2xl text-sm font-semibold transition-all text-light-primary dark:text-white">
          <Plus size={16} /> Add Money
        </button>
        <button className="p-3 bg-light-primary/10 dark:bg-white/10 hover:bg-light-primary/20 dark:hover:bg-white/20 rounded-2xl transition-all text-light-primary dark:text-white">
          <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  );
};