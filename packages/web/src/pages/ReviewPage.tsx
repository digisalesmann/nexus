import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Info, RotateCcw, Lock } from 'lucide-react';
import { useSwapStore } from '../store/useSwapStore';
import { getFlag, cn } from '../lib/utils';

export const ReviewPage = () => {
  const { fromAmount, toAmount, fromCurrency, toCurrency, rate } = useSwapStore();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Stable quote ID for this render (generated only once on mount)
  const [quoteId] = useState(() => `NX-${Math.floor(Math.random() * 1000000)}`);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10">
      
      {/* 1. INSTITUTIONAL HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/[0.04] pb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/swap')}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group"
          >
            <ChevronLeft size={20} className="text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Review Order</h1>
            <p className="text-secondary text-sm font-medium flex items-center gap-2">
              <Lock size={14} className="text-success" />
              Secured Transaction • Quote ID: {quoteId}
            </p>
          </div>
        </div>

        {/* Live Quote Badge */}
        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
           <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Market Quote</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-16">
        
        {/* 2. ORDER STATEMENT (UNIFIED SURFACE) */}
        <section className="lg:col-span-8 space-y-12">
          
          {/* Conversion Breakdown */}
          <div className="space-y-12 border-b border-white/[0.04] pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary">Debit From</span>
                <div className="flex items-center gap-4">
                  <img src={getFlag(fromCurrency)} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tighter">
                      {parseFloat(fromAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })} {fromCurrency}
                    </h2>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">Available Asset</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Credit To</span>
                <div className="flex items-center gap-4">
                  <img src={getFlag(toCurrency)} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tighter">
                      {parseFloat(toAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })} {toCurrency}
                    </h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Target Asset</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Details */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary">Execution Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              <DetailBox label="Exchange Rate" value={`1 ${fromCurrency} = ${rate.toLocaleString()} ${toCurrency}`} />
              <DetailBox label="Service Fee" value="Zero Fee" isSuccess />
              <DetailBox label="Settlement" value="Instant" />
            </div>
          </div>
        </section>

        {/* 3. AUTHORIZATION SIDEBAR */}
        <aside className="lg:col-span-4 space-y-12">
          
          {/* Rate Expiry Logic */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary">Quote Expiry</h3>
              {timeLeft === 0 && (
                <button onClick={() => setTimeLeft(30)} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:opacity-80">
                  <RotateCcw size={12} /> REFRESH
                </button>
              )}
            </div>
            
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                    <motion.circle 
                      cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" 
                      strokeDasharray="113.1"
                      animate={{ strokeDashoffset: 113.1 - (113.1 * timeLeft) / 30 }}
                      className="text-primary" 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-white">{timeLeft}s</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Price Locked</p>
                  <p className="text-[10px] text-secondary mt-0.5">Protecting against slippage</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-primary/20 bg-primary/5">
              <ShieldCheck className="text-primary shrink-0" size={20} />
              <p className="text-[11px] text-secondary leading-relaxed uppercase tracking-wider font-medium">
                Authorization will trigger an immediate ledger transfer between internal assets.
              </p>
            </div>

            <button
              disabled={timeLeft === 0}
              onClick={() => navigate('/swap/success')}
              className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 font-bold py-5 rounded-full shadow-xl transition-all active:scale-[0.98] text-xs uppercase tracking-[0.2em]"
            >
              {timeLeft === 0 ? 'Quote Expired' : 'Authorize Conversion'}
            </button>
            
            <div className="flex justify-center items-center gap-2 opacity-40">
              <Info size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Institutional Encryption Applied</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

interface DetailBoxProps {
  label: string;
  value: string | number;
  isSuccess?: boolean;
}

const DetailBox = ({ label, value, isSuccess }: DetailBoxProps) => (
  <div className="bg-background p-6 flex flex-col gap-2 transition-colors">
    <p className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">{label}</p>
    <p className={cn("text-sm font-bold tracking-tight", isSuccess ? "text-success" : "text-white")}>{value}</p>
  </div>
);