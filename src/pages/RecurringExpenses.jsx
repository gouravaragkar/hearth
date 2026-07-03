import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ExpenseCard from '@/components/ExpenseCard';
import ExpenseFormModal from '@/components/ExpenseFormModal';
import ExpenseFilters from '@/components/ExpenseFilters';
import PullToRefresh from '@/components/PullToRefresh';
import { getMonthlyEquivalent, getNextDueDate } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencies';
import { useHome } from '@/context/HomeContext';
import { useHomeData } from '@/hooks/useHomeData';

export default function RecurringExpenses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState('all');
  const [frequency, setFrequency] = useState('all');
  const qc = useQueryClient();
  const { activeHome } = useHome();
  const currency = activeHome?.currency || 'AUD';
  const { recurring: items, isLoading, mutateShared } = useHomeData();

  const enriched = items.map(e => ({
    ...e,
    next_due_date: e.next_due_date || getNextDueDate(e.start_date, e.frequency).toISOString().split('T')[0],
  }));

  const filtered = enriched
    .filter(e => category === 'all' || e.category === category)
    .filter(e => frequency === 'all' || e.frequency === frequency);

  const getFrequencyTotal = () => {
    if (frequency === 'all') {
      return { amount: filtered.reduce((s, e) => s + getMonthlyEquivalent(e.amount, e.frequency), 0), label: '/mo est.' };
    }
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const labels = {
      weekly: '/week',
      fortnightly: '/fortnight',
      monthly: '/month',
      quarterly: '/quarter',
      'semi-annual': '/6 months',
      annual: '/year',
    };
    return { amount: total, label: labels[frequency] || '' };
  };
  const { amount: totalAmount, label: totalLabel } = getFrequencyTotal();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const nextDue = getNextDueDate(data.start_date, data.frequency).toISOString().split('T')[0];
      const payload = { ...data, next_due_date: nextDue };
      return mutateShared('RecurringExpense', editing ? 'update' : 'create', payload, editing?.id);
    },
    onSuccess: () => { setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mutateShared('RecurringExpense', 'delete', null, id),
  });

  const togglePaidMutation = useMutation({
    mutationFn: (e) => mutateShared('RecurringExpense', 'update', { paid_this_cycle: !e.paid_this_cycle }, e.id),
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
              <RefreshCw size={18} className="text-primary shrink-0" /> Recurring Expenses
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {filtered.length} active · <span className="font-medium text-foreground">{formatCurrency(totalAmount, currency)}{totalLabel}</span>
            </p>
          </div>
          <Button onClick={handleAdd} data-testid="add-recurring-btn" className="bg-primary text-primary-foreground rounded-xl gap-1.5 select-none">
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

        {/* Frequency filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'weekly', 'fortnightly', 'monthly', 'quarterly', 'semi-annual', 'annual'].map(f => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                frequency === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {f === 'all' ? 'All frequencies' : f}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <span className="text-5xl mb-3">🔄</span>
            <p className="font-medium text-foreground">{enriched.length === 0 ? 'No recurring expenses yet' : 'No results for this filter'}</p>
            <p className="text-sm mt-1">{enriched.length === 0 ? 'Add rent, utilities, subscriptions and more' : 'Try a different category or frequency'}</p>
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
          saveMutation={saveMutation}
        />
      </div>
    </PullToRefresh>
  );
}