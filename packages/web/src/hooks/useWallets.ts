import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Wallet } from '../lib/types';
import { useAuth } from '../context/AuthContext';

export function useWallets() {
  const { user } = useAuth();
  const [wallets,  setWallets]  = useState<Wallet[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const instanceId = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });
    if (error) setError(error.message);
    else setWallets(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();

    // Realtime: refresh on any wallet change for this user
    const channel = supabase
      .channel(`wallets:${user.id}:${instanceId.current}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'wallets',
        filter: `user_id=eq.${user.id}`,
      }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { wallets, loading, error, reload: load };
}
