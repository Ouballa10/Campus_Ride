import { requireSupabase } from "./supabaseClient";

async function submitEvaluation({ trajetId, conducteurId, utilisateurId, note, commentaire }) {
  const client = requireSupabase();

  // Insert evaluation (uses utilisateur_id as per existing schema)
  const { data, error } = await client
    .from("evaluations")
    .insert({
      trajet_id: trajetId,
      conducteur_id: conducteurId,
      utilisateur_id: utilisateurId,
      note,
      commentaire: commentaire || null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Tu as deja evalue ce trajet.");
    }
    throw new Error(error.message || "Impossible d'envoyer l'evaluation.");
  }

  // The trigger refresh_conducteur_rating handles updating note_moyenne automatically
  return data;
}

async function getEvaluationsForDriver(conducteurId) {
  const client = requireSupabase();

  const { data, error } = await client
    .from("evaluations")
    .select("*")
    .eq("conducteur_id", conducteurId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Impossible de charger les evaluations.");
  }

  return data || [];
}

async function hasAlreadyRated(trajetId, utilisateurId) {
  const client = requireSupabase();

  const { data, error } = await client
    .from("evaluations")
    .select("id")
    .eq("trajet_id", trajetId)
    .eq("utilisateur_id", utilisateurId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}

export const evaluationService = {
  getEvaluationsForDriver,
  hasAlreadyRated,
  submitEvaluation,
};
