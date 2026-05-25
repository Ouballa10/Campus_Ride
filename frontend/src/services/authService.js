import { requireSupabase } from "./supabaseClient";

function formatSupabaseError(error, fallbackMessage) {
  const rawMessage = `${error?.message || ""}`.toLowerCase();

  if (rawMessage.includes("invalid login credentials")) {
    return new Error("Email ou mot de passe incorrect.");
  }

  if (rawMessage.includes("email not confirmed")) {
    return new Error("Ton email n'est pas encore confirme. Verifie ta boite mail.");
  }

  if (rawMessage.includes("user already registered") || rawMessage.includes("already registered")) {
    return new Error("Un compte existe deja avec cet email. Connecte-toi directement.");
  }

  if (rawMessage.includes("password")) {
    return new Error("Mot de passe invalide. Utilise au moins 6 caracteres.");
  }

  if (rawMessage.includes("provider is not enabled")) {
    return new Error("Google Auth n'est pas active dans Supabase.");
  }

  if (rawMessage.includes("redirect")) {
    return new Error("URL de redirection Google non autorisee dans Supabase.");
  }

  return new Error(error?.message || fallbackMessage);
}

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function buildProfilePayload(user, metadata = {}) {
  return {
    email: normalizeEmail(user?.email || metadata.email || ""),
    full_name:
      metadata.fullName ||
      metadata.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "CampusRide",
    phone: metadata.phone || user?.user_metadata?.phone || null,
    photo_profil: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
    role:
      metadata.role === "conducteur" || user?.user_metadata?.role === "conducteur"
        ? "conducteur"
        : "passager",
    updated_at: new Date().toISOString(),
  };
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

async function ensureCurrentProfile(user, metadata = {}) {
  if (!user?.id) {
    return null;
  }

  const existingProfile = await getCurrentProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .upsert(
      {
        id: user.id,
        ...buildProfilePayload(user, metadata),
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error) {
    throw formatSupabaseError(
      error,
      "Profil introuvable. Lance le script Supabase schema pour activer la creation de profil.",
    );
  }

  return data;
}

async function signIn({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    throw formatSupabaseError(error, "Connexion impossible.");
  }

  return data;
}

async function signInWithGoogle() {
  const client = requireSupabase();
  // Use just the origin + pathname as redirect (hash fragments may be stripped by OAuth providers)
  const redirectTo = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}`
    : undefined;

  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw formatSupabaseError(error, "Connexion Google impossible.");
  }

  return data;
}

async function signUp({ email, password, fullName, phone, role = "passager" }) {
  const client = requireSupabase();
  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await client.auth.signUp({
    email: normalizedEmail,
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

  if (data.user?.id && data.session) {
    await ensureCurrentProfile(data.user, {
      email: normalizedEmail,
      fullName,
      phone,
      role,
    });
  }

  return data;
}

async function signOut() {
  const client = requireSupabase();

  const signOutWithTimeout = Promise.race([
    client.auth.signOut({ scope: "global" }),
    new Promise((resolve) => setTimeout(() => resolve({ error: { message: "timeout" } }), 5000)),
  ]);

  const { error } = await signOutWithTimeout;

  if (error) {
    const fallback = await Promise.race([
      client.auth.signOut({ scope: "local" }),
      new Promise((resolve) => setTimeout(() => resolve({ error: null }), 3000)),
    ]);

    if (fallback.error) {
      throw formatSupabaseError(fallback.error, "Deconnexion impossible.");
    }
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
  ensureCurrentProfile,
  getCurrentProfile,
  getSession,
  onAuthStateChange,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
};
