import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const GUEST_DAYS = 7;

export default function GuestBanner() {
  const [user, setUser] = useState(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  if (!user?.is_anonymous) return null;

  const createdAt = new Date(user.created_at);
  const expiresAt = new Date(createdAt.getTime() + GUEST_DAYS * 24 * 60 * 60 * 1000);
  const msLeft = expiresAt - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  const handleSignUp = async () => {
    setLinking(true);
    try {
      await supabase.auth.linkIdentity({ provider: 'google' });
      // Redirect happens automatically via OAuth flow
    } catch (e) {
      console.error('Link identity failed:', e);
      setLinking(false);
    }
  };

  return (
    <div className="mx-4 mb-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-center justify-between gap-2">
      <p className="text-xs text-amber-800 leading-snug">
        <span className="font-semibold">👤 Guest mode</span>
        {' · '}
        {daysLeft > 0
          ? <>{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</>
          : <span className="font-semibold text-red-700">Expires today</span>
        }
      </p>
      <button
        onClick={handleSignUp}
        disabled={linking}
        className="shrink-0 text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700 transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {linking ? 'Opening…' : 'Sign up to save →'}
      </button>
    </div>
  );
}
