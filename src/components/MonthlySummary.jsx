import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/currencies';
import { Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function MonthlySummary({ totalSpent, budget, homeId, currency, mutateShared }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const currentMonth = format(new Date(), 'yyyy-MM');
  const budgetAmount = budget?.amount || 0;
  const pct = budgetAmount > 0 ? Math.min((totalSpent / budgetAmount) * 100, 100) : 0;
  const over = budgetAmount > 0 && totalSpent > budgetAmount;
  const remaining = budgetAmount - totalSpent;
  const barColor = pct < 70 ? 'hsl(130 20% 58%)' : pct < 90 ? 'hsl(42 58% 58%)' : 'hsl(0 72% 60%)';

  const saveMutation = useMutation({
    mutationFn: async (amount) =>
      mutateShared('Budget', budget?.id ? 'update' : 'create', { month: currentMonth, amount }, budget?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeData'] });
      setEditing(false);
    },
  });

  const handleSave = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0) saveMutation.mutate(val);
  };

  return (
    <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-foreground">Monthly Summary</h2>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {format(new Date(), 'MMM yyyy')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Total Spent</p>
          <p className="text-sm font-bold text-foreground leading-tight">
            {formatCurrency(totalSpent, currency)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-[11px] text-muted-foreground mb-1">Budget</p>
          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                autoFocus
                type="number"
                min="0"
                step="50"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="h-6 w-full text-xs px-1.5"
              />
              <Button size="icon" className="h-6 w-6 shrink-0" onClick={handleSave}>
                <Check size={10} />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => setEditing(false)}>
                <X size={10} />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => { setInputVal(budgetAmount ? budgetAmount.toString() : ''); setEditing(true); }}
              className="flex items-center gap-1 text-sm font-bold text-foreground hover:text-primary transition-colors leading-tight"
            >
              {budgetAmount > 0
                ? formatCurrency(budgetAmount, currency)
                : <span className="text-xs text-muted-foreground font-normal">Set budget</span>}
              <Pencil size={10} className="text-muted-foreground shrink-0" />
            </button>
          )}
        </div>
      </div>

      {budgetAmount > 0 && (
        <>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{pct.toFixed(0)}% used</span>
            <span className={over ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
              {over
                ? `Over by ${formatCurrency(Math.abs(remaining), currency)}`
                : `${formatCurrency(remaining, currency)} left`}
            </span>
          </div>
        </>
      )}

      {!budgetAmount && !editing && (
        <p className="text-xs text-muted-foreground">Tap "Set budget" to track your monthly target.</p>
      )}
    </div>
  );
}
