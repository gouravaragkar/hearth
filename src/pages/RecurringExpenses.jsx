import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ExpenseCard from '@/components/ExpenseCard';
import ExpenseFormModal from '@/components/ExpenseFormModal';
import ExpenseFilters from '@/components/ExpenseFilters';
import PullToRefresh from '@/components/PullToRefresh';
import { formatAUD, getMonthlyEquivalent, getNextDueDate } from '@/lib/utils';

export default function RecurringExpenses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState('all');
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => base44.entities.RecurringExpense.list('-created_date', 100),
  });

  const enriched = items.map(e => ({
    ...e,
    next_due_date: e.next_due_date || getNextDueDate(e.start_date, e.frequency).toISOString().split('T')[0],
  }));

  const filtered = category === 'all' ? enriched : enriched.filter(e => e.category === category);
  const monthlyTotal = filtered.reduce((s, e) => s + getMonthlyEquivalent(e.amount, e.frequency), 0);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const nextDue = getNextDueDate(data.start_date, data.frequency).toISOString().split('T')[0];
      const payload = { ...data, next_due_date: nextDue };
      if (editing) return base44.entities.RecurringExpense.update(editing.id, payload);
      return base44.entities.RecurringExpense.create(payload);
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['recurring'] });
      const prev = qc.getQueryData(['recurring']);
      if (editing) {
        qc.setQueryData(['recurring'], old =>
          old.map(e => e.id === editing.id ? { ...e, ...data } : e)
        );
      } else {
        const optimistic = { ...data, id: `tmp-${Date.now()}`, created_date: new Date().toISOString() };
        qc.setQueryData(['recurring'], old => [optimistic, ...old]);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => { qc.setQueryData(['recurring'], ctx.prev); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RecurringExpense.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['recurring'] });
      const prev = qc.getQueryData(['recurring']);
      qc.setQueryData(['recurring'], old => old.filter(e => e.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => { qc.setQueryData(['recurring'], ctx.prev); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  });

  const togglePaidMutation = useMutation({
    mutationFn: (e) => base44.entities.RecurringExpense.update(e.id, { paid_this_cycle: !e.paid_this_cycle }),
    onMutate: async (expense) => {
      await qc.cancelQueries({ queryKey: ['recurring'] });
      const prev = qc.getQueryData(['recurring']);
      qc.setQueryData(['recurring'], old =>
        old.map(e => e.id === expense.id ? { ...e, paid_this_cycle: !e.paid_this_cycle } : e)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { qc.setQueryData(['recurring'], ctx.prev); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  });

  const handleEdit = (item) => { setEditing(item); setModalOpen(true); };
  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['recurring'] });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-5 animate-fade-up px-4 py-6 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <RefreshCw size={20} className="text-primary" /> Recurring Expenses
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} active · <span className="font-medium text-foreground">{formatAUD(monthlyTotal)}/mo estimated</span>
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-primary text-primary-foreground rounded-xl gap-1.5 select-none">
            <Plus size={16} /> Add
          </Button>
        </div>

        <ExpenseFilters
          category={category}
          setCategory={setCategory}
          monthOffset={0}
          setMonthOffset={() => {}}
          showMonthPicker={false}
        />

        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <span className="text-5xl mb-3">🔄</span>
            <p className="font-medium text-foreground">{enriched.length === 0 ? 'No recurring expenses yet' : 'No results for this filter'}</p>
            <p className="text-sm mt-1">{enriched.length === 0 ? 'Add rent, utilities, subscriptions and more' : 'Try a different category'}</p>
            {enriched.length === 0 && (
              <Button onClick={handleAdd} variant="outline" className="mt-4 rounded-xl select-none">
                <Plus size={16} className="mr-1" /> Add your first
              </Button>
            )}
          </div>
        )}

        <AnimatePresence>
          {filtered.map(item => (
            <ExpenseCard
              key={item.id}
              expense={item}
              type="recurring"
              onEdit={handleEdit}
              onDelete={deleteMutation.mutate}
              onTogglePaid={togglePaidMutation.mutate}
            />
          ))}
        </AnimatePresence>

        <ExpenseFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={saveMutation.mutate}
          initialData={editing}
          type="recurring"
        />
      </div>
    </PullToRefresh>
  );
}