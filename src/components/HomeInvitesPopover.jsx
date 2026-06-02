import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, Clock, Check, X, Trash2, ShieldOff } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,     color: 'text-yellow-600 bg-yellow-50' },
  approved: { label: 'Approved', icon: Check,     color: 'text-green-600 bg-green-50' },
  declined: { label: 'Declined', icon: X,         color: 'text-destructive bg-destructive/10' },
};

export default function HomeInvitesPopover({ home }) {
  const currentUser = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [acting, setActing] = useState(null);

  const fetchInvites = async () => {
    if (!currentUser?.id) return;
    const { data, error } = await supabase
      .from('home_invites')
      .select('*')
      .eq('inviter_id', currentUser.id)
      .eq('home_id', home.id)
      .order('created_at', { ascending: false });
    if (!error) setInvites(data || []);
  };

  useEffect(() => {
    if (open) fetchInvites();
  }, [open, currentUser?.id]);

  const handleDelete = async (inviteId) => {
    setActing(inviteId);
    await supabase.from('home_invites').delete().eq('id', inviteId);
    await fetchInvites();
    setActing(null);
  };

  const handleRevoke = async (invite) => {
    setActing(invite.id);
    await supabase.from('home_invites').update({ status: 'declined' }).eq('id', invite.id);
    const { data: homeData } = await supabase
      .from('homes').select('members').eq('id', invite.home_id).single();
    if (homeData?.members && invite.invitee_id) {
      const updatedMembers = homeData.members.filter(m => m !== invite.invitee_id);
      await supabase.from('homes').update({ members: updatedMembers }).eq('id', invite.home_id);
    }
    await fetchInvites();
    setActing(null);
  };

  const activeCount = invites.filter(i => i.status === 'pending' || i.status === 'approved').length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 relative" title="View invitations">
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={acting === invite.id} onClick={() => handleDelete(invite.id)}>
                      <Trash2 size={13} />
                    </Button>
                  )}
                  {isApproved && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={acting === invite.id} onClick={() => handleRevoke(invite)}>
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
