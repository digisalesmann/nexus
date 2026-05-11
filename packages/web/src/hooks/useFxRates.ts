import { useEffect, useRef, useState } from 'react';
import { fetchRates } from '../lib/api/fx';

const REFRESH_MS = 5 * 60 * 1000; // 5 min

export function useFxRates() {
  const [rates,   setRates]   = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    try {
      const r = await fetchRates();
      setRates(r);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, REFRESH_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return { rates, loading, error, refresh: load };
}
