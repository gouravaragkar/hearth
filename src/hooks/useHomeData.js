import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useHome } from '@/context/HomeContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Returns expenses, recurring, and budgets for the active home.
 * - Owned homes: direct entity queries (fast, no backend overhead)
 * - Shared homes: backend function with service role (bypasses RLS)
 */
export function useHomeData() {
  const { activeHome } = useHome();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const isShared = !!activeHome?._shared;
  const homeId = activeHome?.id;

  // Owned home: direct fast entity queries
  const ownedQuery = useQuery({
    queryKey: ['homeData', homeId, 'owned'],
    queryFn: async () => {
      const [expenses, recurring, budgets] = await Promise.all([
        base44.entities.Expense.filter({ home_id: homeId }, '-date', 500),
        base44.entities.RecurringExpense.filter({ home_id: homeId }, '-created_date', 500),
        base44.entities.Budget.filter({ home_id: homeId }, '-created_date', 100),
      ]);
      return { expenses, recurring, budgets };
    },
    enabled: !!homeId && !!user?.id && !isShared,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Shared home: backend function (service role for cross-user visibility)
  const sharedQuery = useQuery({
    queryKey: ['homeData', homeId, 'shared'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSharedHomeData', { home_id: homeId });
      return res.data;
    },
    enabled: !!homeId && !!user?.id && isShared,
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const activeQuery = isShared ? sharedQuery : ownedQuery;

  // Invalidate the correct query key
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['homeData', homeId, isShared ? 'shared' : 'owned'] });
  };

  // Optimistic update helper: merges new data into cache immediately
  const applyOptimistic = (updater) => {
    const key = ['homeData', homeId, isShared ? 'shared' : 'owned'];
    qc.setQueryData(key, (old) => {
      if (!old) return old;
      return updater(old);
    });
  };

  const mutateShared = async (entity, action, data, id) => {
    // Optimistic update for instant UI feedback
    const entityKey = entity === 'RecurringExpense' ? 'recurring' : entity.toLowerCase() + 's';
    if (action === 'create') {
      const tempId = `temp-${Date.now()}`;
      applyOptimistic(old => ({
        ...old,
        [entityKey]: [...(old[entityKey] || []), { ...data, id: tempId, home_id: homeId }],
      }));
    } else if (action === 'update') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: (old[entityKey] || []).map(item =>
          item.id === id ? { ...item, ...data } : item
        ),
      }));
    } else if (action === 'delete') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: (old[entityKey] || []).filter(item => item.id !== id),
      }));
    }

    // Actual mutation
    if (isShared) {
      await base44.functions.invoke('mutateSharedExpense', { home_id: homeId, entity, action, data, id });
    } else {
      const repo = base44.entities[entity];
      if (action === 'create') await repo.create({ ...data, home_id: homeId });
      else if (action === 'update') await repo.update(id, data);
      else if (action === 'delete') await repo.delete(id);
    }

    // Refetch in background to sync real data
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