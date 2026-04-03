import { create } from 'zustand';

interface SwapState {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: number;
  setFromAmount: (val: string) => void;
  swapPositions: () => void;
  setFromCurrency: (code: string) => void;
  setToCurrency: (code: string) => void;
}

export const useSwapStore = create<SwapState>((set, get) => ({
  fromCurrency: 'USD',
  toCurrency: 'NGN',
  fromAmount: '',
  toAmount: '',
  rate: 1550.45, // Hardcoded for UI build
  setFromAmount: (val) => {
    const numericVal = parseFloat(val) || 0;
    set({ 
      fromAmount: val, 
      toAmount: (numericVal * get().rate).toFixed(2) 
    });
  },
  swapPositions: () => set((state) => ({
    fromCurrency: state.toCurrency,
    toCurrency: state.fromCurrency,
    fromAmount: state.toAmount,
    toAmount: state.fromAmount,
    rate: 1 / state.rate
  })),
  setFromCurrency: (code) => {
    if (code === get().toCurrency) return;
    set({ fromCurrency: code, fromAmount: '', toAmount: '' });
  },
  setToCurrency: (code) => {
    if (code === get().fromCurrency) return;
    set({ toCurrency: code, fromAmount: '', toAmount: '' });
  },
}));