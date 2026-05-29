import { useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getMonthlyEquivalent } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencies';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function AllExpensesCard({ open, onClose, expenses, recurring, currency = 'AUD' }) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthLabel = format(now, 'MMMM yyyy');

  const { allItems, total } = useMemo(() => {
    // One-time expenses this month
    const oneTime = expenses
      .filter(e => e.date && isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd }))
      .map(e => ({ name: e.name, amount: e.amount }));

    // Recurring — show as monthly equivalent
    const rec = recurring.map(e => ({
      name: e.name,
      amount: getMonthlyEquivalent(e.amount, e.frequency),
    }));

    const allItems = [...oneTime, ...rec].sort((a, b) => b.amount - a.amount);
    const total = allItems.reduce((s, i) => s + i.amount, 0);

    return { allItems, total };
  }, [expenses, recurring, monthStart, monthEnd]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        {/* Header band */}
        <div className="bg-primary px-5 py-5">
          <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">All Expenses</p>
          <DialogTitle className="text-primary-foreground text-xl font-bold mt-0.5">{monthLabel}</DialogTitle>
          <div className="mt-3">
            <p className="text-primary-foreground/70 text-xs">Total</p>
            <p className="text-primary-foreground text-2xl font-bold">{formatCurrency(total, currency)}</p>
          </div>
        </div>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {allItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No expenses this month.</p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {allItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(item.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}