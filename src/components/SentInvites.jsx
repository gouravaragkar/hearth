import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Clock, Check, X, Trash2, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,  color: 'text-gold bg-gold/10' },
  approved: { label: 'Approved', icon: Check,  color: 'text-sage bg-sage/10' },
  declined: { label: 'Declined', icon: X,      color: 'text-destructive bg-destructive/10' },
  revoked:  { label: 'Revoked',  icon: ShieldOff, color: 'text-muted-foreground bg-muted' },
};

export default function SentInvites({ refreshKey }) {
  const currentUser = useCurrentUser();
  const [invites, setInvites] = useState([]);
  const [acting, setActing] = useState(null);

  const fetchInvites = async () => {
    if (!currentUser?.id) return;
    const all = await base44.entities.HomeInvite.list('-created_date', 100);
    setInvites(all.filter(inv => inv.inviter_id === currentUser.id));
  };

  useEffect(() => {
    fetchInvites();
  }, [currentUser?.id, refreshKey]);

  const handleDelete = async (inviteId) => {
    setActing(inviteId);
    await base44.entities.HomeInvite.delete(inviteId);
    await fetchInvites();
    setActing(null);
  };

  const handleRevoke = async (invite) => {
    setActing(invite.id);
    // Mark as revoked (we use 'declined' status so the invitee's context drops the home)
    await base44.entities.HomeInvite.update(invite.id, { status: 'declined' });
    // Send revoke email
    const appUrl = window.location.origin;
    await base44.integrations.Core.SendEmail({
      to: invite.invitee_email,
      subject: `Your access to "${invite.home_name}" has been revoked`,
      body: `Hi,\n\n${currentUser.full_name || 'The home owner'} has revoked your access to the home "${invite.home_name}" on HomeSpend.\n\nYou will no longer be able to see this home profile when you log in.\n\nIf you think this is a mistake, please reach out to ${currentUser.full_name || 'the home owner'} directly.\n\nCheers,\nThe HomeSpend Team`,
    });
    await fetchInvites();
    setActing(null);
  };

  if (invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-foreground text-base">Sent Invitations</h2>
      {invites.map(invite => {
        const cfg = STATUS_CONFIG[invite.status] || STATUS_CONFIG.pending;
        const Icon = cfg.icon;
        const isPending = invite.status === 'pending';
        const isApproved = invite.status === 'approved';
        return (
          <div key={invite.id} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-warm-sm">
            <span className="text-xl">{invite.home_emoji || '🏠'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{invite.home_name}</p>
              <p className="text-xs text-muted-foreground truncate">→ {invite.invitee_email}</p>
            </div>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.color}`}>
              <Icon size={11} /> {cfg.label}
            </span>
            {isPending && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={acting === invite.id}
                onClick={() => handleDelete(invite.id)}
                title="Cancel invite"
              >
                <Trash2 size={14} />
              </Button>
            )}
            {isApproved && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={acting === invite.id}
                onClick={() => handleRevoke(invite)}
                title="Revoke access"
              >
                <ShieldOff size={14} />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}