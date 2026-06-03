import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHome } from '@/context/HomeContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Home, Check, UserPlus, History } from 'lucide-react';
import { CURRENCIES } from '@/lib/currencies';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InviteUserModal from '@/components/InviteUserModal';
import PendingInvites from '@/components/PendingInvites';
import HomeInvitesPopover from '@/components/HomeInvitesPopover';
import HomeActivityLog from '@/components/HomeActivityLog';

const COUNTRY_FLAG_EMOJIS = [
  '🏠','🇦🇺','🇮🇳','🇺🇸','🇬🇧','🇨🇦','🇳🇿','🇸🇬','🇯🇵','🇨🇳','🇩🇪','🇫🇷','🇮🇹','🇪🇸','🇧🇷','🇲🇽','🇦🇪','🇸🇦','🇿🇦','🇰🇷','🇹🇭','🇲🇾','🇮🇩','🇵🇭','🇻🇳','🇵🇰','🇧🇩','🇱🇰','🇳🇵','🇨🇭','🇸🇪','🇳🇴','🇩🇰','🇵🇱','🇨🇿','🇭🇺',
];

const EMOJI_OPTIONS = COUNTRY_FLAG_EMOJIS.map(e => ({ value: e, label: e }));
const emptyForm = { name: '', country: '', currency: 'AUD', emoji: '🏠' };

const COUNTRY_CURRENCY_MAP = {
  'australia': 'AUD', 'india': 'INR', 'united states': 'USD', 'usa': 'USD', 'us': 'USD',
  'united kingdom': 'GBP', 'uk': 'GBP', 'canada': 'CAD', 'new zealand': 'NZD',
  'singapore': 'SGD', 'japan': 'JPY', 'china': 'CNY', 'germany': 'EUR', 'france': 'EUR',
  'italy': 'EUR', 'spain': 'EUR', 'brazil': 'BRL', 'mexico': 'MXN', 'uae': 'AED',
  'dubai': 'AED', 'south africa': 'ZAR', 'south korea': 'KRW', 'thailand': 'THB',
  'malaysia': 'MYR', 'indonesia': 'IDR', 'philippines': 'PHP', 'vietnam': 'VND',
  'pakistan': 'PKR', 'bangladesh': 'BDT', 'sri lanka': 'LKR', 'nepal': 'NPR',
  'switzerland': 'CHF', 'sweden': 'SEK', 'norway': 'NOK', 'denmark': 'DKK',
  'poland': 'PLN', 'czech republic': 'CZK', 'hungary': 'HUF',
};

