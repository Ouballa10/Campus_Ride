import { requireSupabase } from "./supabaseClient";

async function submitEvaluation({ trajetId, conducteurId, passagerId, note, commentaire }) {
  const client = requireSupabase();

  // Insert evaluation
  const { data, error } = await client
    .from("evaluations")
    .insert({
      trajet_id: trajetId,
      conducteur_id: conducteurId,
      passager_id: passagerId,
      note,
      commentaire: commentaire || null,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Tu as deja evalue ce trajet.");
    }
    throw new Error(error.message || "Impossible d'envoyer l'evaluation.");
  }

  // Update driver average rating
  await updateDriverAverageRating(conducteurId);

  return data;
}

async function updateDriverAverageRating(conducteurId) {
  const client = requireSupabase();

  const { data: evaluations, error } = await client
    .from("evaluations")
    .select("note")
    .eq("conducteur_id", conducteurId);

  if (error || !evaluations?.length) return;

  const average = evaluations.reduce((sum, e) => sum + e.note, 0) / evaluations.length;

  await client
    .from("profiles")
    .update({ note_moyenne: Math.round(average * 10) / 10 })
    .eq("id", conducteurId);
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

async function hasAlreadyRated(trajetId, passagerId) {
  const client = requireSupabase();

  const { data, error } = await client
    .from("evaluations")
    .select("id")
    .eq("trajet_id", trajetId)
    .eq("passager_id", passagerId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}

export const evaluationService = {
  getEvaluationsForDriver,
  hasAlreadyRated,
  submitEvaluation,
  updateDriverAverageRating,
};
