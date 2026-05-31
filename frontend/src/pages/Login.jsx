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
  const [showPassword, setShowPassword] = useState(false);
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
      setError(`${submissionError.message} Si Google ne s'ouvre pas, vérifie que Google Provider et Redirect URL sont activés dans Supabase.`);
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="screen screen--auth">
      <div className="login-page">
        {/* Background image */}
        <div className="login-page__bg" aria-hidden="true" />

        {/* Header: logo + welcome text */}
        <header className="login-page__header">
          <img src={logo} alt="CampusRide logo" className="login-page__logo" />

          <h1 className="login-page__title">Bienvenue !</h1>
          <p className="login-page__subtitle">
            Connectez-vous pour réserver, suivre<br />
            et profiter de vos trajets en toute sérénité.
          </p>
        </header>

        {/* Login card */}
        <div className="login-page__card">
          <h2 className="login-page__card-title">Se connecter</h2>

          {!isConfigured ? (
            <p className="auth-status auth-status--info">
              Supabase n'est pas encore configuré sur cet environnement.
            </p>
          ) : null}

          <form className="login-page__form" onSubmit={handleSubmit}>
            <div className="login-field">
              <span className="login-field__icon">
                <Icon name="send" size={18} />
              </span>
              <input
                autoComplete="email"
                name="email"
                placeholder="Adresse e-mail"
                required
                type="email"
                value={form.email}
                onChange={updateField}
              />
            </div>

            <div className="login-field">
              <span className="login-field__icon">
                <Icon name="shield" size={18} />
              </span>
              <input
                autoComplete="current-password"
                name="password"
                placeholder="Mot de passe"
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
              />
              <button
                type="button"
                className="login-field__toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
              </button>
            </div>

            <div className="login-page__options">
              <label className="login-page__remember">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" className="login-page__forgot" onClick={() => navigate("forgot-password")}>
                Mot de passe oublié ?
              </button>
            </div>

            {error ? <p className="auth-status auth-status--error">{error}</p> : null}

            <button
              className="login-page__submit"
              disabled={isSubmitting || isGoogleSubmitting}
              type="submit"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="login-page__divider">
            <span>ou continuer avec</span>
          </div>

          <button
            className="login-page__oauth"
            disabled={isSubmitting || isGoogleSubmitting}
            type="button"
            onClick={handleGoogleSignIn}
          >
            <span className="login-page__oauth-mark">G</span>
            <span>{isGoogleSubmitting ? "Redirection..." : "Continuer avec Google"}</span>
          </button>

          <p className="login-page__register">
            Pas encore de compte ?{" "}
            <button type="button" onClick={() => navigate("register")}>
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
