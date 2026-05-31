import { useQueryClient } from '@tanstack/react-query';
import { getNextDueDate } from '@/lib/utils';
import CalendarView from '@/components/CalendarView';
import PullToRefresh from '@/components/PullToRefresh';
import { useHome } from '@/context/HomeContext';
import { useHomeData } from '@/hooks/useHomeData';

export default function CalendarPage() {
  const qc = useQueryClient();
  const { activeHome } = useHome();
  const currency = activeHome?.currency || 'AUD';
  const { recurring } = useHomeData();

  const enriched = recurring.map(e => ({
    ...e,
    next_due_date: e.next_due_date || getNextDueDate(e.start_date, e.frequency).toISOString().split('T')[0],
  }));

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['homeData'] });

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