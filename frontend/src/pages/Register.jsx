import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function Register({ navigate }) {
  const { isConfigured, signUp } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!isConfigured) {
      setError("Configure d'abord Supabase dans .env.local ou Vercel.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const response = await signUp({
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        phone: form.phone,
      });

      if (response.session) {
        navigate("home");
        return;
      }

      setSuccess(
        "Compte cree. Verifie ton email pour confirmer ton inscription avant de te connecter.",
      );
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="screen screen--auth">
      <button
        className="auth-back"
        type="button"
        onClick={() => navigate("splash")}
      >
        <Icon name="arrow-left" size={18} />
        <span>Retour</span>
      </button>

      <div className="auth-card">
        <div className="auth-brand">
          <img className="auth-brand__logo" src={logo} alt="CampusRide logo" />
          <div>
            <span className="eyebrow">CampusRide</span>
            <h2>Creer un compte</h2>
          </div>
        </div>

        <div className="auth-copy">
          <p>Inscris-toi en quelques secondes pour publier ou reserver un trajet.</p>
        </div>

        {!isConfigured ? (
          <p className="auth-status auth-status--info">
            Supabase n'est pas encore configure sur had l'environnement.
          </p>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Nom complet</span>
            <input
              autoComplete="name"
              name="fullName"
              placeholder="Nom et prenom"
              required
              type="text"
              value={form.fullName}
              onChange={updateField}
            />
          </label>

          <label className="auth-field">
            <span>Email universitaire</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="etu@campusride.ma"
              required
              type="email"
              value={form.email}
              onChange={updateField}
            />
          </label>

          <label className="auth-field">
            <span>Telephone</span>
            <input
              autoComplete="tel"
              name="phone"
              placeholder="+212 6 00 00 00 00"
              required
              type="tel"
              value={form.phone}
              onChange={updateField}
            />
          </label>

          <label className="auth-field">
            <span>Mot de passe</span>
            <input
              autoComplete="new-password"
              name="password"
              placeholder="Choisis un mot de passe"
              required
              type="password"
              value={form.password}
              onChange={updateField}
            />
          </label>

          <label className="auth-field">
            <span>Confirmer le mot de passe</span>
            <input
              autoComplete="new-password"
              name="confirmPassword"
              placeholder="Retape ton mot de passe"
              required
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
            />
          </label>

          {error ? <p className="auth-status auth-status--error">{error}</p> : null}
          {success ? <p className="auth-status auth-status--success">{success}</p> : null}

          <button
            className="primary-button primary-button--auth"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creation..." : "Creer mon compte"}
          </button>
        </form>

        <button
          className="text-link text-link--center"
          type="button"
          onClick={() => navigate("login")}
        >
          J'ai deja un compte
        </button>
      </div>
    </div>
  );
}
