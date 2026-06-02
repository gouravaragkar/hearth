import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [homes, setHomes] = useState([]);
  const [activeHomeId, setActiveHomeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHomes = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data, error } = await supabase
        .from('homes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const allHomes = data || [];
      setHomes(allHomes);

      const stored = localStorage.getItem('activeHomeId');
      if (stored && allHomes.find(h => h.id === stored)) {
        setActiveHomeId(stored);
      } else if (allHomes.length > 0) {
        setActiveHomeId(allHomes[0].id);
      }
    } catch (e) {
      console.error('Error fetching homes:', e);
    } finally {
      setLoading(false);
    }
  };

  const resetPaidCycles = async () => {
    try {
      await supabase.rpc('reset_paid_cycles');
    } catch (e) {
      console.error('Error resetting paid cycles:', e);
    }
  };

  useEffect(() => {
    fetchHomes();
    resetPaidCycles();
  }, []);

  const switchHome = (id) => {
    setActiveHomeId(id);
    if (id) localStorage.setItem('activeHomeId', id);
    else localStorage.removeItem('activeHomeId');
  };

  const activeHome = homes.find(h => h.id === activeHomeId) || null;

  return (
    <HomeContext.Provider value={{
      homes,
      activeHome,
      activeHomeId,
      switchHome,
      fetchHomes,
      loading
    }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  return useContext(HomeContext);
}
