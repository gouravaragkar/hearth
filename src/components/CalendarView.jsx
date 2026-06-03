import { useMemo, useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, getNextDueDate } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencies';

function getDueDatesForMonth(recurring, monthStart, monthEnd) {
  const result = {};

  recurring.forEach(expense => {
    if (!expense.start_date || !expense.frequency) return;
    let cursor = new Date(expense.start_date);
    cursor.setHours(0, 0, 0, 0);

    // Advance cursor to first occurrence within or before month
    while (cursor < monthStart) {
      if (expense.frequency === 'weekly') cursor.setDate(cursor.getDate() + 7);
      else if (expense.frequency === 'fortnightly') cursor.setDate(cursor.getDate() + 14);
      else if (expense.frequency === 'quarterly') cursor.setMonth(cursor.getMonth() + 3);
      else if (expense.frequency === 'semi-annual') cursor.setMonth(cursor.getMonth() + 6);
      else if (expense.frequency === 'annual') cursor.setMonth(cursor.getMonth() + 12);
      else cursor.setMonth(cursor.getMonth() + 1);
    }

    // Collect all occurrences within the month
    while (cursor <= monthEnd) {
      const key = format(cursor, 'yyyy-MM-dd');
      if (!result[key]) result[key] = [];
      result[key].push(expense);

      if (expense.frequency === 'weekly') cursor = new Date(cursor.setDate(cursor.getDate() + 7));
      else if (expense.frequency === 'fortnightly') cursor = new Date(cursor.setDate(cursor.getDate() + 14));
      else break; // monthly and less frequent only appear once per month
    }
  });

  return result;
}

export default function CalendarView({ recurring = [], expenses = [], currency = 'AUD' }) {
  const [viewMonth, setViewMonth] = useState(new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty cells for Mon-based grid
  const startDow = (monthStart.getDay() + 6) % 7; // 0=Mon
  const paddedDays = [...Array(startDow).fill(null), ...days];

  const dueMap = useMemo(
    () => getDueDatesForMonth(recurring, monthStart, monthEnd),
    [recurring, monthStart, monthEnd]
  );

  // Build a map of one-time expenses by date for the current month
  const expenseMap = useMemo(() => {
    const result = {};
    expenses.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (d >= monthStart && d <= monthEnd) {
        const key = format(d, 'yyyy-MM-dd');
        if (!result[key]) result[key] = [];
        result[key].push(e);
      }
    });
    return result;
  }, [expenses, monthStart, monthEnd]);

  const [tooltip, setTooltip] = useState(null); // { key, x, y }

  return (
    <div className="space-y-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft size={16} className="text-muted-foreground" />
        </button>
        <span className="font-semibold text-foreground text-sm">{format(viewMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d, i) => (
          <div key={i} className="text-xs font-medium text-muted-foreground pb-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {paddedDays.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const key = format(day, 'yyyy-MM-dd');
          const recurringItems = dueMap[key] || [];
          const oneTimeItems = expenseMap[key] || [];
          const hasAny = recurringItems.length > 0 || oneTimeItems.length > 0;
          const today = isToday(day);

          return (
            <div
              key={key}
              className={`relative flex flex-col items-center py-1 rounded-xl
                ${today ? 'bg-primary/10' : ''}
                ${hasAny ? 'cursor-pointer hover:bg-muted transition-colors' : 'cursor-default'}
              `}
              onClick={() => hasAny && setTooltip(tooltip?.key === key ? null : { key })}
            >
              <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                ${today ? 'bg-primary text-primary-foreground' : 'text-foreground'}
              `}>
                {format(day, 'd')}
              </span>

              {/* Dots row */}
              {hasAny && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[40px]">
                  {/* Recurring: outlined ring dots */}
                  {recurringItems.slice(0, 2).map((item, idx) => (
                    <span
                      key={`r-${idx}`}
                      className="w-1.5 h-1.5 rounded-full box-border"
                      style={{
                        backgroundColor: 'transparent',
                        border: `1.5px solid ${CATEGORY_COLORS[item.category] || '#ADB5BD'}`,
                      }}
                    />
                  ))}
                  {/* One-time: filled dots */}
                  {oneTimeItems.slice(0, 2).map((item, idx) => (
                    <span
                      key={`e-${idx}`}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#ADB5BD' }}
                    />
                  ))}
                </div>
              )}

              {/* Inline tooltip / popover */}
              {tooltip?.key === key && (
                <div
                  className="absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-warm-md p-3 min-w-[160px] space-y-2"
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-xs font-semibold text-muted-foreground">{format(day, 'EEE d MMM')}</p>
                  {recurringItems.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recurring</p>
                      {recurringItems.map((item, idx) => (
                        <div key={`r-${idx}`} className="flex items-center gap-2">
                          <span className="text-base">{CATEGORY_ICONS[item.category] || '📦'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.amount, currency)}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {oneTimeItems.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">One-time</p>
                      {oneTimeItems.map((item, idx) => (
                        <div key={`e-${idx}`} className="flex items-center gap-2">
                          <span className="text-base">{CATEGORY_ICONS[item.category] || '📦'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.amount, currency)}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-primary inline-block" />
          Recurring
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          One-time
        </div>
      </div>
      {Object.keys(dueMap).length === 0 && Object.keys(expenseMap).length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-2">No expenses this month.</p>
      )}

      {/* Close tooltip on outside click */}
      {tooltip && (
        <div className="fixed inset-0 z-10" onClick={() => setTooltip(null)} />
      )}
    </div>
  );
}