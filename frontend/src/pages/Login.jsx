import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
};

export default function Login({ navigate }) {
  const { isConfigured, signIn, signInWithGoogle } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isConfigured) {
      setError("Configure d'abord Supabase dans .env.local ou Vercel.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await signIn({
        email: form.email.trim(),
        password: form.password,
      });
      navigate("home");
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
      await signInWithGoogle();
    } catch (submissionError) {
      setError(`${submissionError.message} Si Google ne s'ouvre pas, verifie que Google Provider et Redirect URL sont actives dans Supabase.`);
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="screen screen--auth">
      <button
        className="auth-back"
        type="button"
        onClick={() => navigate("splash")}
      >
        <Icon name="arrow-left" size={16} />
        <span>Retour</span>
      </button>

      <div className="auth-card">
        <div className="auth-brand">
          <img className="auth-brand__logo" src={logo} alt="CampusRide" />
          <div>
            <span className="eyebrow">CampusRide</span>
            <h2>Connexion</h2>
          </div>
        </div>

        <div className="auth-copy">
          <p>Reconnectez-vous pour gerer vos trajets et reservations.</p>
        </div>

        {!isConfigured ? (
          <p className="auth-status auth-status--info">
            Supabase n'est pas encore configure sur cet environnement.
          </p>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Adresse email</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="votre@email.ma"
              required
              type="email"
              value={form.email}
              onChange={updateField}
            />
          </label>

          <label className="auth-field">
            <span>Mot de passe</span>
            <input
              autoComplete="current-password"
              name="password"
              placeholder="Votre mot de passe"
              required
              type="password"
              value={form.password}
              onChange={updateField}
            />
          </label>

          {error ? <p className="auth-status auth-status--error">{error}</p> : null}

          <button
            className="primary-button primary-button--auth"
            disabled={isSubmitting || isGoogleSubmitting}
            type="submit"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
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
          onClick={() => navigate("register")}
        >
          Creer un compte
        </button>
      </div>
    </div>
  );
}
