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

async function compressImage(file, maxWidth = 1280, quality = 0.82) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  try {
    const imageBitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / imageBitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(imageBitmap.width * scale);
    canvas.height = Math.round(imageBitmap.height * scale);

    const context = canvas.getContext("2d");
    context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    imageBitmap.close?.();

    if (!blob) {
      return file;
    }

    return new File([blob], `${sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "image"}.webp`, {
      type: "image/webp",
    });
  } catch {
    // If compression fails, use original file
    return file;
  }
}

async function updateProfile(userId, payload) {
  const client = requireSupabase();

  const updatePromise = client
    .from("profiles")
    .upsert({ ...payload, id: userId }, { onConflict: "id" })
    .select("*")
    .single();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Sauvegarde trop longue. Verifie ta connexion et reessaie.")), 15000),
  );

  const { data, error } = await Promise.race([updatePromise, timeoutPromise]);

  if (error) {
    throw formatSupabaseError(error, "Impossible de mettre a jour le profil.");
  }

  return data;
}

function getStoragePathFromPublicUrl(publicUrl = "", bucketName) {
  const marker = `/storage/v1/object/public/${bucketName}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

async function deleteProfileAsset(publicUrl, bucketName) {
  const filePath = getStoragePathFromPublicUrl(publicUrl, bucketName);

  if (!filePath) {
    return;
  }

  const client = requireSupabase();
  await client.storage.from(bucketName).remove([filePath]);
}

async function uploadProfileAsset(file, userId, bucketName, fallbackName) {
  const client = requireSupabase();
  const compressedFile = await compressImage(
    file,
    bucketName === "avatars" ? 720 : 1440,
    bucketName === "avatars" ? 0.84 : 0.78,
  );
  const fileExtension = compressedFile.name.includes(".")
    ? compressedFile.name.split(".").pop()
    : "webp";
  const safeName = sanitizeFileName(compressedFile.name.replace(/\.[^.]+$/, ""));
  const filePath = `${userId}/${safeName || fallbackName}-${Date.now()}.${fileExtension}`;

  const uploadPromise = client.storage
    .from(bucketName)
    .upload(filePath, compressedFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: compressedFile.type,
    });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Upload trop long. Verifie ta connexion et reessaie.")), 30000),
  );

  const { error } = await Promise.race([uploadPromise, timeoutPromise]);

  if (error) {
    throw formatSupabaseError(
      error,
      `Upload photo impossible. Verifie le bucket ${bucketName} dans Supabase.`,
    );
  }

  const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

async function uploadProfilePhoto(file, userId) {
  return uploadProfileAsset(file, userId, "avatars", "avatar");
}

async function uploadVehiclePhoto(file, userId) {
  return uploadProfileAsset(file, userId, "vehicles", "vehicle");
}

export const profileService = {
  deleteProfileAsset,
  updateProfile,
  uploadProfilePhoto,
  uploadVehiclePhoto,
};
