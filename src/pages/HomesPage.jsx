import { useState } from 'react';
import { useHome } from '@/context/HomeContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Home, Check } from 'lucide-react';
import { CURRENCIES } from '@/lib/currencies';
import BottomSheetSelect from '@/components/BottomSheetSelect';

const CURRENCY_OPTIONS = CURRENCIES.map(c => ({ value: c.code, label: `${c.code} – ${c.name}` }));

const COUNTRY_FLAG_EMOJIS = [
  '🏠','🇦🇺','🇮🇳','🇺🇸','🇬🇧','🇨🇦','🇳🇿','🇸🇬','🇯🇵','🇨🇳','🇩🇪','🇫🇷','🇮🇹','🇪🇸','🇧🇷','🇲🇽','🇦🇪','🇸🇦','🇿🇦','🇰🇷','🇹🇭','🇲🇾','🇮🇩','🇵🇭','🇻🇳','🇵🇰','🇧🇩','🇱🇰','🇳🇵','🇨🇭','🇸🇪','🇳🇴','🇩🇰','🇵🇱','🇨🇿','🇭🇺',
];

const EMOJI_OPTIONS = COUNTRY_FLAG_EMOJIS.map(e => ({ value: e, label: e }));

const emptyForm = { name: '', country: '', currency: 'AUD', emoji: '🏠' };

export default function HomesPage() {
  const { homes, activeHomeId, switchHome, fetchHomes } = useHome();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (h) => { setEditing(h); setForm({ name: h.name, country: h.country || '', currency: h.currency, emoji: h.emoji || '🏠' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.currency) return;
    setSaving(true);
    if (editing) {
      await base44.entities.Home.update(editing.id, form);
    } else {
      await base44.entities.Home.create(form);
    }
    await fetchHomes();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    // If deleting the active home, clear the stored selection first
    if (id === activeHomeId) {
      const next = homes.find(h => h.id !== id);
      if (next) switchHome(next.id);
      else {
        localStorage.removeItem('activeHomeId');
        switchHome(null);
      }
    }
    await base44.entities.Home.delete(id);
    await fetchHomes();
  };

  return (
    <div className="space-y-5 animate-fade-up px-4 py-6 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Home size={20} className="text-primary" /> My Homes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage homes & currencies. Tap a home to switch.</p>
        </div>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground rounded-xl gap-1.5 select-none">
          <Plus size={16} /> Add Home
        </Button>
      </div>

      {homes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <span className="text-5xl mb-3">🏠</span>
          <p className="font-medium text-foreground">No homes yet</p>
          <p className="text-sm mt-1">Add your first home to track expenses by location & currency</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 rounded-xl select-none">
            <Plus size={16} className="mr-1" /> Add your first home
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {homes.map(home => {
          const isActive = home.id === activeHomeId;
          return (
            <div
              key={home.id}
              onClick={() => switchHome(home.id)}
              className={`bg-card rounded-2xl border p-4 flex items-center gap-4 cursor-pointer transition-all ${isActive ? 'border-primary shadow-warm-md' : 'border-border shadow-warm-sm hover:shadow-warm-md'}`}
            >
              <div className="text-3xl">{home.emoji || '🏠'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{home.name}</p>
                  {isActive && (
                    <span className="flex items-center gap-0.5 text-xs text-primary font-medium">
                      <Check size={12} /> Active
                    </span>
                  )}
                </div>
                {home.country && <p className="text-xs text-muted-foreground">{home.country}</p>}
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{home.currency}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => openEdit(home)}>
                  <Pencil size={15} className="text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => handleDelete(home.id)}>
                  <Trash2 size={15} className="text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-2xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Home' : 'Add Home'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Home Name</Label>
              <Input placeholder="e.g. Home Australia" value={form.name} onChange={e => set('name', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Country (optional)</Label>
              <Input placeholder="e.g. Australia" value={form.country} onChange={e => set('country', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Currency</Label>
              <div className="mt-1">
                <BottomSheetSelect
                  value={form.currency}
                  onValueChange={v => set('currency', v)}
                  options={CURRENCY_OPTIONS}
                  placeholder="Select currency"
                />
              </div>
            </div>
            <div>
              <Label>Icon / Flag</Label>
              <div className="mt-1">
                <BottomSheetSelect
                  value={form.emoji}
                  onValueChange={v => set('emoji', v)}
                  options={EMOJI_OPTIONS}
                  placeholder="Pick an emoji"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 select-none">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground select-none">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Home'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}