import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatAUD } from '@/lib/utils';
import { Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function MonthlySummary({ totalSpent, budget, homeId, currency }) {
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
    mutationFn: async (amount) => {
      if (budget?.id) {
        return base44.entities.Budget.update(budget.id, { amount });
      } else {
        return base44.entities.Budget.create({ month: currentMonth, amount, home_id: homeId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] }); // invalidates all budget keys
      setEditing(false);
    },
  });

  const handleSave = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val > 0) saveMutation.mutate(val);
  };

  return (
    <div className="bg-card rounded-2xl shadow-warm-sm border border-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Monthly Summary</h2>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-1">
          {format(new Date(), 'MMMM yyyy')}
        </span>
      </div>

      {/* Spent vs Budget */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-bold text-foreground">{formatAUD(totalSpent)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Budget</p>
          {editing ? (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                autoFocus
                type="number"
                min="0"
                step="50"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="h-7 w-24 text-sm px-2"
              />
              <Button size="icon" className="h-7 w-7" onClick={handleSave}>
                <Check size={12} />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
                <X size={12} />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => { setInputVal(budgetAmount ? budgetAmount.toString() : ''); setEditing(true); }}
              className="flex items-center gap-1 text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              {budgetAmount > 0 ? formatAUD(budgetAmount) : <span className="text-sm text-muted-foreground">Set budget</span>}
              <Pencil size={12} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {budgetAmount > 0 && (
        <>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{pct.toFixed(0)}% used</span>
            <span className={over ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
              {over ? `Over by ${formatAUD(Math.abs(remaining))}` : `${formatAUD(remaining)} remaining`}
            </span>
          </div>
        </>
      )}

      {!budgetAmount && (
        <p className="text-xs text-muted-foreground">Tap "Set budget" to track against a monthly target.</p>
      )}
    </div>
  );
}