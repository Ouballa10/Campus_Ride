import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { Icon } from "../components/Icons";
import ModeSwitch from "../components/ModeSwitch";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  email: "",
  mode: "passenger",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function Register({ navigate }) {
  const { isConfigured, signIn, signInWithGoogle, signUp } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.mode === "driver" ? "conducteur" : "passager",
      });

      if (response.session) {
        // Navigation is handled automatically by the auth useEffect in App.jsx
        return;
      }

      // No session = email confirmation required by Supabase
      // Try to sign in directly (works if confirm email is disabled in Supabase)
      try {
        await signIn({
          email: form.email.trim(),
          password: form.password,
        });
        navigate("home");
        return;
      } catch {
        // If sign in fails, just redirect to login
      }

      setSuccess("Compte créé ! Connecte-toi maintenant.");
      setTimeout(() => navigate("login"), 1500);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!isConfigured) {
      setError("Configure d'abord Supabase dans .env.local ou Vercel.");
      return;
    }

    try {
      setIsGoogleSubmitting(true);
      setError("");
      setSuccess("");
      await signInWithGoogle();
    } catch (submissionError) {
      setError(`${submissionError.message} Si Google ne s'ouvre pas, verifie que Google Provider et Redirect URL sont actives dans Supabase.`);
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="screen screen--auth">
      <div className="login-page">
        <header className="login-page__header">
          <img src={logo} alt="CampusRide logo" className="login-page__logo" />
          <h1 className="login-page__title">Créer un compte</h1>
          <p className="login-page__subtitle">
            Inscris-toi en quelques secondes et rejoins la communauté CampusRide.
          </p>
        </header>

        <div className="login-page__card">
          <button
            className="auth-back"
            type="button"
            onClick={() => navigate("splash")}
            style={{ position: "absolute", top: "16px", left: "16px" }}
          >
            <Icon name="arrow-left" size={18} />
          </button>

          <ModeSwitch
            mode={form.mode}
            onChange={(mode) =>
              updateField({ target: { name: "mode", value: mode } })
            }
          />

          {!isConfigured ? (
            <p className="auth-status auth-status--info">
              Supabase n'est pas encore configuré sur cet environnement.
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
            <span>Téléphone</span>
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
            disabled={isSubmitting || isGoogleSubmitting}
            type="submit"
          >
            {isSubmitting ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <button
          className="oauth-button"
          disabled={isSubmitting || isGoogleSubmitting}
          type="button"
          onClick={handleGoogleSignIn}
        >
          <span className="oauth-button__mark" aria-hidden="true">G</span>
          <span>{isGoogleSubmitting ? "Redirection..." : "Continuer avec Google"}</span>
        </button>

        <button
          className="text-link text-link--center"
          type="button"
          onClick={() => navigate("login")}
        >
          J'ai déjà un compte
        </button>
      </div>
      </div>
    </div>
  );
}
