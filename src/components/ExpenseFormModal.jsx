import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BottomSheetSelect from '@/components/BottomSheetSelect';
import { CATEGORIES } from '@/lib/utils';
import { CURRENCIES, getCurrency } from '@/lib/currencies';
import { useHome } from '@/context/HomeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const CATEGORY_OPTIONS = CATEGORIES.map(c => ({ value: c, label: c }));
const FREQUENCY_OPTIONS = [
  { value: 'weekly',      label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly',     label: 'Monthly' },
  { value: 'quarterly',   label: 'Quarterly' },
];

export default function ExpenseFormModal({ open, onClose, onSave, initialData, type, saveMutation }) {
  const isRecurring = type === 'recurring';
  const { activeHome, homes } = useHome();
  const defaultCurrency = activeHome?.currency || 'AUD';
  const defaultHomeId = activeHome?.id || null;

  const empty = isRecurring
    ? { name: '', amount: '', currency: defaultCurrency, category: '', frequency: 'monthly', start_date: '', notes: '', home_id: defaultHomeId }
    : { name: '', amount: '', currency: defaultCurrency, category: '', date: '', notes: '', home_id: defaultHomeId };

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, amount: initialData.amount?.toString(), currency: initialData.currency || defaultCurrency, home_id: initialData.home_id || defaultHomeId });
    } else {
      setForm({ ...empty, currency: defaultCurrency, home_id: defaultHomeId });
    }
    setErrors({});
  }, [initialData, open, defaultCurrency, defaultHomeId]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const isSaving = saveMutation?.isPending ?? false;

  const handleSave = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = 'Name is required';
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Amount is required';
    if (!form.category) newErrors.category = 'Please select a category';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({ ...form, amount: parseFloat(form.amount) });
  };

  const currencySymbol = getCurrency(form.currency)?.symbol || '$';

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
            <Input placeholder="e.g. Rent, Netflix" value={form.name} onChange={e => set('name', e.target.value)} className={`mt-1 ${errors.name ? 'border-destructive' : ''}`} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Amount + Currency on same row */}
          <div>
            <Label>Amount & Currency</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">{currencySymbol}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  className={`pl-7 ${errors.amount ? 'border-destructive' : ''}`}
                />
              </div>
              <div className="w-36">
                <Select value={form.currency} onValueChange={v => set('currency', v)}>
                  <SelectTrigger className="h-[44px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} – {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
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
            {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
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

          {homes.length > 1 && (
            <div>
              <Label>Home</Label>
              <div className="mt-1">
                <Select value={form.home_id || ''} onValueChange={v => set('home_id', v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select home" />
                  </SelectTrigger>
                  <SelectContent>
                    {homes.map(h => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.emoji || '🏠'} {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Any extra details..." value={form.notes || ''} onChange={e => set('notes', e.target.value)} className="mt-1 resize-none" rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="flex-1 select-none">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary text-primary-foreground select-none">
              {isSaving ? <><Loader2 size={15} className="animate-spin mr-1.5" /> Saving…</> : (initialData ? 'Save Changes' : 'Add Expense')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}