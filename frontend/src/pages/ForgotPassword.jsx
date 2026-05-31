import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

export default function ForgotPassword({ navigate }) {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isConfigured) {
      setError("Configure d'abord Supabase dans .env.local ou Vercel.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Entre ton adresse e-mail.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await authService.resetPasswordForEmail(trimmedEmail);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="screen screen--auth">
      <div className="login-page">
        <div className="login-page__bg" aria-hidden="true" />

        <header className="login-page__header">
          <img src={logo} alt="CampusRide logo" className="login-page__logo" />
          <h1 className="login-page__title">Mot de passe oublié</h1>
          <p className="login-page__subtitle">
            Entre ton e-mail et on t'enverra un lien<br />
            pour réinitialiser ton mot de passe.
          </p>
        </header>

        <div className="login-page__card">
          {success ? (
            <div className="forgot-password__success">
              <div className="forgot-password__success-icon">
                <Icon name="check" size={32} />
              </div>
              <h2 className="login-page__card-title">E-mail envoyé !</h2>
              <p className="forgot-password__success-text">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                Vérifie ta boîte mail (et les spams).
              </p>
              <button
                className="login-page__submit"
                type="button"
                onClick={() => navigate("login")}
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h2 className="login-page__card-title">Réinitialiser</h2>

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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>

                {error ? <p className="auth-status auth-status--error">{error}</p> : null}

                <button
                  className="login-page__submit"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>

              <p className="login-page__register">
                <button type="button" onClick={() => navigate("login")}>
                  ← Retour à la connexion
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
