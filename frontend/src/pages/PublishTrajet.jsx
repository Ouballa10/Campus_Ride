import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

function buildInitialForm() {
  const tomorrow = new Date(Date.now() + 86400000);
  const year = tomorrow.getFullYear();
  const month = `${tomorrow.getMonth() + 1}`.padStart(2, "0");
  const day = `${tomorrow.getDate()}`.padStart(2, "0");

  return {
    depart: "",
    destination: "UPM",
    date: `${year}-${month}-${day}`,
    time: "07:30",
    seats: 3,
    price: 18,
    durationMinutes: 30,
    pickupNote: "",
    description: "",
  };
}

export default function PublishTrajet({ navigate, onPublish, user }) {
  const [form, setForm] = useState(buildInitialForm);
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: ["seats", "price", "durationMinutes"].includes(name)
        ? Number(value)
        : value,
    }));

    if (feedback.message) {
      setFeedback({ message: "", tone: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.depart.trim() || !form.destination.trim()) {
      setFeedback({
        message: "Le depart et la destination sont obligatoires.",
        tone: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback({ message: "", tone: "" });
      await onPublish(form);
      setFeedback({
        message: "Trajet publie avec succes.",
        tone: "success",
      });
      setForm(buildInitialForm());
      navigate("my-trips");
    } catch (error) {
      setFeedback({
        message: error.message || "Publication impossible pour le moment.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="screen screen--publish">
      <AppHeader
        title="Publier un trajet"
        subtitle="Cree une annonce claire et rassurante"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <form className="screen-grid screen-grid--publish" onSubmit={handleSubmit}>
        <div className="screen-panel screen-panel--fields">
          <div className="profile-editor-card">
            <div className="section-heading section-heading--compact">
              <div>
                <h3>Informations du trajet</h3>
                <p>Les champs ci-dessous seront visibles par les passagers.</p>
              </div>
            </div>

            <div className="profile-editor-grid">
              <label className="profile-editor-field profile-editor-field--wide">
                <span className="profile-editor-field__label">Lieu de depart</span>
                <div className="profile-editor-field__control">
                  <Icon name="location" size={18} />
                  <input
                    name="depart"
                    placeholder="Ex: Gueliz"
                    type="text"
                    value={form.depart}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="profile-editor-field profile-editor-field--wide">
                <span className="profile-editor-field__label">Destination</span>
                <div className="profile-editor-field__control">
                  <Icon name="route" size={18} />
                  <input
                    name="destination"
                    placeholder="Ex: UPM"
                    type="text"
                    value={form.destination}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Date</span>
                <div className="profile-editor-field__control">
                  <Icon name="calendar" size={18} />
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Heure</span>
                <div className="profile-editor-field__control">
                  <Icon name="clock" size={18} />
                  <input
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Places</span>
                <div className="profile-editor-field__control">
                  <Icon name="seat" size={18} />
                  <input
                    min="1"
                    max="8"
                    name="seats"
                    type="number"
                    value={form.seats}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Prix / place (DH)</span>
                <div className="profile-editor-field__control">
                  <Icon name="ticket" size={18} />
                  <input
                    min="0"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="profile-editor-field profile-editor-field--wide">
                <span className="profile-editor-field__label">Duree estimee (minutes)</span>
                <div className="profile-editor-field__control">
                  <Icon name="clock" size={18} />
                  <input
                    min="10"
                    step="5"
                    name="durationMinutes"
                    type="number"
                    value={form.durationMinutes}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="profile-editor-field profile-editor-field--wide">
                <span className="profile-editor-field__label">Point de rendez-vous</span>
                <div className="profile-editor-field__control">
                  <Icon name="location" size={18} />
                  <input
                    name="pickupNote"
                    placeholder="Ex: Porte principale, cafe, parking..."
                    type="text"
                    value={form.pickupNote}
                    onChange={updateField}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="screen-panel screen-panel--details">
          <div className="detail-card detail-card--publish">
            <div className="section-heading section-heading--compact">
              <div>
                <h3>Apercu de l'annonce</h3>
                <p>Ton profil apparaissant comme conducteur sur CampusRide.</p>
              </div>
              <span className="pill pill--price">{form.price} DH</span>
            </div>

            <div className="trip-card__middle">
              <div className="avatar-badge avatar-badge--large">{user.initials}</div>
              <div className="trip-card__driver">
                <strong>{user.name}</strong>
                <span>{user.role}</span>
                <span>{user.car}</span>
              </div>
            </div>

            <div className="reservation-route-grid">
              <div className="reservation-route-stop">
                <span className="reservation-route-stop__dot" />
                <div>
                  <strong>{form.depart || "Lieu de depart"}</strong>
                  <span>{form.date} a {form.time}</span>
                </div>
              </div>

              <div className="reservation-route-stop">
                <span className="reservation-route-stop__dot reservation-route-stop__dot--end" />
                <div>
                  <strong>{form.destination || "Destination"}</strong>
                  <span>{form.durationMinutes} min estimees</span>
                </div>
              </div>
            </div>

            <div className="trip-card__meta">
              <span className="meta-chip">
                <Icon name="seat" size={14} />
                {form.seats} place(s)
              </span>
              <span className="meta-chip">
                <Icon name="clock" size={14} />
                {form.durationMinutes} min
              </span>
              <span className="meta-chip">
                <Icon name="car" size={14} />
                {user.car}
              </span>
            </div>

            <label className="reservation-note-card">
              <span className="profile-editor-field__label">Description</span>
              <textarea
                name="description"
                placeholder="Precise si tu acceptes les bagages, l'heure exacte, ou le point de rendez-vous."
                rows="5"
                value={form.description}
                onChange={updateField}
              />
            </label>

            {feedback.message ? (
              <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
                {feedback.message}
              </p>
            ) : null}

            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Publication..." : "Publier le trajet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
