import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Detect sensible default currency from browser timezone
const TIMEZONE_CURRENCY_MAP = {
  'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD',
  'Australia/Perth': 'AUD', 'Australia/Adelaide': 'AUD', 'Australia/Darwin': 'AUD',
  'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR',
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Denver': 'USD',
  'America/Los_Angeles': 'USD', 'America/Phoenix': 'USD',
  'Europe/London': 'GBP',
  'America/Toronto': 'CAD', 'America/Vancouver': 'CAD',
  'Pacific/Auckland': 'NZD',
  'Asia/Singapore': 'SGD',
  'Asia/Tokyo': 'JPY',
  'Asia/Shanghai': 'CNY', 'Asia/Hong_Kong': 'HKD',
  'Europe/Berlin': 'EUR', 'Europe/Paris': 'EUR', 'Europe/Rome': 'EUR',
  'Europe/Madrid': 'EUR', 'Europe/Amsterdam': 'EUR',
  'Asia/Dubai': 'AED',
  'Africa/Johannesburg': 'ZAR',
  'Asia/Seoul': 'KRW',
  'Asia/Bangkok': 'THB',
  'Asia/Kuala_Lumpur': 'MYR',
  'Asia/Jakarta': 'IDR',
  'Asia/Manila': 'PHP',
  'Asia/Karachi': 'PKR',
  'Asia/Dhaka': 'BDT',
  'Europe/Zurich': 'CHF',
  'Europe/Stockholm': 'SEK',
  'Europe/Oslo': 'NOK',
  'America/Sao_Paulo': 'BRL',
  'America/Mexico_City': 'MXN',
};

function getDefaultCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_CURRENCY_MAP[tz] || 'USD';
  } catch {
    return 'USD';
  }
}

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [homes, setHomes] = useState([]);
  const [activeHomeId, setActiveHomeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHomes = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      // Check if this is a guest upgrade — migrate data to new Google account
      const guestUpgrade = localStorage.getItem('guest_upgrade');
      const guestUserId = localStorage.getItem('guest_user_id');
      if (guestUpgrade === 'true' && guestUserId) {
        localStorage.removeItem('guest_upgrade');
        localStorage.removeItem('guest_user_id');
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/migrate-guest-data`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({ guest_user_id: guestUserId }),
            }
          );
        } catch (e) {
          console.error('Guest migration failed:', e);
        }
      }

      const { data, error } = await supabase
        .from('homes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      let allHomes = data || [];

      // Auto-create a default home for new anonymous (guest) users
      if (user.is_anonymous && allHomes.length === 0) {
        const currency = getDefaultCurrency();
        const { data: newHome, error: createError } = await supabase
          .from('homes')
          .insert({ name: 'My Home', currency, emoji: '🏠', created_by: user.id, members: [] })
          .select()
          .single();
        if (!createError && newHome) {
          // Create a default budget too
          const currentMonth = new Date().toISOString().slice(0, 7);
          await supabase.from('budgets').insert({ month: currentMonth, amount: 0, home_id: newHome.id, created_by: user.id });
          allHomes = [newHome];
        }
      }

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

  const checkPendingInvites = async (user) => {
    if (!user || user.is_anonymous) return;
    try {
      const { data } = await supabase
        .from('home_invites')
        .select('id')
        .eq('invitee_email', user.email.toLowerCase())
        .eq('status', 'pending')
        .limit(1);
      if (data && data.length > 0) {
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '') {
          window.location.href = '/homes';
        }
      }
    } catch (e) {
      console.error('Error checking pending invites:', e);
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
    const init = async () => {
      await fetchHomes();
      const { data: { user } } = await supabase.auth.getUser();
      await checkPendingInvites(user);
    };
    init();
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
