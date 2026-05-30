import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Clock, Check, X } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,  color: 'text-gold bg-gold/10' },
  approved: { label: 'Approved', icon: Check,  color: 'text-sage bg-sage/10' },
  declined: { label: 'Declined', icon: X,      color: 'text-destructive bg-destructive/10' },
};

export default function SentInvites({ refreshKey }) {
  const currentUser = useCurrentUser();
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    base44.entities.HomeInvite.list('-created_date', 100).then(all => {
      setInvites(all.filter(inv => inv.inviter_id === currentUser.id));
    });
  }, [currentUser?.id, refreshKey]);

  if (invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-foreground text-base">Sent Invitations</h2>
      {invites.map(invite => {
        const cfg = STATUS_CONFIG[invite.status] || STATUS_CONFIG.pending;
        const Icon = cfg.icon;
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
          </div>
        );
      })}
    </div>
  );
}