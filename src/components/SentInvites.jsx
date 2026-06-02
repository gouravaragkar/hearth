import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, Check, X, Trash2, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,  color: 'text-yellow-600 bg-yellow-50' },
  approved: { label: 'Approved', icon: Check,  color: 'text-green-600 bg-green-50' },
  declined: { label: 'Declined', icon: X,      color: 'text-destructive bg-destructive/10' },
};

export default function SentInvites({ refreshKey }) {
  const currentUser = useCurrentUser();
  const [invites, setInvites] = useState([]);
  const [acting, setActing] = useState(null);

  const fetchInvites = async () => {
    if (!currentUser?.id) return;
    const { data, error } = await supabase
      .from('home_invites')
      .select('*')
      .eq('inviter_id', currentUser.id)
      .order('created_at', { ascending: false });
    if (!error) setInvites(data || []);
  };

  useEffect(() => {
    fetchInvites();
  }, [currentUser?.id, refreshKey]);

  const handleDelete = async (inviteId) => {
    setActing(inviteId);
    await supabase.from('home_invites').delete().eq('id', inviteId);
    await fetchInvites();
    setActing(null);
  };

  const handleRevoke = async (invite) => {
    setActing(invite.id);
    await supabase.from('home_invites').update({ status: 'declined' }).eq('id', invite.id);
    if (invite.invitee_id) {
      const { data: homeData } = await supabase
        .from('homes').select('members').eq('id', invite.home_id).single();
      if (homeData?.members) {
        const updatedMembers = homeData.members.filter(m => m !== invite.invitee_id);
        await supabase.from('homes').update({ members: updatedMembers }).eq('id', invite.home_id);
      }
    }
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
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={acting === invite.id} onClick={() => handleDelete(invite.id)}>
                <Trash2 size={14} />
              </Button>
            )}
            {isApproved && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={acting === invite.id} onClick={() => handleRevoke(invite)}>
                <ShieldOff size={14} />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
