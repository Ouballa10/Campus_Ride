import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { Icon } from "../components/Icons";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function Register({ navigate }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

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

  function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    navigate("home");
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

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="primary-button primary-button--auth" type="submit">
            Creer mon compte
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
