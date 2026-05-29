import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [homes, setHomes] = useState([]);
  const [activeHomeId, setActiveHomeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHomes = async () => {
    try {
      const user = await base44.auth.me();
      const data = await base44.entities.Home.filter({ created_by_id: user.id });
      setHomes(data);
      // Restore last active home from localStorage, or pick first
      const stored = localStorage.getItem('activeHomeId');
      if (stored && data.find(h => h.id === stored)) {
        setActiveHomeId(stored);
      } else if (data.length > 0) {
        setActiveHomeId(data[0].id);
      }

      // Migrate legacy expenses/recurring that have no home_id — assign them to the first home
      if (data.length > 0) {
        const firstHomeId = data[0].id;
        const [expenses, recurring] = await Promise.all([
          base44.entities.Expense.filter({ created_by_id: user.id }),
          base44.entities.RecurringExpense.filter({ created_by_id: user.id }),
        ]);
        const unownedExpenses = expenses.filter(e => !e.home_id);
        const unownedRecurring = recurring.filter(e => !e.home_id);
        await Promise.all([
          ...unownedExpenses.map(e => base44.entities.Expense.update(e.id, { home_id: firstHomeId })),
          ...unownedRecurring.map(e => base44.entities.RecurringExpense.update(e.id, { home_id: firstHomeId })),
        ]);
      }
    } catch (e) {
      // not logged in or no homes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHomes(); }, []);

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