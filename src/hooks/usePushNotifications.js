import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [daysBefore, setDaysBefore] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const pwa = window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(ios);
    setIsPWA(pwa);
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);

    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('push_subscriptions')
        .select('days_before')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setIsSubscribed(true);
        setDaysBefore(data.days_before);
      }
    } catch (e) {
      // No subscription found
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (days = 1) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
        days_before: days,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      setIsSubscribed(true);
      setDaysBefore(days);
      return true;
    } catch (e) {
      console.error('Subscribe failed:', e);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
      setIsSubscribed(false);
      return true;
    } catch (e) {
      console.error('Unsubscribe failed:', e);
      return false;
    }
  };

  const updateDaysBefore = async (days) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('push_subscriptions')
        .update({ days_before: days, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      setDaysBefore(days);
    } catch (e) {
      console.error('Update failed:', e);
    }
  };

  return { isSupported, isSubscribed, daysBefore, loading, isIOS, isPWA, subscribe, unsubscribe, updateDaysBefore };
}
