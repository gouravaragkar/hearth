import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useHome } from '@/context/HomeContext';

/**
 * Returns expenses, recurring, and budgets for the active home.
 * Supabase RLS automatically handles both owned and shared homes
 * in a single query — no separate code paths needed.
 */
export function useHomeData() {
  const { activeHome } = useHome();
  const qc = useQueryClient();
  const homeId = activeHome?.id;

  const activeQuery = useQuery({
    queryKey: ['homeData', homeId],
    queryFn: async () => {
      if (!homeId) return { expenses: [], recurring: [], budgets: [] };

      // Supabase RLS handles owned + shared homes automatically
      const [expensesRes, recurringRes, budgetsRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('home_id', homeId)
          .order('date', { ascending: false })
          .limit(500),
        supabase
          .from('recurring_expenses')
          .select('*')
          .eq('home_id', homeId)
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('budgets')
          .select('*')
          .eq('home_id', homeId)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (expensesRes.error) throw expensesRes.error;
      if (recurringRes.error) throw recurringRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      console.log('BUDGETS FETCHED:', budgetsRes.data);

      return {
        expenses: expensesRes.data || [],
        recurring: recurringRes.data || [],
        budgets: budgetsRes.data || [],
      };
    },
    enabled: !!homeId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
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

  // Log activity helper
  const logActivity = async (entity, action, record_name, details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('home_activities').insert({
        home_id: homeId,
        entity,
        action,
        record_name,
        details,
        actor_id: user.id,
        actor_name: user.user_metadata?.full_name || user.email,
      });
    } catch (e) {
      console.error('Error logging activity:', e);
    }
  };

  // Map entity name to Supabase table name
  const getTableName = (entity) => {
    switch (entity) {
      case 'RecurringExpense': return 'recurring_expenses';
      case 'Expense': return 'expenses';
      case 'Budget': return 'budgets';
      default: return entity.toLowerCase() + 's';
    }
  };

  // Map entity name to query data key
  const getEntityKey = (entity) => {
    switch (entity) {
      case 'RecurringExpense': return 'recurring';
      case 'Expense': return 'expenses';
      case 'Budget': return 'budgets';
      default: return entity.toLowerCase() + 's';
    }
  };

  const mutateShared = async (entity, action, data, id) => {
    const entityKey = getEntityKey(entity);
    const tableName = getTableName(entity);

    // Optimistic update for instant UI feedback
    if (action === 'create') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: [
          ...(old[entityKey] || []),
          { ...data, id: `temp-${Date.now()}`, home_id: homeId }
        ],
      }));
    } else if (action === 'update') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: (old[entityKey] || []).map(
          item => item.id === id ? { ...item, ...data } : item
        ),
      }));
    } else if (action === 'delete') {
      applyOptimistic(old => ({
        ...old,
        [entityKey]: (old[entityKey] || []).filter(item => item.id !== id),
      }));
    }

    // Perform the actual database operation
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (action === 'create') {
        const { error } = await supabase
          .from(tableName)
          .insert({ ...data, home_id: homeId, created_by: user.id });
        if (error) throw error;
        await logActivity(entity, 'create', data.name || '', `Amount: ${data.amount || ''}`);

      } else if (action === 'update') {
        const { error } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', id);
        if (error) throw error;
        // Only log meaningful updates, not paid_this_cycle toggles
        if (!('paid_this_cycle' in data)) {
          await logActivity(entity, 'update', data.name || '', `Amount: ${data.amount || ''}`);
        }

      } else if (action === 'delete') {
        // Get record name before deleting for the activity log
        const existing = activeQuery.data?.[entityKey]?.find(i => i.id === id);
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
        if (error) throw error;
        await logActivity(entity, 'delete', existing?.name || '', '');
      }

    } catch (e) {
      console.error(`Error ${action} ${entity}:`, e);
      // Revert optimistic update on error
      invalidate();
      throw e;
    }

    // Sync real data in background
    invalidate();
  };

  return {
    expenses: activeQuery.data?.expenses || [],
    recurring: activeQuery.data?.recurring || [],
    budgets: activeQuery.data?.budgets || [],
    isLoading: activeQuery.isLoading,
    isShared: false, // Supabase RLS handles this transparently
    mutateShared,
  };
}