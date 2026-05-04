<<<<<<< HEAD
<<<<<<< Updated upstream
export default function Profile() {
  return <div>Profile Page</div>;
=======
import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";
import ModeSwitch from "../components/ModeSwitch";
=======
import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";
>>>>>>> origin/main
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";

const defaultProfileState = {
  email: "",
  fullName: "",
  phone: "",
  photoProfil: "",
  role: "passager",
  vehicleLabel: "",
};

<<<<<<< HEAD
function getRoleFromMode(mode = "passenger") {
  return mode === "driver" ? "conducteur" : "passager";
}

function buildProfileForm(profile, fallbackUser, mode = "passenger") {
=======
function buildProfileForm(profile, fallbackUser) {
>>>>>>> origin/main
  return {
    email: profile?.email || fallbackUser?.email || "",
    fullName: profile?.full_name || fallbackUser?.name || "",
    phone: profile?.phone || fallbackUser?.phone || "",
    photoProfil: profile?.photo_profil || fallbackUser?.photo || "",
<<<<<<< HEAD
    role: getRoleFromMode(mode) || profile?.role || fallbackUser?.roleValue || "passager",
=======
    role: profile?.role || fallbackUser?.roleValue || "passager",
>>>>>>> origin/main
    vehicleLabel: profile?.vehicle_label || fallbackUser?.car || "",
  };
}

<<<<<<< HEAD
export default function Profile({
  mode = "passenger",
  navigate,
  onModeChange,
  user,
  profileLinks,
}) {
=======
export default function Profile({ navigate, user, profileLinks }) {
>>>>>>> origin/main
  const fileInputRef = useRef(null);
  const {
    isConfigured,
    profile,
    refreshProfile,
    session,
    signOut,
  } = useAuth();
<<<<<<< HEAD
  const [form, setForm] = useState(() => buildProfileForm(profile, user, mode));
=======
  const [form, setForm] = useState(() => buildProfileForm(profile, user));
>>>>>>> origin/main
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayUser = user || {
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
  };

  useEffect(() => {
<<<<<<< HEAD
    setForm(buildProfileForm(profile, user, mode));
  }, [mode, profile, user]);
=======
    setForm(buildProfileForm(profile, user));
  }, [profile, user]);
>>>>>>> origin/main

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const avatarSource = photoPreview || form.photoProfil || displayUser.photo || "";
<<<<<<< HEAD
  const isDriverMode = mode === "driver";
  const roleLabel = isDriverMode ? "Conducteur campus" : "Passager campus";
  const profileRoleDiffers =
    Boolean(profile?.role) && profile.role !== getRoleFromMode(mode);
  const visibleProfileLinks = profileLinks.filter((link) =>
    isDriverMode
      ? ["trips", "publish", "search"].includes(link.id)
      : ["reservations", "search", "trips"].includes(link.id),
  );
  const formDirty =
    JSON.stringify(form) !== JSON.stringify(buildProfileForm(profile, user, mode)) ||
    Boolean(selectedPhoto) ||
    profileRoleDiffers;
=======
  const roleLabel = form.role === "conducteur" ? "Conducteur campus" : "Passager campus";
  const formDirty =
    JSON.stringify(form) !== JSON.stringify(buildProfileForm(profile, user)) ||
    Boolean(selectedPhoto);
>>>>>>> origin/main

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

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback({
        message: "Choisis une image JPG, PNG ou WebP pour la photo de profil.",
        tone: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        message: "La photo ne doit pas depasser 5 Mo.",
        tone: "error",
      });
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFeedback({ message: "", tone: "" });
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
      setFeedback({ message: "", tone: "" });

      let photoProfil = form.photoProfil;

      if (selectedPhoto) {
        photoProfil = await profileService.uploadProfilePhoto(
          selectedPhoto,
          session.user.id,
        );
      }

      await profileService.updateProfile(session.user.id, {
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        photo_profil: photoProfil || null,
<<<<<<< HEAD
        role: getRoleFromMode(mode),
=======
        role: form.role,
>>>>>>> origin/main
        vehicle_label: form.vehicleLabel.trim(),
      });

      await refreshProfile();
      setSelectedPhoto(null);
      setPhotoPreview("");
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
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      const result = await signOut();

      if (result?.error) {
        console.warn("Session cleared locally after sign out error:", result.error);
      }

      navigate("splash");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="screen screen--profile">
      <AppHeader
        title="Mon profil"
        subtitle="Compte, vehicule et preferences"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <div className="screen-panel">
        <section className="profile-editor-hero">
          <div className="profile-editor-hero__header">
            <div>
              <span className="eyebrow">Compte</span>
<<<<<<< HEAD
              <h2>{isDriverMode ? "Profil driver" : "Profil passager"}</h2>
            </div>
            <span className="profile-editor-badge">
              <Icon name="check-badge" size={16} />
              {isDriverMode ? "Mode driver" : "Mode passager"}
            </span>
          </div>

          <ModeSwitch mode={mode} onChange={onModeChange} />

=======
              <h2>Modifier mon profil</h2>
            </div>
            <span className="profile-editor-badge">
              <Icon name="check-badge" size={16} />
              Profil actif
            </span>
          </div>

>>>>>>> origin/main
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
            </div>
          </div>

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

          <button
            className="logout-card profile-editor-logout"
            disabled={isLoggingOut}
            type="button"
            onClick={handleLogout}
          >
            <span className="menu-card__icon">
              <Icon name="logout" size={18} />
            </span>
            <span className="menu-card__label">
              {isLoggingOut ? "Deconnexion..." : "Se deconnecter"}
            </span>
          </button>
        </section>

        <form className="profile-editor-card" onSubmit={handleSave}>
          <div className="section-heading section-heading--compact">
            <div>
<<<<<<< HEAD
              <h3>
                {isDriverMode
                  ? "Informations conducteur"
                  : "Informations passager"}
              </h3>
              <p>
                {isDriverMode
                  ? "Ajoute ton vehicule et tes coordonnees pour inspirer confiance aux passagers."
                  : "Garde tes informations propres pour confirmer les trajets plus vite."}
              </p>
=======
              <h3>Informations personnelles</h3>
              <p>Un profil complet inspire plus de confiance comme sur une app VTC pro.</p>
>>>>>>> origin/main
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
<<<<<<< HEAD
              <span className="profile-editor-field__label">Mode actuel</span>
              <div className="profile-editor-field__control profile-editor-field__control--disabled">
                <Icon name={isDriverMode ? "car" : "user"} size={18} />
                <input
                  disabled
                  name="role"
                  type="text"
                  value={roleLabel}
=======
              <span className="profile-editor-field__label">Role principal</span>
              <div className="profile-editor-field__control">
                <Icon name="user" size={18} />
                <select
                  name="role"
                  value={form.role}
                  onChange={updateField}
                >
                  <option value="passager">Passager</option>
                  <option value="conducteur">Conducteur</option>
                </select>
              </div>
            </label>

            <label className="profile-editor-field profile-editor-field--wide">
              <span className="profile-editor-field__label">Vehicule</span>
              <div className="profile-editor-field__control">
                <Icon name="car" size={18} />
                <input
                  name="vehicleLabel"
                  placeholder="Ex: Dacia Logan - Blanc - 12345"
                  type="text"
                  value={form.vehicleLabel}
>>>>>>> origin/main
                  onChange={updateField}
                />
              </div>
            </label>
<<<<<<< HEAD

            {isDriverMode ? (
              <label className="profile-editor-field profile-editor-field--wide">
                <span className="profile-editor-field__label">Vehicule</span>
                <div className="profile-editor-field__control">
                  <Icon name="car" size={18} />
                  <input
                    name="vehicleLabel"
                    placeholder="Ex: Dacia Logan - Blanc - 12345"
                    type="text"
                    value={form.vehicleLabel}
                    onChange={updateField}
                  />
                </div>
              </label>
            ) : (
              <div className="message-box message-box--soft profile-editor-field--wide">
                <strong>Mode passager actif</strong>
                <p>Ton vehicule reste garde pour le mode driver, sans encombrer ce profil.</p>
              </div>
            )}
=======
>>>>>>> origin/main
          </div>

          {feedback.message ? (
            <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
              {feedback.message}
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
<<<<<<< HEAD
            {visibleProfileLinks.map((link) => (
=======
            {profileLinks.map((link) => (
>>>>>>> origin/main
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
<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> origin/main
}
