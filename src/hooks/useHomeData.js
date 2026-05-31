import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useHome } from '@/context/HomeContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Returns expenses, recurring, and budgets for the active home.
 * Always fetches via service-role backend function so all members see all data.
 * Uses mutateShared(entity, action, data, id) for create/update/delete on shared homes.
 */
export function useHomeData() {
  const { activeHome } = useHome();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const isShared = !!activeHome?._shared;
  const homeId = activeHome?.id;

  // Always fetch via backend (service role) so cross-user data is visible
  const homeDataQuery = useQuery({
    queryKey: ['homeData', homeId],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSharedHomeData', { home_id: homeId });
      return res.data;
    },
    enabled: !!homeId && !!user?.id,
    staleTime: 0,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // For owned homes, mutations go directly to entities (faster, no auth overhead)
  // For shared homes, mutations go via mutateSharedExpense backend (service role)
  const mutateShared = async (entity, action, data, id) => {
    await base44.functions.invoke('mutateSharedExpense', { home_id: homeId, entity, action, data, id });
    qc.invalidateQueries({ queryKey: ['homeData', homeId] });
  };

  const mutateOwned = async (entity, action, data, id) => {
    const repo = base44.entities[entity];
    if (action === 'create') await repo.create({ ...data, home_id: homeId });
    else if (action === 'update') await repo.update(id, data);
    else if (action === 'delete') await repo.delete(id);
    qc.invalidateQueries({ queryKey: ['homeData', homeId] });
  };

  return {
    expenses: homeDataQuery.data?.expenses || [],
    recurring: homeDataQuery.data?.recurring || [],
    budgets: homeDataQuery.data?.budgets || [],
    isLoading: homeDataQuery.isLoading,
    isShared,
    mutateShared: isShared ? mutateShared : mutateOwned,
  };
}