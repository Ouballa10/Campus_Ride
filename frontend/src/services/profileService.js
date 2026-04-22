import { requireSupabase } from "./supabaseClient";

function formatSupabaseError(error, fallbackMessage) {
  return new Error(error?.message || fallbackMessage);
}

function sanitizeFileName(fileName = "avatar") {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function updateProfile(userId, payload) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw formatSupabaseError(error, "Impossible de mettre a jour le profil.");
  }

  return data;
}

async function uploadProfilePhoto(file, userId) {
  const client = requireSupabase();
  const fileExtension = file.name.includes(".")
    ? file.name.split(".").pop()
    : "jpg";
  const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  const filePath = `${userId}/${safeName || "avatar"}-${Date.now()}.${fileExtension}`;

  const { error } = await client.storage
    .from("profile-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw formatSupabaseError(
      error,
      "Upload photo impossible. Verifie le bucket profile-photos dans Supabase.",
    );
  }

  const { data } = client.storage.from("profile-photos").getPublicUrl(filePath);
  return data.publicUrl;
}

export const profileService = {
  updateProfile,
  uploadProfilePhoto,
};
