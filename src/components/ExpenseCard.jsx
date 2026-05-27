import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatAUD, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ExpenseCard({ expense, type, onEdit, onDelete, onTogglePaid }) {
  const isRecurring = type === 'recurring';
  const color = CATEGORY_COLORS[expense.category] || '#ADB5BD';
  const icon = CATEGORY_ICONS[expense.category] || '📦';

  const freqLabel = { weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', quarterly: 'Quarterly' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`bg-card rounded-2xl shadow-warm-sm border border-border p-4 flex items-center gap-4 hover:shadow-warm-md transition-shadow ${isRecurring && expense.paid_this_cycle ? 'opacity-70' : ''}`}
    >
      {/* Category dot + icon */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: color + '22', border: `1.5px solid ${color}44` }}>
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold text-foreground truncate ${isRecurring && expense.paid_this_cycle ? 'line-through text-muted-foreground' : ''}`}>
            {expense.name}
          </p>
          {isRecurring && (
            <Badge variant="outline" className="text-xs shrink-0" style={{ borderColor: color, color }}>
              {freqLabel[expense.frequency]}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{expense.category}</span>
          {expense.next_due_date && (
            <span className="text-xs text-muted-foreground">
              · Due {format(new Date(expense.next_due_date), 'dd MMM')}
            </span>
          )}
          {!isRecurring && expense.date && (
            <span className="text-xs text-muted-foreground">
              · {format(new Date(expense.date), 'dd MMM yyyy')}
            </span>
          )}
        </div>
        {expense.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{expense.notes}</p>}
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="font-bold text-foreground">{formatAUD(expense.amount)}</p>
        {isRecurring && (
          <p className="text-xs text-muted-foreground">
            {expense.frequency === 'weekly' ? '/wk' : expense.frequency === 'fortnightly' ? '/fortnight' : expense.frequency === 'quarterly' ? '/qtr' : '/mo'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isRecurring && (
          <Button variant="ghost" size="icon" className="h-11 w-11 select-none" onClick={() => onTogglePaid(expense)}>
            {expense.paid_this_cycle
              ? <CheckCircle2 size={18} className="text-sage" />
              : <Circle size={18} className="text-muted-foreground" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-11 w-11 select-none" onClick={() => onEdit(expense)}>
          <Pencil size={15} className="text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-11 w-11 select-none" onClick={() => onDelete(expense.id)}>
          <Trash2 size={15} className="text-destructive" />
        </Button>
      </div>
    </motion.div>
  );
}