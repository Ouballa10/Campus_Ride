import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const sess = await authService.getSession();
        if (!active) return;
        setSession(sess);
        if (sess?.user?.id) {
          const prof = await authService.ensureProfile(sess.user);
          if (active) setProfile(prof);
        }
      } catch (e) {
        console.error('Auth bootstrap error:', e);
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrap();

    if (!isSupabaseConfigured) return () => { active = false; };

    const { data: { subscription } } = authService.onAuthStateChange(async (_event, sess) => {
      if (!active) return;
      setSession(sess);
      if (sess?.user?.id) {
        const prof = await authService.ensureProfile(sess.user);
        if (active) setProfile(prof);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (!session?.user?.id) return;
    const prof = await authService.getProfile(session.user.id);
    setProfile(prof);
  }

  async function signIn(credentials) {
    const data = await authService.signIn(credentials);
    setSession(data.session);
    if (data.session?.user?.id) {
      const prof = await authService.ensureProfile(data.session.user);
      setProfile(prof);
    }
    return data;
  }

  async function signUp(payload) {
    const data = await authService.signUp(payload);
    if (data.session?.user?.id) {
      setSession(data.session);
      const prof = await authService.ensureProfile(data.session.user, payload);
      setProfile(prof);
    }
    return data;
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      await authService.signOut();
    }
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{
      isConfigured: isSupabaseConfigured,
      loading,
      session,
      profile,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      userId: session?.user?.id || null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
