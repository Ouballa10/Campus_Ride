import { requireSupabase } from "./supabaseClient";

function formatSupabaseError(error, fallbackMessage) {
  return new Error(error?.message || fallbackMessage);
}

async function getCurrentProfile(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError(error, "Impossible de charger le profil.");
  }

  return data;
}

async function signIn({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw formatSupabaseError(error, "Connexion impossible.");
  }

  return data;
}

async function signUp({ email, password, fullName, phone, role = "passager" }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/#/login` : undefined,
      data: {
        full_name: fullName,
        phone,
        role,
      },
    },
  });

  if (error) {
    throw formatSupabaseError(error, "Inscription impossible.");
  }

  return data;
}

async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw formatSupabaseError(error, "Deconnexion impossible.");
  }
}

async function getSession() {
  const client = requireSupabase();
  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error) {
    throw formatSupabaseError(error, "Session indisponible.");
  }

  return session;
}

function onAuthStateChange(callback) {
  const client = requireSupabase();
  return client.auth.onAuthStateChange(callback);
}

export const authService = {
  getCurrentProfile,
  getSession,
  onAuthStateChange,
  signIn,
  signOut,
  signUp,
};
