import { format, isThisWeek, differenceInDays } from 'date-fns';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencies';
import { CalendarClock } from 'lucide-react';

export default function UpcomingPayments({ recurringExpenses, currency = 'AUD' }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = recurringExpenses
    .filter(e => e.next_due_date)
    .map(e => {
      const [y, m, d] = e.next_due_date.split('-').map(Number);
      return { ...e, dueDate: new Date(y, m - 1, d) };
    })
    .filter(e => {
      const diff = differenceInDays(e.dueDate, today);
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => a.dueDate - b.dueDate);

  if (upcoming.length === 0) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground text-sm py-3">
        <CalendarClock size={18} />
        <span>Nothing due in the next 7 days 🎉</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcoming.map(e => {
        const diff = differenceInDays(e.dueDate, today);
        const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `In ${diff} days`;
        const color = CATEGORY_COLORS[e.category] || '#ADB5BD';
        return (
          <div key={e.id} className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
            <span className="text-lg">{CATEGORY_ICONS[e.category] || '📦'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{e.name}</p>
              <p className="text-xs text-muted-foreground">{format(e.dueDate, 'EEEE, dd MMM')}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm text-foreground">{formatCurrency(e.amount, currency)}</p>
              <p className="text-xs font-medium" style={{ color: diff === 0 ? '#E8724A' : diff <= 2 ? '#D4A853' : '#7BAE7F' }}>
                {label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}