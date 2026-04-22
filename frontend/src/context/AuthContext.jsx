import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import { buildCurrentUser } from "../utils/appDataMappers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function bootstrapAuth() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const nextSession = await authService.getSession();

        if (!isActive) {
          return;
        }

        setSession(nextSession);

        if (nextSession?.user?.id) {
          const nextProfile = await authService.getCurrentProfile(nextSession.user.id);

          if (isActive) {
            setProfile(nextProfile);
          }
        }
      } catch (error) {
        console.error("Auth bootstrap failed:", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    bootstrapAuth();

    if (!isSupabaseConfigured) {
      return () => {
        isActive = false;
      };
    }

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (_event, nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);

      if (nextSession?.user?.id) {
        const nextProfile = await authService.getCurrentProfile(nextSession.user.id);

        if (isActive) {
          setProfile(nextProfile);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (!session?.user?.id || !isSupabaseConfigured) {
      return null;
    }

    const nextProfile = await authService.getCurrentProfile(session.user.id);
    setProfile(nextProfile);
    return nextProfile;
  }

  async function signIn(credentials) {
    const data = await authService.signIn(credentials);
    setSession(data.session);

    if (data.session?.user?.id) {
      const nextProfile = await authService.getCurrentProfile(data.session.user.id);
      setProfile(nextProfile);
      return { ...data, profile: nextProfile };
    }

    return { ...data, profile: null };
  }

  async function signUp(payload) {
    const data = await authService.signUp(payload);

    if (data.session?.user?.id) {
      setSession(data.session);
      const nextProfile = await authService.getCurrentProfile(data.session.user.id);
      setProfile(nextProfile);
      return { ...data, profile: nextProfile };
    }

    return { ...data, profile: null };
  }

  async function signOut() {
    if (!isSupabaseConfigured) {
      setSession(null);
      setProfile(null);
      return;
    }

    await authService.signOut();
    setSession(null);
    setProfile(null);
  }

  const value = {
    currentUser: profile ? buildCurrentUser(profile) : null,
    isConfigured: isSupabaseConfigured,
    loading,
    profile,
    refreshProfile,
    session,
    signIn,
    signOut,
    signUp,
    user: session?.user ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
