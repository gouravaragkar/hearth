import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencies';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const FREQ_SHORT = { weekly: 'Weekly', fortnightly: '2-Weekly', monthly: 'Monthly', quarterly: 'Quarterly', 'semi-annual': 'Semi-Annual', annual: 'Annual' };
const FREQ_SUFFIX = { weekly: '/wk', fortnightly: '/2wk', monthly: '/mo', quarterly: '/qtr', 'semi-annual': '/6mo', annual: '/yr' };

export default function ExpenseCard({ expense, type, onEdit, onDelete, onTogglePaid }) {
  const isRecurring = type === 'recurring';
  const color = CATEGORY_COLORS[expense.category] || '#ADB5BD';
  const icon = CATEGORY_ICONS[expense.category] || '📦';
  const isPaid = isRecurring && expense.paid_this_cycle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`bg-card rounded-2xl shadow-warm-sm border border-border overflow-hidden transition-shadow hover:shadow-warm-md ${isPaid ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: color + '20', border: `1.5px solid ${color}40` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm text-foreground truncate ${isPaid ? 'line-through text-muted-foreground' : ''}`}>
            {expense.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{expense.category}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-sm text-foreground">
            {formatCurrency(expense.amount, expense.currency || 'AUD')}
          </p>
          {isRecurring && (
            <p className="text-xs text-muted-foreground">{FREQ_SUFFIX[expense.frequency] || '/mo'}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-3 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isRecurring && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: color + '18', color }}
            >
              {FREQ_SHORT[expense.frequency] || 'Recurring'}
            </span>
          )}
          {isRecurring && expense.next_due_date && (
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Due {format(new Date(expense.next_due_date + 'T12:00:00'), 'dd MMM')}
            </span>
          )}
          {!isRecurring && expense.date && (
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {format(new Date(expense.date + 'T12:00:00'), 'dd MMM yyyy')}
            </span>
          )}
          {expense.notes && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">{expense.notes}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {isRecurring && (
            <Button variant="ghost" size="icon" className="h-8 w-8 select-none" onClick={() => onTogglePaid(expense)}>
              {isPaid
                ? <CheckCircle2 size={16} className="text-green-500" />
                : <Circle size={16} className="text-muted-foreground" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 select-none" onClick={() => onEdit(expense)}>
            <Pencil size={13} className="text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 select-none">
                <Trash2 size={13} className="text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{expense.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this expense. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(expense.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}
