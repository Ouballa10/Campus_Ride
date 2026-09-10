import { requireSupabase } from "./supabaseClient";

function fmt(error, msg) {
  return new Error(error?.message || msg);
}

/**
 * Passager publie une nouvelle demande de trajet.
 */
async function createDemande({ passagerId, depart, destination, departureAt, prixPropose, message }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("demandes")
    .insert({
      passager_id:  passagerId,
      depart,
      destination,
      departure_at: departureAt,
      prix_propose: prixPropose || 0,
      message:      message || null,
      statut:       "ouverte",
    })
    .select("*")
    .single();

  if (error) throw fmt(error, "Impossible de publier la demande.");
  return data;
}

/**
 * Liste toutes les demandes ouvertes (pour les conducteurs).
 * Exclut les demandes du user lui-même.
 */
async function listAvailableDemandes(excludeUserId = "") {
  const client = requireSupabase();

  let query = client
    .from("demandes")
    .select(`
      *,
      passager:profiles!demandes_passager_id_fkey (
        id, full_name, photo_profil, note_moyenne, campus
      )
    `)
    .eq("statut", "ouverte")
    .gt("departure_at", new Date().toISOString())
    .order("departure_at", { ascending: true });

  if (excludeUserId) {
    query = query.neq("passager_id", excludeUserId);
  }

  const { data, error } = await query;
  if (error) throw fmt(error, "Impossible de charger les demandes.");
  return (data || []).map(mapDemande);
}

/**
 * Liste les demandes du passager connecté.
 */
async function listMyDemandes(passagerId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("demandes")
    .select(`
      *,
      conducteur:profiles!demandes_conducteur_id_fkey (
        id, full_name, photo_profil, note_moyenne, phone
      )
    `)
    .eq("passager_id", passagerId)
    .order("created_at", { ascending: false });

  if (error) throw fmt(error, "Impossible de charger vos demandes.");
  return (data || []).map(mapDemande);
}

/**
 * Conducteur accepte une demande (via RPC atomique).
 */
async function acceptDemande(demandeId, conducteurId) {
  const client = requireSupabase();
  const { error } = await client.rpc("accept_demande", {
    p_demande_id:    demandeId,
    p_conducteur_id: conducteurId,
  });
  if (error) throw fmt(error, "Impossible d'accepter cette demande.");
}

/**
 * Passager annule sa demande.
 */
async function cancelDemande(demandeId, passagerId) {
  const client = requireSupabase();
  const { error } = await client
    .from("demandes")
    .update({ statut: "annulee", updated_at: new Date().toISOString() })
    .eq("id", demandeId)
    .eq("passager_id", passagerId);

  if (error) throw fmt(error, "Impossible d'annuler la demande.");
}

// ── Mapper ───────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

function mapDemande(row) {
  const passager = row.passager || {};
  const conducteur = row.conducteur || {};
  return {
    id:            row.id,
    passagerId:    row.passager_id,
    conducteurId:  row.conducteur_id || "",
    depart:        row.depart || "",
    destination:   row.destination || "",
    departureAt:   row.departure_at || "",
    prixPropose:   Number(row.prix_propose || 0),
    message:       row.message || "",
    statut:        row.statut || "ouverte",
    createdAt:     row.created_at || "",
    updatedAt:     row.updated_at || "",
    // passager info
    passagerName:   passager.full_name || "Passager",
    passagerAvatar: passager.photo_profil || "",
    passagerRating: Number(passager.note_moyenne || 0),
    passagerCampus: passager.campus || "",
    passagerInitials: (passager.full_name || "P").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    // conducteur info (si acceptée)
    conducteurName:   conducteur.full_name || "",
    conducteurAvatar: conducteur.photo_profil || "",
    conducteurPhone:  conducteur.phone || "",
    // helpers
    timeAgo: timeAgo(row.created_at),
  };
}

export const demandeService = {
  createDemande,
  listAvailableDemandes,
  listMyDemandes,
  acceptDemande,
  cancelDemande,
};
