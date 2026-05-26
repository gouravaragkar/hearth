import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getNextDueDate } from '@/lib/utils';
import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  const { data: recurring = [] } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => base44.entities.RecurringExpense.list('-created_date', 100),
  });

  const enriched = recurring.map(e => ({
    ...e,
    next_due_date: e.next_due_date || getNextDueDate(e.start_date, e.frequency).toISOString().split('T')[0],
  }));

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bill Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Upcoming recurring expenses by month</p>
      </div>
      <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-5">
        <CalendarView recurring={enriched} />
      </div>
    </div>
  );
}