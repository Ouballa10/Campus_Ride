import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
};

export default function Login({ navigate }) {
  const { isConfigured, signIn } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
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
        email: form.email,
        password: form.password,
      });
      navigate("home");
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
            <h2>Connexion</h2>
          </div>
        </div>

        <div className="auth-copy">
          <p>Reconnecte-toi rapidement pour gerer tes trajets et reservations.</p>
        </div>

        {!isConfigured ? (
          <p className="auth-status auth-status--info">
            Supabase n'est pas encore configure sur had l'environnement.
          </p>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Adresse email</span>
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
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <button
          className="text-link text-link--center"
          type="button"
          onClick={() => navigate("register")}
        >
          Je n'ai pas de compte
        </button>
      </div>
    </div>
  );
}
