import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { demandeService } from "../services/demandeService";

function getDateValue(daysFromNow = 0) {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  return d.toISOString().slice(0, 10);
}

const initialForm = {
  depart: "",
  destination: "UPM",
  date: getDateValue(0),
  time: "07:30",
  prixPropose: 15,
  message: "",
};

export default function PublishDemande({ navigate, onCreated }) {
  const { session, isConfigured } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (feedback.message) setFeedback({ message: "", tone: "" });
  }

  function adjustPrice(delta) {
    setForm((f) => ({ ...f, prixPropose: Math.max(0, Math.min(500, Number(f.prixPropose) + delta)) }));
  }

  function validate() {
    if (!form.depart.trim()) return "Indique ton point de départ.";
    if (!form.destination.trim()) return "Indique ta destination.";
    if (form.depart.trim().toLowerCase() === form.destination.trim().toLowerCase())
      return "Le départ et la destination doivent être différents.";
    const dt = new Date(`${form.date}T${form.time}`);
    if (isNaN(dt.getTime())) return "Date ou heure invalide.";
    if (dt <= new Date()) return "Choisis une date dans le futur.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setFeedback({ message: err, tone: "error" }); return; }

    if (!isConfigured || !session?.user?.id) {
      setFeedback({ message: "Connecte-toi pour publier une demande.", tone: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback({ message: "", tone: "" });
      const departureAt = new Date(`${form.date}T${form.time}`).toISOString();
      await demandeService.createDemande({
        passagerId:  session.user.id,
        depart:      form.depart.trim(),
        destination: form.destination.trim(),
        departureAt,
        prixPropose: Number(form.prixPropose) || 0,
        message:     form.message.trim() || null,
      });
      setFeedback({ message: "Demande publiée ! Les conducteurs vont la voir.", tone: "success" });
      setForm(initialForm);
      onCreated?.();
      setTimeout(() => navigate("my-demandes"), 1200);
    } catch (error) {
      setFeedback({ message: error.message || "Publication impossible.", tone: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="screen screen--simple page-enter">
      <AppHeader
        title="Demander un trajet"
        subtitle="Les conducteurs verront ta demande"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <form className="pd-form" onSubmit={handleSubmit}>
        {/* InDrive-style banner */}
        <div className="pd-banner">
          <span className="pd-banner__icon">🚗</span>
          <div>
            <strong>Mode InDrive</strong>
            <p>Tu proposes ton prix, un conducteur accepte et vous partez ensemble.</p>
          </div>
        </div>

        {/* Route */}
        <div className="pd-card">
          <h4 className="pd-card__title"><Icon name="route" size={16} /> Itinéraire</h4>

          <label className="pd-field">
            <span>Départ</span>
            <div className="pd-field__control">
              <Icon name="location" size={16} />
              <input
                name="depart"
                placeholder="Ex: Gueliz, Massira, Bab Doukkala..."
                type="text"
                value={form.depart}
                onChange={update}
                autoComplete="off"
              />
            </div>
          </label>

          <label className="pd-field">
            <span>Destination</span>
            <div className="pd-field__control">
              <Icon name="route" size={16} />
              <input
                name="destination"
                placeholder="Ex: UPM, Guéliz, Médina..."
                type="text"
                value={form.destination}
                onChange={update}
                autoComplete="off"
              />
            </div>
          </label>
        </div>

        {/* Date & heure */}
        <div className="pd-card">
          <h4 className="pd-card__title"><Icon name="calendar" size={16} /> Quand ?</h4>
          <div className="pd-row">
            <label className="pd-field">
              <span>Date</span>
              <div className="pd-field__control">
                <Icon name="calendar" size={16} />
                <input
                  min={getDateValue(0)}
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={update}
                />
              </div>
            </label>
            <label className="pd-field">
              <span>Heure</span>
              <div className="pd-field__control">
                <Icon name="clock" size={16} />
                <input
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={update}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Prix proposé */}
        <div className="pd-card">
          <h4 className="pd-card__title"><Icon name="ticket" size={16} /> Prix proposé</h4>
          <p className="pd-hint">Propose un prix juste — le conducteur peut accepter ou ignorer.</p>
          <div className="pd-price-stepper">
            <button type="button" className="pd-price-stepper__btn" onClick={() => adjustPrice(-5)}>−</button>
            <div className="pd-price-stepper__display">
              <input
                className="pd-price-stepper__input"
                max="500"
                min="0"
                name="prixPropose"
                type="number"
                value={form.prixPropose}
                onChange={update}
              />
              <span className="pd-price-stepper__unit">DH</span>
            </div>
            <button type="button" className="pd-price-stepper__btn" onClick={() => adjustPrice(5)}>+</button>
          </div>
        </div>

        {/* Message optionnel */}
        <div className="pd-card">
          <h4 className="pd-card__title"><Icon name="user" size={16} /> Message (optionnel)</h4>
          <textarea
            className="pd-textarea"
            name="message"
            placeholder="Ex: Je suis ponctuel, petit sac à dos, trajet direct..."
            rows={3}
            value={form.message}
            onChange={update}
          />
        </div>

        {feedback.message && (
          <div className={`toast toast--${feedback.tone}`}>{feedback.message}</div>
        )}

        <button
          className="primary-button pd-submit"
          disabled={isSubmitting}
          type="submit"
        >
          <Icon name="plus" size={18} />
          {isSubmitting ? "Publication..." : "Publier ma demande"}
        </button>
      </form>
    </div>
  );
}
