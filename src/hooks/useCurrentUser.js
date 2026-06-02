import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current session user
    supabase.auth.getUser()
      .then(({ data: { user } }) => setUser(user))
      .catch(() => {});

    // Keep in sync if auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return user;
}