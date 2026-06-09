import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // Check if user already has an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('AUTH STATE CHANGE event:', _event, 'user:', session?.user?.id);
        const redirectTo = localStorage.getItem('redirect_after_login');
        console.log('redirect_after_login in storage:', redirectTo);
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Check if we need to redirect somewhere specific after login
          localStorage.removeItem('login_context');
          if (redirectTo) {
            localStorage.removeItem('redirect_after_login');
            window.location.href = redirectTo;
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    const params = new URLSearchParams(window.location.search);
    const isInvite = params.get('invite') === 'true';
    const currentPath = window.location.pathname;
    console.log('NAVIGATE TO LOGIN - path:', currentPath, 'isInvite:', isInvite);
    if (isInvite || currentPath === '/homes') {
      localStorage.setItem('redirect_after_login', '/homes');
      localStorage.setItem('login_context', 'invite');
      console.log('SET login_context = invite');
    }
    window.location.href = '/login';
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      if (error) {
        setAuthError({ type: 'auth_required', message: error.message });
      }
    }
    setIsLoadingAuth(false);
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
