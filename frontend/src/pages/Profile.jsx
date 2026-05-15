import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import AppMenu from "../components/AppMenu";
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

  useEffect(() => {
    setForm(buildProfileForm(profile, user, mode));
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
      ? ["trips", "publish", "search", "notifications"].includes(link.id)
      : ["reservations", "search", "trips", "notifications"].includes(link.id),
  );
  const formDirty =
    JSON.stringify(form) !== JSON.stringify(buildProfileForm(profile, user, mode)) ||
    Boolean(selectedPhoto) ||
    selectedVehiclePhotos.length > 0 ||
    profileRoleDiffers;

  function updateField(event) {
    const { name, value } = event.target;
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
      const uploadedVehiclePhotos = selectedVehiclePhotos.length
        ? await Promise.all(
            selectedVehiclePhotos.map((item) =>
              profileService.uploadVehiclePhoto(item.file, session.user.id),
            ),
          )
        : [];
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
      await refreshProfile();

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
      setIsSaving(false);
      setUploadStep("");
    }
  }

  return (
    <div className="screen screen--profile">
      <AppHeader
        title="Mon profil"
        subtitle="Compte, vehicule et preferences"
        leftIcon="arrow-left"
        rightSlot={(
          <AppMenu
            mode={mode}
            navigate={navigate}
            user={displayUser}
            onModeChange={onModeChange}
            onThemeChange={onThemeChange}
            theme={theme}
          />
        )}
        onLeftClick={() => navigate("home")}
      />

      <div className="screen-panel">
        <section className="profile-editor-hero">
          <div className="profile-editor-hero__header">
            <div>
              <span className="eyebrow">Compte</span>
              <h2>{isDriverMode ? "Profil driver premium" : "Profil passager"}</h2>
            </div>
            <span className="profile-editor-badge">
              <Icon name={isDriverMode ? "car" : "user"} size={16} />
              {isDriverMode ? "Mode driver" : "Mode passager"}
            </span>
          </div>

          <div className="profile-editor-identity">
            <div className="profile-photo-block">
              <div className="profile-photo-frame">
                {avatarSource ? (
                  <img
                    alt={form.fullName || displayUser.name}
                    className="profile-photo-frame__image"
                    src={avatarSource}
                  />
                ) : (
                  <span className="profile-photo-frame__fallback">
                    {displayUser.initials}
                  </span>
                )}
              </div>

              <button
                className="profile-photo-action"
                type="button"
                onClick={handlePickPhoto}
              >
                <Icon name="camera" size={16} />
              </button>

              <input
                accept="image/*"
                className="profile-photo-input"
                ref={fileInputRef}
                type="file"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="profile-editor-identity__copy">
              <h3>{form.fullName || displayUser.name}</h3>
              <p>{roleLabel}</p>
              <Stars value={displayUser.rating} />
              {avatarSource ? (
                <button
                  className="text-link profile-photo-remove"
                  type="button"
                  onClick={removeProfilePhoto}
                >
                  Supprimer la photo
                </button>
              ) : null}
            </div>
          </div>

          {isDriverMode ? (
            <div className="profile-vehicle-mini">
              <div className="profile-vehicle-mini__photo">
                {primaryVehiclePhoto ? (
                  <img alt={vehicleLabel || "Vehicule"} src={primaryVehiclePhoto} />
                ) : (
                  <Icon name="car" size={24} />
                )}
              </div>
              <div>
                <span>Garage driver</span>
                <strong>{vehicleLabel || "Ajoute ton vehicule"}</strong>
                <p>
                  {form.vehicleSeats
                    ? `${form.vehicleSeats} places disponibles`
                    : "Places a renseigner"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="profile-editor-stats">
            <div>
              <strong>{displayUser.tripsCount}</strong>
              <span>trajets</span>
            </div>
            <div>
              <strong>{displayUser.reservationsCount}</strong>
              <span>reservations</span>
            </div>
            <div>
              <strong>{displayUser.reviewCount}</strong>
              <span>avis</span>
            </div>
          </div>

        </section>

        <form className="profile-editor-card" onSubmit={handleSave}>
          <div className="section-heading section-heading--compact">
            <div>
              <h3>
                {isDriverMode
                  ? "Informations conducteur"
                  : "Informations passager"}
              </h3>
              <p>
                {isDriverMode
                  ? "Complete ton garage et tes coordonnees pour rassurer les passagers."
                  : "Garde tes informations propres pour confirmer les trajets plus vite."}
              </p>
            </div>
          </div>

          <div className="profile-editor-grid">
            <label className="profile-editor-field profile-editor-field--wide">
              <span className="profile-editor-field__label">Nom complet</span>
              <div className="profile-editor-field__control">
                <Icon name="edit" size={18} />
                <input
                  name="fullName"
                  placeholder="Votre nom complet"
                  type="text"
                  value={form.fullName}
                  onChange={updateField}
                />
              </div>
            </label>

            <label className="profile-editor-field profile-editor-field--wide">
              <span className="profile-editor-field__label">Adresse email</span>
              <div className="profile-editor-field__control profile-editor-field__control--disabled">
                <Icon name="mail" size={18} />
                <input
                  disabled
                  name="email"
                  placeholder="Adresse email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                />
              </div>
              <small>L'email se gere via l'authentification Supabase.</small>
            </label>

            <label className="profile-editor-field">
              <span className="profile-editor-field__label">Telephone</span>
              <div className="profile-editor-field__control">
                <Icon name="phone" size={18} />
                <input
                  name="phone"
                  placeholder="+212 6 00 00 00 00"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                />
              </div>
            </label>

            <label className="profile-editor-field">
              <span className="profile-editor-field__label">Campus</span>
              <div className="profile-editor-field__control">
                <Icon name="location" size={18} />
                <input
                  name="campus"
                  placeholder="UPM, Gueliz..."
                  type="text"
                  value={form.campus}
                  onChange={updateField}
                />
              </div>
            </label>

            <label className="profile-editor-field">
              <span className="profile-editor-field__label">Mode actuel</span>
              <div className="profile-editor-field__control profile-editor-field__control--disabled">
                <Icon name={isDriverMode ? "car" : "user"} size={18} />
                <input
                  disabled
                  name="role"
                  type="text"
                  value={roleLabel}
                  onChange={updateField}
                />
              </div>
              <small>Change le mode depuis le menu hamburger.</small>
            </label>

            <label className="profile-editor-field profile-editor-field--wide">
              <span className="profile-editor-field__label">Bio courte</span>
              <div className="profile-editor-field__control profile-editor-field__control--textarea">
                <Icon name="edit" size={18} />
                <textarea
                  name="bio"
                  placeholder="Ex: Ponctuel, depart devant la bibliotheque, conduite calme..."
                  rows="3"
                  value={form.bio}
                  onChange={updateField}
                />
              </div>
            </label>

            {isDriverMode ? (
              <>
                <div className="profile-editor-subsection profile-editor-field--wide">
                  <span className="profile-editor-subsection__icon">
                    <Icon name="car" size={18} />
                  </span>
                  <div>
                    <strong>Garage driver</strong>
                    <p>Marque, plaque, places et photos visibles par les passagers.</p>
                  </div>
                </div>

                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Marque</span>
                  <div className="profile-editor-field__control">
                    <Icon name="car" size={18} />
                    <input
                      name="vehicleMake"
                      placeholder="Dacia, Toyota..."
                      type="text"
                      value={form.vehicleMake}
                      onChange={updateField}
                    />
                  </div>
                </label>

                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Modele</span>
                  <div className="profile-editor-field__control">
                    <Icon name="car" size={18} />
                    <input
                      name="vehicleModel"
                      placeholder="Logan, Yaris..."
                      type="text"
                      value={form.vehicleModel}
                      onChange={updateField}
                    />
                  </div>
                </label>

                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Couleur</span>
                  <div className="profile-editor-field__control">
                    <Icon name="edit" size={18} />
                    <input
                      name="vehicleColor"
                      placeholder="Blanc, noir..."
                      type="text"
                      value={form.vehicleColor}
                      onChange={updateField}
                    />
                  </div>
                </label>

                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Plaque</span>
                  <div className="profile-editor-field__control">
                    <Icon name="id-card" size={18} />
                    <input
                      name="vehiclePlate"
                      placeholder="12345-A-6"
                      type="text"
                      value={form.vehiclePlate}
                      onChange={updateField}
                    />
                  </div>
                </label>

                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Places</span>
                  <div className="profile-editor-field__control">
                    <Icon name="seat" size={18} />
                    <input
                      max="8"
                      min="1"
                      name="vehicleSeats"
                      placeholder="4"
                      type="number"
                      value={form.vehicleSeats}
                      onChange={updateField}
                    />
                  </div>
                </label>

                <label className="profile-editor-field">
                  <span className="profile-editor-field__label">Permis</span>
                  <div className="profile-editor-field__control">
                    <Icon name="shield" size={18} />
                    <input
                      name="driverLicense"
                      placeholder="Numero permis"
                      type="text"
                      value={form.driverLicense}
                      onChange={updateField}
                    />
                  </div>
                </label>

                <div className="profile-vehicle-gallery profile-editor-field--wide">
                  <div className="profile-vehicle-gallery__top">
                    <div>
                      <span className="profile-editor-field__label">Photos vehicule</span>
                      <p>Ajoute jusqu'a {maxVehiclePhotos} photos propres de la voiture.</p>
                    </div>
                    <button
                      className="mini-button mini-button--ghost"
                      type="button"
                      onClick={handlePickVehiclePhotos}
                    >
                      <Icon name="image" size={16} />
                      Ajouter
                    </button>
                    <input
                      accept="image/*"
                      className="profile-photo-input"
                      multiple
                      ref={vehicleInputRef}
                      type="file"
                      onChange={handleVehiclePhotosChange}
                    />
                  </div>

                  <div className="vehicle-photo-grid">
                    {form.vehiclePhotos.map((photoUrl, index) => (
                      <div className="vehicle-photo-tile" key={photoUrl}>
                        <img alt={`Vehicule ${index + 1}`} src={photoUrl} />
                        <button
                          aria-label="Retirer cette photo"
                          type="button"
                          onClick={() => removePersistedVehiclePhoto(index)}
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                    ))}

                    {selectedVehiclePhotos.map((item, index) => (
                      <div className="vehicle-photo-tile vehicle-photo-tile--pending" key={item.preview}>
                        <img alt={`Nouvelle photo vehicule ${index + 1}`} src={item.preview} />
                        <button
                          aria-label="Retirer cette photo"
                          type="button"
                          onClick={() => removeSelectedVehiclePhoto(index)}
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                    ))}

                    {!vehiclePhotos.length ? (
                      <button
                        className="vehicle-photo-placeholder"
                        type="button"
                        onClick={handlePickVehiclePhotos}
                      >
                        <Icon name="image" size={24} />
                        <span>Ajouter photos</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="message-box message-box--soft profile-editor-field--wide">
                <strong>Mode passager actif</strong>
                <p>Ton garage driver reste sauvegarde et revient quand tu changes de mode.</p>
              </div>
            )}
          </div>

          {feedback.message ? (
            <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
              {feedback.message}
            </p>
          ) : null}

          {uploadStep ? (
            <p className="profile-editor-status profile-editor-status--loading">
              {uploadStep}
            </p>
          ) : null}

          <div className="profile-editor-actions">
            <button
              className="primary-button profile-editor-save"
              disabled={!formDirty || isSaving}
              type="submit"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        <div className="screen-panel">
          <div className="section-heading section-heading--compact">
            <div>
              <h3>Mon espace</h3>
              <p>Accede rapidement a tes trajets et activites</p>
            </div>
          </div>

          <div className="menu-list">
            {visibleProfileLinks.map((link) => (
              <button
                className="menu-card"
                key={link.id}
                type="button"
                onClick={() => navigate(link.route)}
              >
                <span className="menu-card__icon">
                  <Icon name={link.icon} size={18} />
                </span>
                <span className="menu-card__label">{link.label}</span>
                <Icon name="chevron-right" size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
