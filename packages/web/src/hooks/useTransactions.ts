import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction } from '../lib/types';
import { useAuth } from '../context/AuthContext';

export function useTransactions(limit = 50) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) setError(error.message);
    else setTransactions(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();

    const channel = supabase
      .channel(`transactions:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'transactions',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setTransactions(prev => [payload.new as Transaction, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { transactions, loading, error, reload: load };
}
