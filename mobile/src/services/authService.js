import { requireSupabase } from './supabaseClient';

function formatError(error, fallback) {
  const msg = `${error?.message || ''}`.toLowerCase();
  if (msg.includes('invalid login credentials')) return new Error('Email ou mot de passe incorrect.');
  if (msg.includes('email not confirmed')) return new Error('Email non confirme. Verifie ta boite mail.');
  if (msg.includes('already registered')) return new Error('Un compte existe deja avec cet email.');
  if (msg.includes('password')) return new Error('Mot de passe invalide (min 6 caracteres).');
  return new Error(error?.message || fallback);
}

export async function signIn({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw formatError(error, 'Connexion impossible.');
  return data;
}

export async function signUp({ email, password, fullName, phone, role = 'passager' }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: fullName, phone, role },
    },
  });
  if (error) throw formatError(error, 'Inscription impossible.');

  if (data.user?.id && data.session) {
    await ensureProfile(data.user, { fullName, phone, role });
  }
  return data;
}

export async function signOut() {
  const client = requireSupabase();
  await client.auth.signOut();
}

export async function getSession() {
  const client = requireSupabase();
  const { data: { session } } = await client.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  const client = requireSupabase();
  return client.auth.onAuthStateChange(callback);
}

export async function getProfile(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw formatError(error, 'Profil introuvable.');
  return data;
}

export async function ensureProfile(user, meta = {}) {
  if (!user?.id) return null;
  const existing = await getProfile(user.id);
  if (existing) return existing;

  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: meta.fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
      phone: meta.phone || user.user_metadata?.phone || null,
      role: meta.role || 'passager',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw formatError(error, 'Creation profil impossible.');
  return data;
}
