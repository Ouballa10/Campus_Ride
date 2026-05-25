import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { isSupabaseConfigured, supabase } from "../services/supabaseClient";
import { buildCurrentUser } from "../utils/appDataMappers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("campusride-profile-cache");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let isActive = true;

    // 1. Get initial session (Supabase will auto-detect ?code= in URL via detectSessionInUrl)
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isActive) return;
      setSession(initialSession);
      if (initialSession?.user?.id) {
        loadProfile(initialSession.user);
      } else {
        setLoading(false);
      }

      // Clean up OAuth ?code= from URL AFTER session is resolved
      if (typeof window !== "undefined" && window.location.search.includes("code=")) {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, "", cleanUrl);
      }
    }).catch(() => {
      if (isActive) setLoading(false);
      // Clean up URL even on error
      if (typeof window !== "undefined" && window.location.search.includes("code=")) {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, "", cleanUrl);
      }
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isActive) return;

      setSession(nextSession);

      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoading(false);
        try { localStorage.removeItem("campusride-profile-cache"); } catch {}
        return;
      }

      // Clean up OAuth code from URL after successful sign in
      if (event === "SIGNED_IN" && typeof window !== "undefined" && window.location.search.includes("code=")) {
        const cleanUrl = window.location.origin + window.location.pathname + (window.location.hash || "#/home");
        window.history.replaceState({}, "", cleanUrl);
      }

      if (nextSession?.user?.id) {
        loadProfile(nextSession.user);
      } else {
        setLoading(false);
      }
    });

    async function loadProfile(user) {
      try {
        const p = await authService.ensureCurrentProfile(user);
        if (isActive && p) {
          setProfile(p);
          try { localStorage.setItem("campusride-profile-cache", JSON.stringify(p)); } catch {}
        }
      } catch (err) {
        console.warn("Profile load error:", err.message);
        // If we have cached profile, use it
      }
      if (isActive) setLoading(false);
    }

    // Fallback timeout — never stay loading more than 8s
    const timeout = setTimeout(() => {
      if (isActive) setLoading(false);
    }, 8000);

    return () => {
      isActive = false;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (!session?.user?.id || !isSupabaseConfigured) return null;
    try {
      const p = await authService.ensureCurrentProfile(session.user);
      if (p) {
        setProfile(p);
        try { localStorage.setItem("campusride-profile-cache", JSON.stringify(p)); } catch {}
      }
      return p;
    } catch (err) {
      console.warn("refreshProfile error:", err.message);
      return profile;
    }
  }

  async function signIn(credentials) {
    const data = await authService.signIn(credentials);
    setSession(data.session);
    if (data.session?.user?.id) {
      const p = await authService.ensureCurrentProfile(data.session.user);
      setProfile(p);
      if (p) try { localStorage.setItem("campusride-profile-cache", JSON.stringify(p)); } catch {}
      return { ...data, profile: p };
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
      const p = await authService.ensureCurrentProfile(data.session.user, payload);
      setProfile(p);
      if (p) try { localStorage.setItem("campusride-profile-cache", JSON.stringify(p)); } catch {}
      return { ...data, profile: p };
    }
    return { ...data, profile: null };
  }

  async function signOut() {
    setSession(null);
    setProfile(null);
    try {
      localStorage.removeItem("campusride-profile-cache");
      localStorage.removeItem("campusride-auth");
    } catch {}
    if (isSupabaseConfigured) {
      try { await authService.signOut(); } catch {}
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
