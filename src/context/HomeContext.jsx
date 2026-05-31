import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [homes, setHomes] = useState([]);
  const [activeHomeId, setActiveHomeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHomes = async ({ migrate = false } = {}) => {
    try {
      const user = await base44.auth.me();
      // Load homes created by the user
      const ownedHomes = await base44.entities.Home.filter({ created_by_id: user.id });

      // Load homes shared with this user via approved invites
      const allInvites = await base44.entities.HomeInvite.list('-created_date', 200);
      const approvedInvites = allInvites.filter(
        inv => inv.invitee_email?.toLowerCase() === user.email?.toLowerCase() && inv.status === 'approved'
      );
      // Fetch shared home details (avoid duplicates with owned homes)
      const ownedIds = new Set(ownedHomes.map(h => h.id));
      const sharedHomeIds = [...new Set(approvedInvites.map(inv => inv.home_id))].filter(id => !ownedIds.has(id));
      const sharedHomes = await Promise.all(
        sharedHomeIds.map(id => base44.entities.Home.filter({ id }).then(r => r[0]).catch(() => null))
      );
      const validSharedHomes = sharedHomes.filter(Boolean).map(h => ({ ...h, _shared: true }));

      const data = [...ownedHomes, ...validSharedHomes];
      setHomes(data);

      // Restore last active home from localStorage, or pick first
      const stored = localStorage.getItem('activeHomeId');
      if (stored && data.find(h => h.id === stored)) {
        setActiveHomeId(stored);
      } else if (data.length > 0) {
        setActiveHomeId(data[0].id);
      }

      // Only migrate on initial load, not on every refresh
      if (migrate && data.length > 0) {
        const oldestHome = [...data].sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
        const [expenses, recurring] = await Promise.all([
          base44.entities.Expense.filter({ created_by_id: user.id }),
          base44.entities.RecurringExpense.filter({ created_by_id: user.id }),
        ]);
        const unownedExpenses = expenses.filter(e => !e.home_id);
        const unownedRecurring = recurring.filter(e => !e.home_id);
        if (unownedExpenses.length > 0 || unownedRecurring.length > 0) {
          await Promise.all([
            ...unownedExpenses.map(e => base44.entities.Expense.update(e.id, { home_id: oldestHome.id })),
            ...unownedRecurring.map(e => base44.entities.RecurringExpense.update(e.id, { home_id: oldestHome.id })),
          ]);
        }
      }
    } catch (e) {
      // not logged in or no homes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHomes({ migrate: true }); }, []);

  const switchHome = (id) => {
    setActiveHomeId(id);
    if (id) localStorage.setItem('activeHomeId', id);
    else localStorage.removeItem('activeHomeId');
  };

  const activeHome = homes.find(h => h.id === activeHomeId) || null;

  return (
    <HomeContext.Provider value={{ homes, activeHome, activeHomeId, switchHome, fetchHomes, loading }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  return useContext(HomeContext);
}