import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ExpenseCard from '@/components/ExpenseCard';
import ExpenseFormModal from '@/components/ExpenseFormModal';
import { formatAUD } from '@/lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function OneTimeExpenses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 200),
  });

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonthItems = items.filter(e => {
    if (!e.date) return false;
    return isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd });
  });

  const total = thisMonthItems.reduce((s, e) => s + (e.amount || 0), 0);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) return base44.entities.Expense.update(editing.id, data);
      return base44.entities.Expense.create(data);
    },
    onSuccess: () => { qc.invalidateQueries(['expenses']); setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => qc.invalidateQueries(['expenses']),
  });

  const handleEdit = (item) => { setEditing(item); setModalOpen(true); };
  const handleAdd = () => { setEditing(null); setModalOpen(true); };

  // Group by month
  const groupedByMonth = items.reduce((acc, e) => {
    if (!e.date) return acc;
    const key = e.date.slice(0, 7); // YYYY-MM
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  const monthLabel = (key) => {
    const [y, m] = key.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en-AU', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Receipt size={20} className="text-primary" /> One-Time Expenses
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            This month: <span className="font-medium text-foreground">{formatAUD(total)}</span>
            {' · '}{thisMonthItems.length} transactions
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-primary text-primary-foreground rounded-xl gap-1.5">
          <Plus size={16} /> Add
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
          <span className="text-5xl mb-3">🧾</span>
          <p className="font-medium text-foreground">No one-time expenses yet</p>
          <p className="text-sm mt-1">Track groceries, repairs, dining out and more</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4 rounded-xl">
            <Plus size={16} className="mr-1" /> Add your first
          </Button>
        </div>
      )}

      {sortedMonths.map(monthKey => (
        <div key={monthKey}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {monthLabel(monthKey)}
          </h3>
          <AnimatePresence>
            <div className="space-y-2">
              {groupedByMonth[monthKey].sort((a, b) => b.date.localeCompare(a.date)).map(item => (
                <ExpenseCard
                  key={item.id}
                  expense={item}
                  type="one-time"
                  onEdit={handleEdit}
                  onDelete={deleteMutation.mutate}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      ))}

      <ExpenseFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={saveMutation.mutate}
        initialData={editing}
        type="one-time"
      />
    </div>
  );
}