import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, Clock, Check, X, Trash2, ShieldOff } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,     color: 'text-gold bg-gold/10' },
  approved: { label: 'Approved', icon: Check,     color: 'text-sage bg-sage/10' },
  declined: { label: 'Declined', icon: X,         color: 'text-destructive bg-destructive/10' },
};

export default function HomeInvitesPopover({ home }) {
  const currentUser = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [acting, setActing] = useState(null);

  const fetchInvites = async () => {
    if (!currentUser?.id) return;
    const all = await base44.entities.HomeInvite.list('-created_date', 100);
    setInvites(all.filter(inv => inv.inviter_id === currentUser.id && inv.home_id === home.id));
  };

  useEffect(() => {
    if (open) fetchInvites();
  }, [open, currentUser?.id]);

  const handleDelete = async (inviteId) => {
    setActing(inviteId);
    await base44.entities.HomeInvite.delete(inviteId);
    await fetchInvites();
    setActing(null);
  };

  const handleRevoke = async (invite) => {
    setActing(invite.id);
    await base44.entities.HomeInvite.update(invite.id, { status: 'declined' });
    await base44.integrations.Core.SendEmail({
      to: invite.invitee_email,
      subject: `Your access to "${invite.home_name}" has been revoked`,
      body: `Hi,\n\n${currentUser.full_name || 'The home owner'} has revoked your access to the home "${invite.home_name}" on HomeSpend.\n\nYou will no longer be able to see this home profile when you log in.\n\nCheers,\nThe HomeSpend Team`,
    });
    await fetchInvites();
    setActing(null);
  };

  // Count active invites (pending + approved) for badge
  const activeCount = invites.filter(i => i.status === 'pending' || i.status === 'approved').length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 relative"
          title="View invitations"
        >
          <Eye size={15} className="text-muted-foreground" />
          {activeCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 rounded-2xl" align="end">
        <p className="font-semibold text-sm text-foreground mb-2">
          {home.emoji || '🏠'} {home.name} — Invitations
        </p>
        {invites.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">No invitations sent for this home.</p>
        ) : (
          <div className="space-y-2">
            {invites.map(invite => {
              const cfg = STATUS_CONFIG[invite.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              const isPending = invite.status === 'pending';
              const isApproved = invite.status === 'approved';
              return (
                <div key={invite.id} className="flex items-center gap-2 bg-muted/50 rounded-xl px-2 py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{invite.invitee_email}</p>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${cfg.color}`}>
                      <Icon size={9} /> {cfg.label}
                    </span>
                  </div>
                  {isPending && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={acting === invite.id}
                      onClick={() => handleDelete(invite.id)}
                      title="Cancel invite"
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                  {isApproved && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={acting === invite.id}
                      onClick={() => handleRevoke(invite)}
                      title="Revoke access"
                    >
                      <ShieldOff size={13} />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}