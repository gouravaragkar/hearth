import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatAUD, CATEGORY_COLORS, getMonthlyEquivalent } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function CategoryRow({ name, spent, budget }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : null;
  const over = budget > 0 && spent > budget;
  const color = CATEGORY_COLORS[name] || '#ADB5BD';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-foreground font-medium">{name}</span>
        </div>
        <div className="text-right">
          <span className={over ? 'text-destructive font-semibold' : 'text-foreground'}>{formatAUD(spent)}</span>
          {budget > 0 && <span className="text-muted-foreground text-xs ml-1">/ {formatAUD(budget)}</span>}
        </div>
      </div>
      {pct !== null && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: over ? 'hsl(0 72% 60%)' : color }}
          />
        </div>
      )}
    </div>
  );
}

export default function MonthlyReportCard({ open, onClose, expenses, recurring, budget }) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthLabel = format(now, 'MMMM yyyy');

  const { categoryMap, oneTimeTotal, recurringTotal, totalSpent } = useMemo(() => {
    const map = {};

    const thisMonthExpenses = expenses.filter(e => {
      if (!e.date) return false;
      return isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd });
    });

    thisMonthExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + (e.amount || 0);
    });

    recurring.forEach(e => {
      const m = getMonthlyEquivalent(e.amount, e.frequency);
      map[e.category] = (map[e.category] || 0) + m;
    });

    const oneTimeTotal = thisMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const recurringTotal = recurring.reduce((s, e) => s + getMonthlyEquivalent(e.amount, e.frequency), 0);

    return { categoryMap: map, oneTimeTotal, recurringTotal, totalSpent: oneTimeTotal + recurringTotal };
  }, [expenses, recurring, monthStart, monthEnd]);

  const budgetAmount = budget?.amount || 0;
  const remaining = budgetAmount - totalSpent;
  const over = budgetAmount > 0 && totalSpent > budgetAmount;
  const pct = budgetAmount > 0 ? Math.min((totalSpent / budgetAmount) * 100, 100) : 0;
  const barColor = pct < 70 ? 'hsl(130 20% 58%)' : pct < 90 ? 'hsl(42 58% 58%)' : 'hsl(0 72% 60%)';

  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const StatusIcon = over ? TrendingUp : pct > 80 ? Minus : TrendingDown;
  const statusColor = over ? 'text-destructive' : pct > 80 ? 'text-gold' : 'text-sage';
  const statusLabel = over
    ? `Over budget by ${formatAUD(Math.abs(remaining))}`
    : budgetAmount > 0
      ? `${formatAUD(remaining)} remaining`
      : 'No budget set';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        {/* Header band */}
        <div className="bg-primary px-5 py-5">
          <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Monthly Report</p>
          <DialogTitle className="text-primary-foreground text-xl font-bold mt-0.5">{monthLabel}</DialogTitle>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <p className="text-primary-foreground/70 text-xs">Total Spent</p>
              <p className="text-primary-foreground text-2xl font-bold">{formatAUD(totalSpent)}</p>
            </div>
            {budgetAmount > 0 && (
              <div className="ml-auto text-right">
                <p className="text-primary-foreground/70 text-xs">Budget</p>
                <p className="text-primary-foreground text-2xl font-bold">{formatAUD(budgetAmount)}</p>
              </div>
            )}
          </div>
          {budgetAmount > 0 && (
            <div className="mt-3">
              <div className="w-full h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'white' }} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-primary-foreground/70 text-xs">{pct.toFixed(0)}% used</span>
                <div className={`flex items-center gap-1 text-xs font-semibold text-primary-foreground`}>
                  <StatusIcon size={12} />
                  {statusLabel}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">One-time</p>
              <p className="text-sm font-semibold text-foreground">{formatAUD(oneTimeTotal)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recurring (est.)</p>
              <p className="text-sm font-semibold text-foreground">{formatAUD(recurringTotal)}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Category breakdown */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Category</p>
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No spending data this month.</p>
            )}
            {categories.map(([cat, amt]) => (
              <CategoryRow key={cat} name={cat} spent={amt} budget={0} />
            ))}
          </div>

          {!budgetAmount && (
            <p className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
              💡 Set a monthly budget on the dashboard to see budget comparisons here.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}