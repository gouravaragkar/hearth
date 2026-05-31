import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useHome } from '@/context/HomeContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Returns expenses, recurring, and budgets for the active home.
 * - Owned homes: direct parallel entity queries (fast) — invitee writes visible via service role on mutate
 * - Shared homes: backend function with service role (bypasses RLS)
 * Both paths keep a long staleTime so cached data renders instantly on revisit.
 */
export function useHomeData() {
  const { activeHome } = useHome();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const isShared = !!activeHome?._shared;
  const homeId = activeHome?.id;

  const activeQuery = useQuery({
    queryKey: ['homeData', homeId],
    queryFn: async () => {
      if (isShared) {
        // Shared home: must use service role to see all members' records
        const res = await base44.functions.invoke('getSharedHomeData', { home_id: homeId });
        return res.data;
      } else {
        // Owned home: fast parallel direct queries
        const [expenses, recurring, budgets] = await Promise.all([
          base44.entities.Expense.filter({ home_id: homeId }, '-date', 500),
          base44.entities.RecurringExpense.filter({ home_id: homeId }, '-created_date', 500),
          base44.entities.Budget.filter({ home_id: homeId }, '-created_date', 100),
        ]);
        return { expenses, recurring, budgets };
      }
    },
    enabled: !!homeId && !!user?.id,
    staleTime: 60_000,       // cache for 1 min — renders instantly on revisit
    gcTime: 5 * 60_000,     // keep in memory for 5 min
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['homeData', homeId] });
  };

  const applyOptimistic = (updater) => {
    qc.setQueryData(['homeData', homeId], (old) => {
      if (!old) return old;
      return updater(old);
    });
  };

  const mutateShared = async (entity, action, data, id) => {
    // Optimistic update for instant UI feedback
    const entityKey = entity === 'RecurringExpense' ? 'recurring' : entity.toLowerCase() + 's';
    if (action === 'create') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: [...(old[entityKey] || []), { ...data, id: `temp-${Date.now()}`, home_id: homeId }],
      }));
    } else if (action === 'update') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: (old[entityKey] || []).map(item => item.id === id ? { ...item, ...data } : item),
      }));
    } else if (action === 'delete') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: (old[entityKey] || []).filter(item => item.id !== id),
      }));
    }

    // All writes go through service role so invitee changes are visible to owner
    await base44.functions.invoke('mutateSharedExpense', { home_id: homeId, entity, action, data, id });

    // Sync real data in background
    invalidate();
  };

  return {
    expenses: activeQuery.data?.expenses || [],
    recurring: activeQuery.data?.recurring || [],
    budgets: activeQuery.data?.budgets || [],
    isLoading: activeQuery.isLoading,
    isShared,
    mutateShared,
  };
}