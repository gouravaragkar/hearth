import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);
  return user;
}