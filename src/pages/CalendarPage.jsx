import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getNextDueDate } from '@/lib/utils';
import CalendarView from '@/components/CalendarView';
import PullToRefresh from '@/components/PullToRefresh';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useHome } from '@/context/HomeContext';

export default function CalendarPage() {
  const qc = useQueryClient();
  const user = useCurrentUser();
  const { activeHome } = useHome();
  const currency = activeHome?.currency || 'AUD';

  const { data: allRecurring = [] } = useQuery({
    queryKey: ['recurring', user?.id],
    queryFn: () => base44.entities.RecurringExpense.filter({ created_by_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
  });

  const recurring = allRecurring.filter(e => e.home_id === activeHome?.id);

  const enriched = recurring.map(e => ({
    ...e,
    next_due_date: e.next_due_date || getNextDueDate(e.start_date, e.frequency).toISOString().split('T')[0],
  }));

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['recurring', user?.id] });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4 animate-fade-up px-4 py-6 pb-28">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bill Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Upcoming recurring expenses by month</p>
        </div>
        <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-5">
          <CalendarView recurring={enriched} currency={currency} />
        </div>
      </div>
    </PullToRefresh>
  );
}