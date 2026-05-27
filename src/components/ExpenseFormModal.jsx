import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BottomSheetSelect from '@/components/BottomSheetSelect';
import { CATEGORIES } from '@/lib/utils';

const CATEGORY_OPTIONS = CATEGORIES.map(c => ({ value: c, label: c }));
const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export default function ExpenseFormModal({ open, onClose, onSave, initialData, type }) {
  const isRecurring = type === 'recurring';

  const empty = isRecurring
    ? { name: '', amount: '', category: '', frequency: 'monthly', start_date: '', notes: '' }
    : { name: '', amount: '', category: '', date: '', notes: '' };

  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(initialData ? { ...initialData, amount: initialData.amount?.toString() } : empty);
  }, [initialData, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.amount || !form.category) return;
    onSave({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {initialData ? 'Edit' : 'Add'} {isRecurring ? 'Recurring' : 'One-Time'} Expense
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label>Name</Label>
            <Input placeholder="e.g. Rent, Netflix" value={form.name} onChange={e => set('name', e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label>Amount (AUD)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} className="pl-7" />
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <div className="mt-1">
              <BottomSheetSelect
                value={form.category}
                onValueChange={v => set('category', v)}
                options={CATEGORY_OPTIONS}
                placeholder="Select category"
              />
            </div>
          </div>

          {isRecurring ? (
            <>
              <div>
                <Label>Frequency</Label>
                <div className="mt-1">
                  <BottomSheetSelect
                    value={form.frequency}
                    onValueChange={v => set('frequency', v)}
                    options={FREQUENCY_OPTIONS}
                    placeholder="Select frequency"
                  />
                </div>
              </div>
              <div>
                <Label>Start / Next Due Date</Label>
                <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className="mt-1" />
              </div>
            </>
          ) : (
            <div>
              <Label>Date Paid</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="mt-1" />
            </div>
          )}

          <div>
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Any extra details..." value={form.notes || ''} onChange={e => set('notes', e.target.value)} className="mt-1 resize-none" rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 select-none">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground select-none">
              {initialData ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}