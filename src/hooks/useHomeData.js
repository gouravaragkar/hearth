import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useHome } from '@/context/HomeContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Returns expenses, recurring, and budgets for the active home.
 * Always uses service role backend function so data from all members (owner + invitees) is visible.
 */
export function useHomeData() {
  const { activeHome } = useHome();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const isShared = !!activeHome?._shared;
  const homeId = activeHome?.id;

  // Always use backend function (service role) so data from all members is visible
  const activeQuery = useQuery({
    queryKey: ['homeData', homeId],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSharedHomeData', { home_id: homeId });
      return res.data;
    },
    enabled: !!homeId && !!user?.id,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Invalidate the correct query key
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['homeData', homeId] });
  };

  // Optimistic update helper: merges new data into cache immediately
  const applyOptimistic = (updater) => {
    const key = ['homeData', homeId];
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

    // Always use backend function so writes go through service role (visible to all members)
    await base44.functions.invoke('mutateSharedExpense', { home_id: homeId, entity, action, data, id });

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