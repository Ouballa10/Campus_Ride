<<<<<<< HEAD
<<<<<<< Updated upstream
export default function PublishTrajet() {
  return <div>PublishTrajet Page</div>;
=======
import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

const numberFields = ["seats", "price", "durationMinutes"];

function getDateValue(daysFromNow = 1) {
  const targetDate = new Date(Date.now() + daysFromNow * 86400000);
  const year = targetDate.getFullYear();
  const month = `${targetDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${targetDate.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildInitialForm() {
  return {
    depart: "",
    destination: "UPM",
    date: getDateValue(),
=======
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
>>>>>>> origin/main
    time: "07:30",
    seats: 3,
    price: 18,
    durationMinutes: 30,
    pickupNote: "",
    description: "",
  };
}

<<<<<<< HEAD
function formatOfferTime(form) {
  if (!form.date || !form.time) {
    return "Horaire a confirmer";
  }

  return `${form.date} a ${form.time}`;
}

=======
>>>>>>> origin/main
export default function PublishTrajet({ navigate, onPublish, user }) {
  const [form, setForm] = useState(buildInitialForm);
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

<<<<<<< HEAD
  const totalPotential = useMemo(
    () => Number(form.price || 0) * Number(form.seats || 0),
    [form.price, form.seats],
  );

  function clearFeedback() {
=======
  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: ["seats", "price", "durationMinutes"].includes(name)
        ? Number(value)
        : value,
    }));

>>>>>>> origin/main
    if (feedback.message) {
      setFeedback({ message: "", tone: "" });
    }
  }

<<<<<<< HEAD
  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
    clearFeedback();
  }

  function adjustNumber(field, delta, min, max) {
    setForm((currentForm) => {
      const nextValue = Math.min(
        max,
        Math.max(min, Number(currentForm[field] || 0) + delta),
      );

      return {
        ...currentForm,
        [field]: nextValue,
      };
    });
    clearFeedback();
  }

  function validateForm() {
    if (!form.depart.trim() || !form.destination.trim()) {
      return "Le depart et la destination sont obligatoires.";
    }

    if (form.depart.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
      return "Le depart et la destination doivent etre differents.";
    }

    const departureDate = new Date(`${form.date}T${form.time}`);

    if (Number.isNaN(departureDate.getTime())) {
      return "Choisis une date et une heure valides.";
    }

    if (departureDate <= new Date()) {
      return "Choisis une date et une heure dans le futur pour que le trajet soit visible.";
    }

    if (Number(form.seats) < 1) {
      return "Ajoute au moins une place disponible.";
    }

    if (Number(form.price) < 0) {
      return "Le prix ne peut pas etre negatif.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFeedback({ message: validationError, tone: "error" });
=======
  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.depart.trim() || !form.destination.trim()) {
      setFeedback({
        message: "Le depart et la destination sont obligatoires.",
        tone: "error",
      });
>>>>>>> origin/main
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback({ message: "", tone: "" });
      await onPublish(form);
      setFeedback({
<<<<<<< HEAD
        message: "Trajet publie. Il est maintenant visible pour les autres comptes.",
=======
        message: "Trajet publie avec succes.",
>>>>>>> origin/main
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
<<<<<<< HEAD
        subtitle="Cree une offre claire, rapide et reservable"
=======
        subtitle="Cree une annonce claire et rassurante"
>>>>>>> origin/main
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

<<<<<<< HEAD
      <form className="publish-flow" onSubmit={handleSubmit}>
        <div className="publish-compose">
          <section className="publish-card publish-card--route">
            <div className="publish-card__header">
              <div>
                <span className="eyebrow">Nouvelle course</span>
                <h3>Itineraire</h3>
              </div>
              <span className="publish-live-badge">Visible apres publication</span>
            </div>

            <div className="publish-route-fields">
              <label className="publish-field publish-field--wide">
                <span>Point de depart</span>
                <div className="publish-field__control">
                  <Icon name="location" size={18} />
                  <input
                    name="depart"
                    placeholder="Ex: Gueliz, Bab Doukkala, Massira..."
=======
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
>>>>>>> origin/main
                    type="text"
                    value={form.depart}
                    onChange={updateField}
                  />
                </div>
              </label>

<<<<<<< HEAD
              <label className="publish-field publish-field--wide">
                <span>Destination</span>
                <div className="publish-field__control">
=======
              <label className="profile-editor-field profile-editor-field--wide">
                <span className="profile-editor-field__label">Destination</span>
                <div className="profile-editor-field__control">
>>>>>>> origin/main
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
<<<<<<< HEAD
            </div>

            <label className="publish-field publish-field--wide">
              <span>Point de rendez-vous exact</span>
              <div className="publish-field__control">
                <Icon name="bookmark" size={18} />
                <input
                  name="pickupNote"
                  placeholder="Porte principale, parking, cafe proche..."
                  type="text"
                  value={form.pickupNote}
                  onChange={updateField}
                />
              </div>
            </label>
          </section>

          <section className="publish-card">
            <div className="publish-card__header">
              <div>
                <span className="eyebrow">Disponibilite</span>
                <h3>Horaire et places</h3>
              </div>
            </div>

            <div className="publish-grid">
              <label className="publish-field">
                <span>Date</span>
                <div className="publish-field__control">
                  <Icon name="calendar" size={18} />
                  <input
                    min={getDateValue(0)}
=======

              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Date</span>
                <div className="profile-editor-field__control">
                  <Icon name="calendar" size={18} />
                  <input
>>>>>>> origin/main
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={updateField}
                  />
                </div>
              </label>

<<<<<<< HEAD
              <label className="publish-field">
                <span>Heure</span>
                <div className="publish-field__control">
=======
              <label className="profile-editor-field">
                <span className="profile-editor-field__label">Heure</span>
                <div className="profile-editor-field__control">
>>>>>>> origin/main
                  <Icon name="clock" size={18} />
                  <input
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={updateField}
                  />
                </div>
              </label>
<<<<<<< HEAD
            </div>

            <div className="publish-offer-grid">
              <div className="publish-stepper">
                <span className="publish-stepper__label">Places libres</span>
                <div className="publish-stepper__control">
                  <button
                    aria-label="Diminuer les places"
                    type="button"
                    onClick={() => adjustNumber("seats", -1, 1, 8)}
                  >
                    -
                  </button>
                  <strong>{form.seats}</strong>
                  <button
                    aria-label="Augmenter les places"
                    type="button"
                    onClick={() => adjustNumber("seats", 1, 1, 8)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="publish-stepper publish-stepper--price">
                <span className="publish-stepper__label">Prix par place</span>
                <div className="publish-stepper__control">
                  <button
                    aria-label="Diminuer le prix"
                    type="button"
                    onClick={() => adjustNumber("price", -2, 0, 200)}
                  >
                    -
                  </button>
                  <strong>{form.price} DH</strong>
                  <button
                    aria-label="Augmenter le prix"
                    type="button"
                    onClick={() => adjustNumber("price", 2, 0, 200)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <label className="publish-field publish-field--wide">
              <span>Duree estimee</span>
              <div className="publish-field__control">
                <Icon name="clock" size={18} />
                <input
                  min="10"
                  name="durationMinutes"
                  step="5"
                  type="number"
                  value={form.durationMinutes}
                  onChange={updateField}
                />
              </div>
            </label>
          </section>

          <section className="publish-card">
            <div className="publish-card__header">
              <div>
                <span className="eyebrow">Confiance</span>
                <h3>Message conducteur</h3>
              </div>
            </div>

            <label className="publish-field publish-field--wide">
              <span>Description</span>
              <textarea
                name="description"
                placeholder="Ex: Je pars a l'heure, petit bagage accepte, trajet direct vers le campus."
                rows="5"
                value={form.description}
                onChange={updateField}
              />
            </label>
          </section>
        </div>

        <aside className="publish-sidebar">
          <section className="publish-preview">
            <div className="publish-preview__top">
              <div>
                <span className="eyebrow">Apercu passager</span>
                <h3>{form.price} DH</h3>
              </div>
              <span className="publish-preview__status">Offre live</span>
            </div>

            <div className="publish-driver">
              <div className="avatar-badge avatar-badge--large">{user.initials}</div>
              <div>
=======

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
>>>>>>> origin/main
                <strong>{user.name}</strong>
                <span>{user.role}</span>
                <span>{user.car}</span>
              </div>
            </div>

<<<<<<< HEAD
            <div className="publish-route-preview">
              <div>
                <span className="publish-route-preview__dot" />
                <div>
                  <strong>{form.depart || "Depart a definir"}</strong>
                  <span>{formatOfferTime(form)}</span>
                </div>
              </div>
              <div>
                <span className="publish-route-preview__dot publish-route-preview__dot--end" />
=======
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
>>>>>>> origin/main
                <div>
                  <strong>{form.destination || "Destination"}</strong>
                  <span>{form.durationMinutes} min estimees</span>
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <div className="publish-preview__stats">
              <div>
                <strong>{form.seats}</strong>
                <span>places</span>
              </div>
              <div>
                <strong>{totalPotential} DH</strong>
                <span>max</span>
              </div>
              <div>
                <strong>{form.durationMinutes}</strong>
                <span>min</span>
              </div>
            </div>

            <div className="publish-checklist">
              <span>
                <Icon name="shield" size={15} />
                Visible aux autres comptes
              </span>
              <span>
                <Icon name="ticket" size={15} />
                Reservation avec compteur places
              </span>
            </div>
=======
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
>>>>>>> origin/main

            {feedback.message ? (
              <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
                {feedback.message}
              </p>
            ) : null}

<<<<<<< HEAD
            <button className="primary-button publish-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Publication..." : "Publier maintenant"}
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
>>>>>>> Stashed changes
=======
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Publication..." : "Publier le trajet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
>>>>>>> origin/main
}
