import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import ImageLightbox from "../components/ImageLightbox";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";
import "./EditProfile.css";

const maxImageSize = 5 * 1024 * 1024;
const maxVehiclePhotos = 6;

function getRoleFromMode(mode = "passenger") {
  return mode === "driver" ? "conducteur" : "passager";
}

function normalizeVehiclePhotos(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim());
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsedValue = JSON.parse(value);

      if (Array.isArray(parsedValue)) {
        return normalizeVehiclePhotos(parsedValue);
      }
    } catch {
      return [value];
    }
  }

  return [];
}

function buildVehicleLabel(form) {
  const vehicleName = [form.vehicleMake, form.vehicleModel]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
  const vehicleDetails = [form.vehicleColor, form.vehiclePlate]
    .map((item) => item.trim())
    .filter(Boolean);

  return [vehicleName, ...vehicleDetails].filter(Boolean).join(" - ") ||
    form.vehicleLabel.trim();
}

function buildProfileForm(profile, fallbackUser, mode = "passenger") {
  const fallbackVehicle = fallbackUser?.vehicle || {};

  return {
    bio: profile?.bio || fallbackUser?.bio || "",
    campus: profile?.campus || fallbackUser?.campus || "",
    driverLicense: profile?.driver_license || fallbackVehicle.license || "",
    email: profile?.email || fallbackUser?.email || "",
    fullName: profile?.full_name || fallbackUser?.name || "",
    phone: profile?.phone || fallbackUser?.phone || "",
    photoProfil: profile?.photo_profil || fallbackUser?.photo || "",
    role: getRoleFromMode(mode) || profile?.role || fallbackUser?.roleValue || "passager",
    vehicleColor: profile?.vehicle_color || fallbackVehicle.color || "",
    vehicleLabel: profile?.vehicle_label || fallbackUser?.car || "",
    vehicleMake: profile?.vehicle_make || fallbackVehicle.make || "",
    vehicleModel: profile?.vehicle_model || fallbackVehicle.model || "",
    vehiclePhotos: normalizeVehiclePhotos(
      profile?.vehicle_photos || fallbackVehicle.photos,
    ),
    vehiclePlate: profile?.vehicle_plate || fallbackVehicle.plate || "",
    vehicleSeats: profile?.vehicle_seats
      ? String(profile.vehicle_seats)
      : fallbackVehicle.seats
        ? String(fallbackVehicle.seats)
        : "",
  };
}

function validateImageFile(file, label) {
  if (!file.type.startsWith("image/")) {
    return `Choisis une image JPG, PNG ou WebP pour ${label}.`;
  }

  if (file.size > maxImageSize) {
    return `La photo ${label} ne doit pas depasser 5 Mo.`;
  }

  return "";
}

