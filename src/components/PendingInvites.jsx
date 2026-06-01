import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, X, Bell, AlertCircle } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useHome } from '@/context/HomeContext';

export default function PendingInvites({ onInviteActioned }) {
  const currentUser = useCurrentUser();
  const { fetchHomes } = useHome();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchInvites = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getMyInvites', {});
      setInvites(res?.data?.invites || []);
    } catch (e) {
      setInvites([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.email) fetchInvites();
  }, [currentUser?.email]);

  const handleAction = async (invite, action) => {
    setActing(invite.id);
    setErrorMsg(null);
    try {
      const res = await base44.functions.invoke('respondToInvite', { inviteId: invite.id, action });
      if (res?.data?.error) {
        setErrorMsg(res.data.error);
      } else if (action === 'approved') {
        await fetchHomes();
        onInviteActioned?.();
        await fetchInvites();
        setActing(null);
        return;
      }
    } catch (e) {
      setErrorMsg('Something went wrong. Please try again.');
    }
    await fetchInvites();
    setActing(null);
  };

  if (loading || invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-primary" />
        <h2 className="font-semibold text-foreground text-base">Home Invitations</h2>
        <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-0.5">
          {invites.length}
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-sm">
          <AlertCircle size={14} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {invites.map(invite => (
        <div key={invite.id} className="bg-card border border-primary/30 rounded-2xl p-4 shadow-warm-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{invite.home_emoji || '🏠'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{invite.home_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground">{invite.inviter_name}</span> wants to share this home profile with you.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5 select-none"
              disabled={acting === invite.id}
              onClick={() => handleAction(invite, 'declined')}
            >
              <X size={14} className="mr-1" /> Decline
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-xl bg-primary text-primary-foreground select-none"
              disabled={acting === invite.id}
              onClick={() => handleAction(invite, 'approved')}
            >
              <Check size={14} className="mr-1" /> Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}