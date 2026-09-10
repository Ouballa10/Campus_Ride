import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import InteractiveMap from "../components/InteractiveMap";
import "../components/InteractiveMap.css";
import { useAuth } from "../context/AuthContext";
import { demandeService } from "../services/demandeService";

function getDateValue(daysFromNow = 0) {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  return d.toISOString().slice(0, 10);
}

function getDefaultTime() {
  const now = new Date();
  // Default to next round hour + 1h from now
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 2);
  return `${String(now.getHours()).padStart(2, "0")}:00`;
}

const initialForm = {
  depart: "",
  destination: "UPM",
  date: getDateValue(0),
  time: getDefaultTime(),
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

  function handleDepartSelect(name) {
    setForm((f) => ({ ...f, depart: name || "" }));
    if (feedback.message) setFeedback({ message: "", tone: "" });
  }

  function handleDestinationSelect(name) {
    setForm((f) => ({ ...f, destination: name || "" }));
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
    // Allow up to 5 minutes in the past (clock skew tolerance)
    if (dt < new Date(Date.now() - 5 * 60 * 1000)) return "Choisis une heure dans le futur.";
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
        {/* Interactive Map — départ et destination */}
        <div className="pd-card pd-card--map">
          <h4 className="pd-card__title"><Icon name="route" size={16} /> Itinéraire</h4>
          <InteractiveMap
            onDepartSelect={handleDepartSelect}
            onDestinationSelect={handleDestinationSelect}
            departValue={form.depart}
            destinationValue={form.destination}
          />
          {/* Affichage texte des valeurs sélectionnées */}
          {(form.depart || form.destination) && (
            <div className="pd-route-summary">
              <div className="pd-route-summary__item">
                <span className="pd-dot pd-dot--start" />
                <span>{form.depart || "Départ non sélectionné"}</span>
              </div>
              <div className="pd-route-summary__arrow"><Icon name="arrow-right" size={14} /></div>
              <div className="pd-route-summary__item">
                <span className="pd-dot pd-dot--end" />
                <span>{form.destination || "Destination non sélectionnée"}</span>
              </div>
            </div>
          )}
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
