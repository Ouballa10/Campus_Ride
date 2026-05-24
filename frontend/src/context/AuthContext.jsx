import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import { buildCurrentUser } from "../utils/appDataMappers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(() => {
    // Load cached profile immediately to avoid blank screen
    try {
      const cached = localStorage.getItem("campusride-profile-cache");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return () => { isActive = false; };
    }

    // Use onAuthStateChange as the single source of truth for session.
    // This avoids the lock race condition that happens when getSession()
    // and onAuthStateChange both try to refresh the token simultaneously.
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);

      if (nextSession?.user?.id) {
        // Retry profile load up to 3 times with delay
        let retries = 3;
        let loadedProfile = null;
        while (retries > 0 && !loadedProfile && isActive) {
          try {
            loadedProfile = await authService.ensureCurrentProfile(nextSession.user);
          } catch (error) {
            retries--;
            if (retries > 0) {
              await new Promise((r) => setTimeout(r, 1000));
            } else {
              console.error("Profile load failed after retries:", error);
            }
          }
        }

        if (isActive && loadedProfile) {
          setProfile(loadedProfile);
          try { localStorage.setItem("campusride-profile-cache", JSON.stringify(loadedProfile)); } catch {}
        }
      } else {
        setProfile(null);
      }

      if (isActive) {
        setLoading(false);
      }
    });

    // Fallback: if onAuthStateChange doesn't fire within 3s (e.g. no session),
    // stop loading to unblock the UI.
    const timeout = setTimeout(() => {
      if (isActive) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      isActive = false;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (!session?.user?.id || !isSupabaseConfigured) {
      return null;
    }

    try {
      const nextProfile = await authService.ensureCurrentProfile(session.user);
      setProfile(nextProfile);
      try { localStorage.setItem("campusride-profile-cache", JSON.stringify(nextProfile)); } catch {}
      return nextProfile;
    } catch (error) {
      // Suppress lock race condition errors - profile will sync via onAuthStateChange
      if (error?.message?.includes("lock") || error?.message?.includes("Lock")) {
        console.warn("Auth lock race (harmless):", error.message);
        return profile; // Return current profile, don't clear it
      }
      throw error;
    }
  }

  async function signIn(credentials) {
    const data = await authService.signIn(credentials);
    setSession(data.session);

    if (data.session?.user?.id) {
      const nextProfile = await authService.ensureCurrentProfile(data.session.user);
      setProfile(nextProfile);
      return { ...data, profile: nextProfile };
    }

    return { ...data, profile: null };
  }

  async function signInWithGoogle() {
    return authService.signInWithGoogle();
  }

  async function signUp(payload) {
    const data = await authService.signUp(payload);

    if (data.session?.user?.id) {
      setSession(data.session);
      const nextProfile = await authService.ensureCurrentProfile(data.session.user, payload);
      setProfile(nextProfile);
      return { ...data, profile: nextProfile };
    }

    return { ...data, profile: null };
  }

  async function signOut() {
    // Clear local state immediately so UI responds right away
    setSession(null);
    setProfile(null);
    // Force clear all auth-related localStorage
    try {
      localStorage.removeItem("campusride-profile-cache");
      localStorage.removeItem("campusride-auth");
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await authService.signOut();
      } catch (error) {
        console.error("Supabase sign out failed:", error);
      }
    }

    return { error: null };
  }

  const value = {
    currentUser: profile ? buildCurrentUser(profile) : null,
    isConfigured: isSupabaseConfigured,
    loading,
    profile,
    refreshProfile,
    session,
    signIn,
    signInWithGoogle,
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