export default function EditProfile({ mode = "passenger", navigate, user }) {
  const fileInputRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const vehiclePreviewUrlsRef = useRef([]);
  const {
    isConfigured,
    profile,
    refreshProfile,
    session,
  } = useAuth();

  const [form, setForm] = useState(() => buildProfileForm(profile, user, mode));
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [selectedVehiclePhotos, setSelectedVehiclePhotos] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState("");

  const isSavingRef = useRef(false);
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!isSavingRef.current && !isEditingRef.current) {
      setForm(buildProfileForm(profile, user, mode));
    }
  }, [mode, profile, user]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    return () => {
      vehiclePreviewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      vehiclePreviewUrlsRef.current = [];
    };
  }, []);

  const avatarSource = photoPreview || form.photoProfil || user?.photo || "";
  const isDriverMode = mode === "driver";
  const vehiclePhotos = [
    ...form.vehiclePhotos.map((url) => ({ src: url, persisted: true })),
    ...selectedVehiclePhotos.map((item) => ({
      src: item.preview,
      persisted: false,
    })),
  ];

  function updateField(event) {
    const { name, value } = event.target;
    isEditingRef.current = true;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (feedback.message) {
      setFeedback({ message: "", tone: "" });
    }
  }

  function handlePickPhoto() {
    fileInputRef.current?.click();
  }

  function removeProfilePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(null);
    setPhotoPreview("");
    setForm((currentForm) => ({
      ...currentForm,
      photoProfil: "",
    }));
  }

  function handlePickVehiclePhotos() {
    vehicleInputRef.current?.click();
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationMessage = validateImageFile(file, "la photo de profil");

    if (validationMessage) {
      setFeedback({ message: validationMessage, tone: "error" });
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFeedback({ message: "", tone: "" });
  }

  function handleVehiclePhotosChange(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const validationMessage = files
      .map((file) => validateImageFile(file, "le vehicule"))
      .find(Boolean);

    if (validationMessage) {
      setFeedback({ message: validationMessage, tone: "error" });
      return;
    }

    const availableSlots = Math.max(
      maxVehiclePhotos - form.vehiclePhotos.length - selectedVehiclePhotos.length,
      0,
    );

    if (!availableSlots) {
      setFeedback({
        message: `Tu peux garder jusqu'a ${maxVehiclePhotos} photos vehicule.`,
        tone: "error",
      });
      return;
    }

    const acceptedFiles = files.slice(0, availableSlots).map((file) => {
      const preview = URL.createObjectURL(file);
      vehiclePreviewUrlsRef.current.push(preview);
      return { file, preview };
    });

    setSelectedVehiclePhotos((currentPhotos) => [
      ...currentPhotos,
      ...acceptedFiles,
    ]);

    setFeedback(
      files.length > availableSlots
        ? {
            message: `J'ai garde les ${availableSlots} premieres photos pour rester propre.`,
            tone: "success",
          }
        : { message: "", tone: "" },
    );

    event.target.value = "";
  }

  function removePersistedVehiclePhoto(indexToRemove) {
    setForm((currentForm) => ({
      ...currentForm,
      vehiclePhotos: currentForm.vehiclePhotos.filter(
        (_photo, index) => index !== indexToRemove,
      ),
    }));
  }

  function removeSelectedVehiclePhoto(indexToRemove) {
    setSelectedVehiclePhotos((currentPhotos) => {
      const photoToRemove = currentPhotos[indexToRemove];

      if (photoToRemove?.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
        vehiclePreviewUrlsRef.current = vehiclePreviewUrlsRef.current.filter(
          (previewUrl) => previewUrl !== photoToRemove.preview,
        );
      }

      return currentPhotos.filter((_photo, index) => index !== indexToRemove);
    });
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!isConfigured || !session?.user?.id) {
      setFeedback({
        message: "Connecte Supabase correctement pour enregistrer les modifications.",
        tone: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      isSavingRef.current = true;
      setUploadStep("Preparation des images...");
      setFeedback({ message: "", tone: "" });

      let photoProfil = form.photoProfil;

      if (selectedPhoto) {
        setUploadStep("Compression et upload de l'avatar...");
        if (profile?.photo_profil) {
          await profileService.deleteProfileAsset(profile.photo_profil, "avatars");
        }
        photoProfil = await profileService.uploadProfilePhoto(
          selectedPhoto,
          session.user.id,
        );
      } else if (!form.photoProfil && profile?.photo_profil) {
        setUploadStep("Suppression de l'ancien avatar...");
        await profileService.deleteProfileAsset(profile.photo_profil, "avatars");
      }

      setUploadStep("Upload des photos vehicule...");
      const uploadedVehiclePhotos = [];
      for (let i = 0; i < selectedVehiclePhotos.length; i++) {
        setUploadStep(`Upload photo vehicule ${i + 1}/${selectedVehiclePhotos.length}...`);
        const url = await profileService.uploadVehiclePhoto(
          selectedVehiclePhotos[i].file,
          session.user.id,
        );
        uploadedVehiclePhotos.push(url);
      }
      const nextVehiclePhotos = [
        ...form.vehiclePhotos,
        ...uploadedVehiclePhotos,
      ].slice(0, maxVehiclePhotos);
      const nextVehicleLabel = buildVehicleLabel({
        ...form,
        vehiclePhotos: nextVehiclePhotos,
      });

      await profileService.updateProfile(session.user.id, {
        bio: form.bio.trim() || null,
        campus: form.campus.trim() || null,
        driver_license: form.driverLicense.trim() || null,
        email: form.email || profile?.email || session.user.email || null,
        full_name: form.fullName.trim() || "CampusRide",
        phone: form.phone.trim(),
        photo_profil: photoProfil || null,
        role: getRoleFromMode(mode),
        updated_at: new Date().toISOString(),
        vehicle_color: form.vehicleColor.trim() || null,
        vehicle_label: nextVehicleLabel || null,
        vehicle_make: form.vehicleMake.trim() || null,
        vehicle_model: form.vehicleModel.trim() || null,
        vehicle_photos: nextVehiclePhotos,
        vehicle_plate: form.vehiclePlate.trim() || null,
        vehicle_seats: form.vehicleSeats ? Number(form.vehicleSeats) : null,
      });

      setUploadStep("Synchronisation du profil...");
      try {
        await refreshProfile();
      } catch (syncError) {
        console.warn("Profile sync after save:", syncError.message);
      }

      selectedVehiclePhotos.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
      vehiclePreviewUrlsRef.current = [];
      setSelectedPhoto(null);
      setSelectedVehiclePhotos([]);
      setPhotoPreview("");
      setForm((currentForm) => ({
        ...currentForm,
        photoProfil,
        vehicleLabel: nextVehicleLabel,
        vehiclePhotos: nextVehiclePhotos,
      }));
      setFeedback({
        message: "Profil mis a jour avec succes.",
        tone: "success",
      });

      // Navigate back to profile after successful save
      setTimeout(() => navigate("profile"), 1200);
    } catch (error) {
      setFeedback({
        message: error.message || "Mise a jour impossible pour le moment.",
        tone: "error",
      });
    } finally {
      isSavingRef.current = false;
      isEditingRef.current = false;
      setIsSaving(false);
      setUploadStep("");
    }
  }

  return (
    <div className="screen screen--profile page-enter">
      <AppHeader
        title="Modifier le profil"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("profile")}
      />

      <div className="screen-panel">
        <form className="profile-editor-card" onSubmit={handleSave}>
          {/* Avatar section */}
          <div className="profile-editor-avatar">
            <div className="profile-photo-frame" onClick={() => avatarSource && setLightboxSrc(avatarSource)} style={avatarSource ? { cursor: "zoom-in" } : {}}>
              {avatarSource ? (
                <img alt={form.fullName || "Avatar"} className="profile-photo-frame__image" src={avatarSource} />
              ) : (
                <span className="profile-photo-frame__fallback">{user?.initials || "CR"}</span>
              )}
            </div>
            <div className="profile-editor-avatar__actions">
              <button className="pf-btn pf-btn--small" type="button" onClick={handlePickPhoto}>
                <Icon name="camera" size={14} /> Changer la photo
              </button>
            </div>
            <input accept="image/*" className="profile-photo-input" ref={fileInputRef} type="file" onChange={handlePhotoChange} />
          </div>

          {/* Full Name */}
          <label className="profile-editor-field">
            <span className="profile-editor-field__label">Nom complet</span>
            <input
              className="profile-editor-field__control"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={updateField}
              placeholder="Ton nom complet"
            />
          </label>

          {/* Email (disabled) */}
          <label className="profile-editor-field">
            <span className="profile-editor-field__label">Email</span>
            <input
              className="profile-editor-field__control"
              name="email"
              type="email"
              value={form.email}
              disabled
              readOnly
            />
          </label>

          {/* Phone */}
          <label className="profile-editor-field">
            <span className="profile-editor-field__label">Téléphone</span>
            <input
              className="profile-editor-field__control"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              placeholder="06 12 34 56 78"
            />
          </label>

          {/* Campus */}
          <label className="profile-editor-field">
            <span className="profile-editor-field__label">Campus</span>
            <input
              className="profile-editor-field__control"
              name="campus"
              type="text"
              value={form.campus}
              onChange={updateField}
              placeholder="Ton campus"
            />
          </label>

          {/* Role (disabled) */}
          <label className="profile-editor-field">
            <span className="profile-editor-field__label">Rôle</span>
            <input
              className="profile-editor-field__control"
              name="role"
              type="text"
              value={form.role}
              disabled
              readOnly
            />
          </label>

          {/* Bio */}
          <label className="profile-editor-field">
            <span className="profile-editor-field__label">Bio</span>
            <textarea
              className="profile-editor-field__control profile-editor-field__control--textarea"
              name="bio"
              value={form.bio}
              onChange={updateField}
              placeholder="Quelques mots sur toi..."
              rows={3}
            />
          </label>

          {/* Vehicle fields (driver mode only) */}
          {isDriverMode && (
            <>
              <div className="profile-editor-section-title">
                <Icon name="car" size={16} /> Véhicule
              </div>

              <div className="profile-editor-row">
                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Marque</span>
                  <input
                    className="profile-editor-field__control"
                    name="vehicleMake"
                    type="text"
                    value={form.vehicleMake}
                    onChange={updateField}
                    placeholder="Ex: Renault"
                  />
                </label>

                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Modèle</span>
                  <input
                    className="profile-editor-field__control"
                    name="vehicleModel"
                    type="text"
                    value={form.vehicleModel}
                    onChange={updateField}
                    placeholder="Ex: Clio"
                  />
                </label>
              </div>

              <div className="profile-editor-row">
                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Couleur</span>
                  <input
                    className="profile-editor-field__control"
                    name="vehicleColor"
                    type="text"
                    value={form.vehicleColor}
                    onChange={updateField}
                    placeholder="Ex: Bleu"
                  />
                </label>

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Plaque</span>
                <input
                  className="profile-editor-field__control"
                  name="vehiclePlate"
                  type="text"
                  value={form.vehiclePlate}
                  onChange={updateField}
                  placeholder="Ex: AB-123-CD"
                />
              </label>
              </div>

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Places disponibles</span>
                <input
                  className="profile-editor-field__control"
                  name="vehicleSeats"
                  type="number"
                  min="1"
                  max="8"
                  value={form.vehicleSeats}
                  onChange={updateField}
                  placeholder="4"
                />
              </label>

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Permis de conduire</span>
                <input
                  className="profile-editor-field__control"
                  name="driverLicense"
                  type="text"
                  value={form.driverLicense}
                  onChange={updateField}
                  placeholder="Numéro de permis"
                />
              </label>

              {/* Vehicle photos */}
              <div className="profile-editor-field">
                <span className="profile-editor-field__label">
                  Photos du véhicule ({vehiclePhotos.length}/{maxVehiclePhotos})
                </span>
                <div className="profile-editor-vehicle-photos">
                  {vehiclePhotos.map((photo, index) => (
                    <div className="profile-editor-vehicle-photo" key={index}>
                      <img
                        src={photo.src}
                        alt={`Véhicule ${index + 1}`}
                        className="profile-editor-vehicle-photo__img"
                        onClick={() => setLightboxSrc(photo.src)}
                      />
                      <button
                        className="profile-editor-vehicle-photo__remove"
                        type="button"
                        onClick={() =>
                          photo.persisted
                            ? removePersistedVehiclePhoto(index)
                            : removeSelectedVehiclePhoto(index - form.vehiclePhotos.length)
                        }
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  ))}
                  {vehiclePhotos.length < maxVehiclePhotos && (
                    <button
                      className="profile-editor-vehicle-photo profile-editor-vehicle-photo--add"
                      type="button"
                      onClick={handlePickVehiclePhotos}
                    >
                      <Icon name="camera" size={20} />
                      <span>Ajouter</span>
                    </button>
                  )}
                </div>
                <input
                  accept="image/*"
                  className="profile-photo-input"
                  multiple
                  ref={vehicleInputRef}
                  type="file"
                  onChange={handleVehiclePhotosChange}
                />
              </div>
            </>
          )}

          {/* Feedback */}
          {feedback.message && (
            <div className={`profile-editor-feedback profile-editor-feedback--${feedback.tone}`}>
              {feedback.message}
            </div>
          )}

          {/* Upload step indicator */}
          {uploadStep && (
            <div className="profile-editor-upload-step">
              <div className="refresh-indicator__spinner" style={{ width: 16, height: 16 }} />
              <span>{uploadStep}</span>
            </div>
          )}

          {/* Save button */}
          <button
            className="profile-editor-save"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt="Photo agrandie"
          onClose={() => setLightboxSrc("")}
        />
      )}
    </div>
  );
}
