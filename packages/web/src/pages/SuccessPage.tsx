import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Download, Share2, Home, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSwapStore } from '../store/useSwapStore';
import { getFlag } from '../lib/utils';

export const SuccessPage = () => {
  const navigate = useNavigate();
  const { fromAmount, toAmount, fromCurrency, toCurrency } = useSwapStore();

  useEffect(() => {
    // Professional confetti burst
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0052FF', '#00C853']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0052FF', '#00C853']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
      
      {/* Animated Checkmark Icon */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,200,83,0.3)]"
      >
        <Check size={48} className="text-white stroke-[3px]" />
      </motion.div>

      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Conversion Successful!</h1>
        <p className="text-secondary font-medium">Your funds are now available in your {toCurrency} wallet.</p>
      </header>

      {/* Professional Receipt Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-surface border border-white/5 rounded-[32px] overflow-hidden shadow-2xl mb-10"
      >
        <div className="p-8 border-b border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">Transaction Receipt</span>
            <span className="text-[11px] font-mono text-secondary/50">ID: NX-992011442</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-secondary">Total Received</p>
              <div className="flex items-center gap-2">
                <img src={getFlag(toCurrency)} className="w-5 h-5 rounded-full" alt="" />
                <h2 className="text-2xl font-bold text-white">
                    {toCurrency} {parseFloat(toAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-secondary">Sent</p>
              <p className="text-lg font-semibold text-white/80">
                {fromCurrency} {parseFloat(fromAmount || '0').toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Status</span>
            <span className="font-bold text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Completed
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Date & Time</span>
            <span className="text-white font-medium">Jan 25, 2026 • 2:18 PM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Fee Paid</span>
            <span className="text-success font-bold">Free</span>
          </div>
        </div>

        {/* Action Bar inside Receipt */}
        <div className="bg-white/[0.03] p-4 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all">
            <Download size={16} /> Save PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all">
            <Share2 size={16} /> Share
          </button>
        </div>
      </motion.div>

      {/* Navigation Options */}
      <div className="w-full space-y-4">
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Home size={20} /> Back to Dashboard
        </button>
        
        <button 
          onClick={() => navigate('/swap')}
          className="w-full py-4 text-secondary hover:text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Perform another swap <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};