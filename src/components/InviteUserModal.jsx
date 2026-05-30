import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { UserPlus, Search, Check, X } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function InviteUserModal({ open, onClose, homes }) {
  const currentUser = useCurrentUser();
  const [email, setEmail] = useState('');
  const [selectedHomes, setSelectedHomes] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // 'sent' | 'error' | null

  const toggleHome = (homeId) => {
    setSelectedHomes(prev =>
      prev.includes(homeId) ? prev.filter(id => id !== homeId) : [...prev, homeId]
    );
  };

  const handleSend = async () => {
    if (!email.trim() || selectedHomes.length === 0 || !currentUser) return;

    // Prevent inviting yourself
    if (email.trim().toLowerCase() === currentUser.email?.toLowerCase()) {
      setResult('self');
      return;
    }

    setSending(true);
    setResult(null);

    // Look up invitee by email
    let inviteeUser = null;
    const allUsers = await base44.entities.User.list();
    inviteeUser = allUsers.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

    // Create one invite per selected home
    const invitePromises = selectedHomes.map(homeId => {
      const home = homes.find(h => h.id === homeId);
      return base44.entities.HomeInvite.create({
        home_id: homeId,
        home_name: home?.name || '',
        home_emoji: home?.emoji || '🏠',
        inviter_id: currentUser.id,
        inviter_name: currentUser.full_name || 'Someone',
        invitee_email: email.trim().toLowerCase(),
        invitee_id: inviteeUser?.id || '',
        status: 'pending',
      });
    });

    await Promise.all(invitePromises);
    setSending(false);
    setResult('sent');
    setEmail('');
    setSelectedHomes([]);
  };

  const handleClose = () => {
    setEmail('');
    setSelectedHomes([]);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" /> Invite Someone to a Home
          </DialogTitle>
        </DialogHeader>

        {result === 'sent' ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="h-14 w-14 rounded-full bg-sage/20 flex items-center justify-center">
              <Check size={28} className="text-sage" />
            </div>
            <p className="font-semibold text-foreground text-center">Invite sent!</p>
            <p className="text-sm text-muted-foreground text-center">
              They'll see a notification when they log in and can approve or decline.
            </p>
            <Button onClick={handleClose} className="mt-2 rounded-xl bg-primary text-primary-foreground select-none">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div>
              <Label>Their email address</Label>
              <div className="relative mt-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="e.g. son@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setResult(null); }}
                  className="pl-9"
                  type="email"
                />
              </div>
              {result === 'self' && (
                <p className="text-xs text-destructive mt-1">You can't invite yourself.</p>
              )}
            </div>

            <div>
              <Label>Select home(s) to share</Label>
              <div className="mt-2 space-y-2">
                {homes.map(home => {
                  const selected = selectedHomes.includes(home.id);
                  return (
                    <button
                      key={home.id}
                      onClick={() => toggleHome(home.id)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all select-none ${
                        selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-xl">{home.emoji || '🏠'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{home.name}</p>
                        <p className="text-xs text-muted-foreground">{home.currency}</p>
                      </div>
                      {selected && <Check size={16} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={handleClose} className="flex-1 rounded-xl select-none">
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !email.trim() || selectedHomes.length === 0}
                className="flex-1 rounded-xl bg-primary text-primary-foreground select-none"
              >
                {sending ? 'Sending…' : 'Send Invite'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}