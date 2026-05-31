import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useHome } from '@/context/HomeContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Returns expenses, recurring, and budgets for the active home.
 * If shared: fetches via service-role backend function (polls every 10s for freshness).
 * If owned: fetches directly from entities (RLS handles filtering).
 *
 * For shared homes, use mutateShared(entity, action, data, id) to create/update/delete.
 */
export function useHomeData() {
  const { activeHome } = useHome();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const isShared = !!activeHome?._shared;
  const homeId = activeHome?.id;

  // Shared home: fetch all data via backend function, poll every 10s
  const sharedQuery = useQuery({
    queryKey: ['sharedHomeData', homeId],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSharedHomeData', { home_id: homeId });
      return res.data;
    },
    enabled: isShared && !!homeId,
    staleTime: 0,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Owned home: fetch directly
  const ownedExpensesQuery = useQuery({
    queryKey: ['expenses', user?.id, homeId],
    queryFn: () => base44.entities.Expense.filter({ created_by_id: user.id, home_id: homeId }, '-date', 500),
    enabled: !isShared && !!user?.id && !!homeId,
  });

  const ownedRecurringQuery = useQuery({
    queryKey: ['recurring', user?.id, homeId],
    queryFn: () => base44.entities.RecurringExpense.filter({ created_by_id: user.id, home_id: homeId }, '-created_date', 500),
    enabled: !isShared && !!user?.id && !!homeId,
  });

  const ownedBudgetQuery = useQuery({
    queryKey: ['budget', user?.id, homeId],
    queryFn: () => base44.entities.Budget.filter({ created_by_id: user.id, home_id: homeId }, '-created_date', 100),
    enabled: !isShared && !!user?.id && !!homeId,
  });

  // Helper for invitees to mutate shared home data
  const mutateShared = async (entity, action, data, id) => {
    await base44.functions.invoke('mutateSharedExpense', { home_id: homeId, entity, action, data, id });
    qc.invalidateQueries({ queryKey: ['sharedHomeData', homeId] });
  };

  if (isShared) {
    return {
      expenses: sharedQuery.data?.expenses || [],
      recurring: sharedQuery.data?.recurring || [],
      budgets: sharedQuery.data?.budgets || [],
      isLoading: sharedQuery.isLoading,
      isShared: true,
      mutateShared,
    };
  }

  return {
    expenses: ownedExpensesQuery.data || [],
    recurring: ownedRecurringQuery.data || [],
    budgets: ownedBudgetQuery.data || [],
    isLoading: ownedExpensesQuery.isLoading || ownedRecurringQuery.isLoading,
    isShared: false,
    mutateShared: null,
  };
}