export default function HomesPage() {
  const { homes, activeHomeId, switchHome, fetchHomes } = useHome();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0);
  const [activityHome, setActivityHome] = useState(null);

  const set = (k, v) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === 'country') {
        const mapped = COUNTRY_CURRENCY_MAP[v.trim().toLowerCase()];
        if (mapped) updated.currency = mapped;
      }
      return updated;
    });
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (h) => {
    setEditing(h);
    setForm({ name: h.name, country: h.country || '', currency: h.currency, emoji: h.emoji || '🏠' });
    setModalOpen(true);
  };

  // Log activity to home_activities table
  const log = async (home_id, entity, action, record_name, details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('home_activities').insert({
        home_id,
        entity,
        action,
        record_name,
        details,
        actor_id: user.id,
        actor_name: user.user_metadata?.full_name || user.email,
      });
    } catch (e) {
      console.error('Error logging activity:', e);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.currency) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editing) {
        // Update existing home
        const { error } = await supabase
          .from('homes')
          .update({
            name: form.name,
            country: form.country,
            currency: form.currency,
            emoji: form.emoji,
          })
          .eq('id', editing.id);

        if (error) throw error;
        await log(editing.id, 'Home', 'update', form.name, `Currency: ${form.currency}`);

      } else {
        // Create new home
        const { data: newHome, error: homeError } = await supabase
          .from('homes')
          .insert({
            name: form.name,
            country: form.country,
            currency: form.currency,
            emoji: form.emoji,
            created_by: user.id,
            members: [],
          })
          .select()
          .single();

        if (homeError) throw homeError;

        // Create default budget for current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        await supabase.from('budgets').insert({
          month: currentMonth,
          amount: 0,
          home_id: newHome.id,
          created_by: user.id,
        });

        await log(newHome.id, 'Home', 'create', form.name, `Currency: ${form.currency}`);
      }

      await fetchHomes();
      setModalOpen(false);
    } catch (e) {
      console.error('Error saving home:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const home = homes.find(h => h.id === id);
      await log(id, 'Home', 'delete', home?.name || '', '');

      const { error } = await supabase
        .from('homes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const remaining = homes.filter(h => h.id !== id);
      if (id === activeHomeId) {
        switchHome(remaining[0]?.id || null);
      }

      await fetchHomes();
    } catch (e) {
      console.error('Error deleting home:', e);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up px-4 py-6 pb-28">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-1.5 whitespace-nowrap">
            <Home size={18} className="text-primary shrink-0" /> My Homes
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">Manage your homes</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)} className="rounded-xl gap-1 text-xs px-3 select-none">
            <UserPlus size={13} /> Invite
          </Button>
          <Button size="sm" onClick={openAdd} className="bg-primary text-primary-foreground rounded-xl gap-1 text-xs px-3 select-none">
            <Plus size={13} /> Add
          </Button>
        </div>
      </div>

      <PendingInvites
        onInviteActioned={async () => {
          setInviteRefreshKey(k => k + 1);
          await fetchHomes();
        }}
      />

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
          // In Supabase, shared homes are ones where created_by is not current user
          // We detect this from the RLS — if it's in the list but not owned, it's shared
          const isShared = home._shared || false;

          return (
            <div
              key={home.id}
              onClick={() => { switchHome(home.id); navigate('/'); }}
              className={`bg-card rounded-2xl border p-4 flex items-center gap-3 cursor-pointer transition-all ${
                isActive ? 'border-primary shadow-warm-md' : 'border-border shadow-warm-sm hover:shadow-warm-md'
              }`}
            >
              <div className="text-2xl shrink-0">{home.emoji || '🏠'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{home.name}</p>
                  {isActive && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-xs text-primary font-medium shrink-0">
                      <Check size={11} /> Active
                    </span>
                  )}
                  {isShared && (
                    <span className="hidden sm:inline-flex text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                      Shared
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-muted-foreground">{home.currency}</p>
                  {isActive && (
                    <span className="sm:hidden inline-flex items-center gap-0.5 text-xs text-primary font-medium">
                      <Check size={11} /> Active
                    </span>
                  )}
                  {isShared && (
                    <span className="sm:hidden text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Shared
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActivityHome(home)}>
                  <History size={14} className="text-muted-foreground" />
                </Button>
                {!isShared && (
                  <>
                    <HomeInvitesPopover home={home} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(home)}>
                      <Pencil size={14} className="text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(home.id)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <HomeActivityLog
        home={activityHome}
        open={!!activityHome}
        onClose={() => setActivityHome(null)}
      />

      <InviteUserModal
        open={inviteOpen}
        onClose={() => { setInviteOpen(false); setInviteRefreshKey(k => k + 1); }}
        homes={homes}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-2xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Home' : 'Add Home'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Home Name</Label>
              <Input
                placeholder="e.g. Home Australia"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Country (optional)</Label>
              <Input
                placeholder="e.g. Australia"
                value={form.country}
                onChange={e => set('country', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <div className="mt-1">
                <Select value={form.currency} onValueChange={v => set('currency', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
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
            <div>
              <Label>Icon / Flag</Label>
              <div className="mt-1">
                <Select value={form.emoji} onValueChange={v => set('emoji', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick an emoji" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {EMOJI_OPTIONS.map(e => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1 select-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground select-none"
              >
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Home'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}