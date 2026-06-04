import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Login() {
  const [guestConfirm, setGuestConfirm] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const isInviteFlow = params.get('invite') === 'true';

  // If arriving via invite link, remember to redirect to /homes after login
  if (isInviteFlow) {
    localStorage.setItem('redirect_after_login', '/homes');
  }

  const handleGoogleLogin = async () => {
    const redirectTo = window.location.origin + (window.location.pathname !== '/login' ? window.location.pathname : '/');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
  };

  const handleGuestContinue = async () => {
    setGuestLoading(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Guest sign-in error:', error);
        setGuestLoading(false);
        return;
      }
      if (data?.user) {
        // Force a session refresh so AuthContext picks it up
        await supabase.auth.getSession();
        window.location.href = '/';
      }
    } catch (e) {
      console.error('Guest sign-in failed:', e);
      setGuestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <img src="/logo.png" alt="HomeSpend" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-primary mt-4">HomeSpend</h1>
          <p className="text-muted-foreground mt-2">Home finances, made simple</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-center mb-3">Sign in to continue</h2>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-border rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          {isInviteFlow ? (
            /* Invite flow — hide guest, show info note */
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              👥 You have a home invitation waiting. Sign in with Google to accept it.
            </div>
          ) : (
            <>
              {/* Divider */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Guest confirm message */}
              {guestConfirm ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                  <p className="text-sm text-amber-800 font-medium">👤 Guest mode</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Guest data is stored for 7 days. Sign up anytime to save your data permanently — all your expenses carry over.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleGuestContinue}
                      disabled={guestLoading}
                      className="w-full bg-amber-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-60"
                    >
                      {guestLoading ? 'Starting…' : 'Got it, continue as guest'}
                    </button>
                    <button
                      onClick={() => { setGuestConfirm(false); handleGoogleLogin(); }}
                      className="w-full border border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Sign up with Google instead
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setGuestConfirm(true)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  👤 Try as Guest
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in you agree to our terms of service
        </p>
        <p className="text-center text-xs text-muted-foreground mt-1">
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
