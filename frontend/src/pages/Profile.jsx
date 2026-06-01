import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import ImageLightbox from "../components/ImageLightbox";
import { Icon, Stars } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";

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

export default function Profile({
  mode = "passenger",
  navigate,
  onModeChange,
  onThemeChange,
  user,
  theme = "light",
  profileLinks = [],
}) {
  const fileInputRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const vehiclePreviewUrlsRef = useRef([]);
  const {
    isConfigured,
    loading: authLoading,
    profile,
    refreshProfile,
    session,
    signOut,
  } = useAuth();
  const [form, setForm] = useState(() => buildProfileForm(profile, user, mode));
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [selectedVehiclePhotos, setSelectedVehiclePhotos] = useState([]);
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState("");

  const displayUser = user || {
    bio: "",
    campus: "",
    car: "Vehicule a renseigner",
    email: "",
    initials: "CR",
    name: "CampusRide",
    phone: "",
    photo: "",
    rating: 0,
    reservationsCount: 0,
    reviewCount: 0,
    role: "Etudiant passager",
    roleValue: "passager",
    tripsCount: 0,
    vehicle: {
      color: "",
      license: "",
      make: "",
      model: "",
      photos: [],
      plate: "",
      seats: "",
    },
  };

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

  const avatarSource = photoPreview || form.photoProfil || displayUser.photo || "";
  const isDriverMode = mode === "driver";
  const roleLabel = isDriverMode ? "Conducteur campus" : "Passager campus";
  const vehicleLabel = buildVehicleLabel(form);
  const vehiclePhotos = [
    ...form.vehiclePhotos.map((url) => ({ src: url, persisted: true })),
    ...selectedVehiclePhotos.map((item) => ({
      src: item.preview,
      persisted: false,
    })),
  ];
  const primaryVehiclePhoto = vehiclePhotos[0]?.src || "";
  const profileRoleDiffers =
    Boolean(profile?.role) && profile.role !== getRoleFromMode(mode);
  const visibleProfileLinks = profileLinks.filter((link) =>
    isDriverMode
      ? ["trips", "publish", "notifications"].includes(link.id)
      : ["reservations", "search", "notifications"].includes(link.id),
  );
  const formDirty =
    JSON.stringify(form) !== JSON.stringify(buildProfileForm(profile, user, mode)) ||
    Boolean(selectedPhoto) ||
    selectedVehiclePhotos.length > 0 ||
    profileRoleDiffers;

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

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
    navigate("login");
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
        // Profile saved successfully but sync failed (lock race) - not critical
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

  // Show loading only briefly if profile hasn't loaded yet (max 3s then show anyway)
  if (authLoading && isConfigured && session?.user?.id && !profile) {
    return (
      <div className="screen screen--simple" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>⏳</div>
          <span style={{ fontSize: "0.85rem" }}>Chargement du profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--profile page-enter">
      <AppHeader
        title={isDriverMode ? "Profil conducteur" : "Mon profil"}
        subtitle={isDriverMode ? "Garage & coordonnées" : "Compte & préférences"}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <div className="screen-panel">
        {/* ===== AVATAR + NAME ===== */}
        <div className="pf-identity">
          <div className="profile-photo-block">
            <div className="profile-photo-frame" onClick={() => avatarSource && setLightboxSrc(avatarSource)} style={avatarSource ? { cursor: "zoom-in" } : {}}>
              {avatarSource ? (
                <img alt={form.fullName || displayUser.name} className="profile-photo-frame__image" src={avatarSource} />
              ) : (
                <span className="profile-photo-frame__fallback">{displayUser.initials}</span>
              )}
            </div>
            <button className="profile-photo-action" type="button" onClick={handlePickPhoto}>
              <Icon name="camera" size={14} />
            </button>
            <input accept="image/*" className="profile-photo-input" ref={fileInputRef} type="file" onChange={handlePhotoChange} />
          </div>
          <h2 className="pf-identity__name">{form.fullName || displayUser.name}</h2>
          <p className="pf-identity__role">{roleLabel}</p>
          <span className="pf-identity__verified"><Icon name="check-badge" size={14} /> Compte vérifié</span>
          <Stars value={displayUser.rating} />
          <div className="pf-identity__buttons">
            <button className="pf-btn pf-btn--primary" type="button" onClick={() => document.querySelector('.profile-editor-field input')?.focus()}>
              <Icon name="edit" size={14} />
              Modifier
            </button>
            <button className="pf-btn pf-btn--outline" type="button" onClick={() => onModeChange(isDriverMode ? "passenger" : "driver")}>
              <Icon name={isDriverMode ? "user" : "car"} size={14} />
              {isDriverMode ? "Mode passager" : "Mode driver"}
            </button>
          </div>

          {/* Mini info under profile */}
          <div className="pf-identity__contact">
            <span><Icon name="mail" size={13} /> {form.email || "—"}</span>
            <span><Icon name="phone" size={13} /> {form.phone || "—"}</span>
            <span><Icon name="location" size={13} /> {form.campus || "—"}</span>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="pf-stats">
          <div className="pf-stat">
            <div className="pf-stat__icon pf-stat__icon--blue"><Icon name="route" size={18} /></div>
            <strong>{displayUser.tripsCount}</strong>
            <span>Trajets</span>
          </div>
          <div className="pf-stat">
            <div className="pf-stat__icon pf-stat__icon--cyan"><Icon name="bookmark" size={18} /></div>
            <strong>{displayUser.reservationsCount}</strong>
            <span>Réservations</span>
          </div>
          <div className="pf-stat">
            <div className="pf-stat__icon pf-stat__icon--amber"><Icon name="star" size={18} /></div>
            <strong>{displayUser.reviewCount}</strong>
            <span>Avis</span>
          </div>
        </div>

        {/* ===== COMPLETION ===== */}
        <div className="pf-progress">
          <div className="pf-progress__circle">
            <svg viewBox="0 0 36 36" className="pf-progress__svg">
              <path
                className="pf-progress__circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="pf-progress__circle-fill"
                strokeDasharray={`${Math.round(((form.fullName ? 1 : 0) + (form.email ? 1 : 0) + (form.phone ? 1 : 0) + (form.campus ? 1 : 0) + (avatarSource ? 1 : 0)) / 5 * 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="pf-progress__circle-text">{Math.round(((form.fullName ? 1 : 0) + (form.email ? 1 : 0) + (form.phone ? 1 : 0) + (form.campus ? 1 : 0) + (avatarSource ? 1 : 0)) / 5 * 100)}%</span>
          </div>
          <div className="pf-progress__content">
            <strong className="pf-progress__title">Complétude du profil</strong>
            <p className="pf-progress__hint">Plus votre profil est complet, plus vous êtes en sécurité.</p>
            <div className="pf-progress__bar">
              <div className="pf-progress__fill" style={{ width: `${Math.round(((form.fullName ? 1 : 0) + (form.email ? 1 : 0) + (form.phone ? 1 : 0) + (form.campus ? 1 : 0) + (avatarSource ? 1 : 0)) / 5 * 100)}%` }} />
            </div>
            <span className="pf-progress__percent">{Math.round(((form.fullName ? 1 : 0) + (form.email ? 1 : 0) + (form.phone ? 1 : 0) + (form.campus ? 1 : 0) + (avatarSource ? 1 : 0)) / 5 * 100)}%</span>
          </div>
          <button className="pf-progress__btn" type="button" onClick={() => navigate("edit-profile")}>
            Compléter ›
          </button>
        </div>

        {/* ===== SETTINGS LINKS ===== */}
        <div className="pf-settings">
          <h4 className="pf-settings__title">
            <span className="pf-settings__bar" />
            Paramètres
          </h4>

          <div className="pf-settings__list">
            <button className="pf-settings__item" type="button" onClick={() => navigate("edit-profile")}>
              <div className="pf-settings__item-icon pf-settings__item-icon--blue">
                <Icon name="edit" size={18} />
              </div>
              <div className="pf-settings__item-text">
                <strong>Modifier mes informations</strong>
                <span>Nom, téléphone, campus, bio...</span>
              </div>
              <Icon name="chevron-right" size={16} />
            </button>

            {isDriverMode && (
              <button className="pf-settings__item" type="button" onClick={() => navigate("edit-profile")}>
                <div className="pf-settings__item-icon pf-settings__item-icon--cyan">
                  <Icon name="car" size={18} />
                </div>
                <div className="pf-settings__item-text">
                  <strong>Mon véhicule</strong>
                  <span>Marque, plaque, photos...</span>
                </div>
                <Icon name="chevron-right" size={16} />
              </button>
            )}

            {visibleProfileLinks.map((link) => (
              <button
                className="pf-settings__item"
                key={link.id}
                type="button"
                onClick={() => navigate(link.route)}
              >
                <div className="pf-settings__item-icon pf-settings__item-icon--light">
                  <Icon name={link.icon} size={18} />
                </div>
                <div className="pf-settings__item-text">
                  <strong>{link.label}</strong>
                  <span>{link.description || ""}</span>
                </div>
                <Icon name="chevron-right" size={16} />
              </button>
            ))}

            {isConfigured && (
              <button className="pf-settings__item pf-settings__item--danger" type="button" onClick={handleSignOut}>
                <div className="pf-settings__item-icon pf-settings__item-icon--red">
                  <Icon name="logout" size={18} />
                </div>
                <div className="pf-settings__item-text">
                  <strong>Se déconnecter</strong>
                  <span>Fermer la session</span>
                </div>
                <Icon name="chevron-right" size={16} />
              </button>
            )}
          </div>
        </div>
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
