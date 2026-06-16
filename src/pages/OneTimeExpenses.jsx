import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ExpenseCard from '@/components/ExpenseCard';
import ExpenseFormModal from '@/components/ExpenseFormModal';
import ExpenseFilters from '@/components/ExpenseFilters';
import PullToRefresh from '@/components/PullToRefresh';
import { formatCurrency } from '@/lib/currencies';
import { useHome } from '@/context/HomeContext';
import { useHomeData } from '@/hooks/useHomeData';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';

export default function OneTimeExpenses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState('all');
  const [monthOffset, setMonthOffset] = useState(0);
  const qc = useQueryClient();
  const { activeHome } = useHome();
  const currency = activeHome?.currency || 'AUD';
  const { expenses: items, isLoading, mutateShared } = useHomeData();

  const targetDate = addMonths(new Date(), monthOffset);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  const monthItems = items.filter(e => {
    if (!e.date) return false;
    return isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd });
  });

  const filtered = category === 'all' ? monthItems : monthItems.filter(e => e.category === category);
  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  const saveMutation = useMutation({
    mutationFn: (data) => mutateShared('Expense', editing ? 'update' : 'create', data, editing?.id),
    onSuccess: () => { setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mutateShared('Expense', 'delete', null, id),
  });

  const handleEdit = (item) => { setEditing(item); setModalOpen(true); };
  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['homeData'] });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-5 animate-fade-up px-4 py-6 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
              <Receipt size={18} className="text-primary shrink-0" /> One-Time Expenses
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground">{formatCurrency(total, currency)}</span>
              {' · '}{filtered.length} transactions
            </p>
          </div>
          <Button onClick={handleAdd} data-testid="add-expense-btn" className="bg-primary text-primary-foreground rounded-xl gap-1.5 select-none">
            <Plus size={16} /> Add
          </Button>
        </div>

        <ExpenseFilters
          category={category}
          setCategory={setCategory}
          monthOffset={monthOffset}
          setMonthOffset={setMonthOffset}
          showMonthPicker={true}
        />

        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <span className="text-5xl mb-3">🧾</span>
            <p className="font-medium text-foreground">{items.length === 0 ? 'No one-time expenses yet' : 'No results for this filter'}</p>
            <p className="text-sm mt-1">{items.length === 0 ? 'Track groceries, repairs, dining out and more' : 'Try a different month or category'}</p>
            {items.length === 0 && (
              <Button onClick={handleAdd} variant="outline" className="mt-4 rounded-xl select-none">
                <Plus size={16} className="mr-1" /> Add your first
              </Button>
            )}
          </div>
        )}

        <AnimatePresence>
          <div className="space-y-2">
            {filtered.sort((a, b) => b.date?.localeCompare(a.date)).map(item => (
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

        <ExpenseFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={saveMutation.mutate}
          initialData={editing}
          type="one-time"
          saveMutation={saveMutation}
        />
      </div>
    </PullToRefresh>
  );
}