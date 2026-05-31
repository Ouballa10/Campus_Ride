import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { Icon } from "../components/Icons";
import { authService } from "../services/authService";

export default function ResetPassword({ navigate }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await authService.updatePassword(password);
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
          <h1 className="login-page__title">Nouveau mot de passe</h1>
          <p className="login-page__subtitle">
            Choisis un nouveau mot de passe<br />
            pour ton compte CampusRide.
          </p>
        </header>

        <div className="login-page__card">
          {success ? (
            <div className="forgot-password__success">
              <div className="forgot-password__success-icon">
                <Icon name="check" size={32} />
              </div>
              <h2 className="login-page__card-title">Mot de passe mis à jour !</h2>
              <p className="forgot-password__success-text">
                Ton mot de passe a été changé avec succès.
                Tu peux maintenant te connecter.
              </p>
              <button
                className="login-page__submit"
                type="button"
                onClick={() => navigate("login")}
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              <h2 className="login-page__card-title">Réinitialiser</h2>

              <form className="login-page__form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <span className="login-field__icon">
                    <Icon name="shield" size={18} />
                  </span>
                  <input
                    autoComplete="new-password"
                    name="password"
                    placeholder="Nouveau mot de passe"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
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

                <div className="login-field">
                  <span className="login-field__icon">
                    <Icon name="shield" size={18} />
                  </span>
                  <input
                    autoComplete="new-password"
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    required
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
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
                  {isSubmitting ? "Mise à jour..." : "Changer le mot de passe"}
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
