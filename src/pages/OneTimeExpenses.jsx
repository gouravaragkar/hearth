import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ExpenseCard from '@/components/ExpenseCard';
import ExpenseFormModal from '@/components/ExpenseFormModal';
import ExpenseFilters from '@/components/ExpenseFilters';
import PullToRefresh from '@/components/PullToRefresh';
import { formatCurrency } from '@/lib/currencies';
import { useHome } from '@/context/HomeContext';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function OneTimeExpenses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState('all');
  const [monthOffset, setMonthOffset] = useState(0);
  const qc = useQueryClient();
  const user = useCurrentUser();
  const { activeHome } = useHome();
  const currency = activeHome?.currency || 'AUD';

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['expenses', user?.id, activeHome?.id],
    queryFn: () => {
      const filter = { created_by_id: user.id };
      if (activeHome?.id) filter.home_id = activeHome.id;
      return base44.entities.Expense.filter(filter, '-date', 200);
    },
    enabled: !!user?.id,
  });

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
    mutationFn: async (data) => {
      if (editing) return base44.entities.Expense.update(editing.id, data);
      return base44.entities.Expense.create(data);
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['expenses'] });
      const prev = qc.getQueryData(['expenses']);
      if (editing) {
        qc.setQueryData(['expenses'], old =>
          old.map(e => e.id === editing.id ? { ...e, ...data } : e)
        );
      } else {
        const optimistic = { ...data, id: `tmp-${Date.now()}`, created_date: new Date().toISOString() };
        qc.setQueryData(['expenses'], old => [optimistic, ...old]);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => { qc.setQueryData(['expenses'], ctx.prev); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['expenses', user?.id] });
      const prev = qc.getQueryData(['expenses', user?.id]);
      qc.setQueryData(['expenses', user?.id], old => old.filter(e => e.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => { qc.setQueryData(['expenses', user?.id], ctx.prev); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', user?.id] }),
  });

  const handleEdit = (item) => { setEditing(item); setModalOpen(true); };
  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['expenses', user?.id] });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-5 animate-fade-up px-4 py-6 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt size={20} className="text-primary" /> One-Time Expenses
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground">{formatCurrency(total, currency)}</span>
              {' · '}{filtered.length} transactions
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-primary text-primary-foreground rounded-xl gap-1.5 select-none">
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
        />
      </div>
    </PullToRefresh>
  );
}