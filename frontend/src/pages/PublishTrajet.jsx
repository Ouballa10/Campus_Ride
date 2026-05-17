import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import InteractiveMap from "../components/InteractiveMap";
import "../components/InteractiveMap.css";

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
    time: "07:30",
    seats: 3,
    price: 18,
    durationMinutes: 30,
    pickupNote: "",
    description: "",
  };
}

function formatOfferTime(form) {
  if (!form.date || !form.time) {
    return "Horaire a confirmer";
  }

  return `${form.date} a ${form.time}`;
}

export default function PublishTrajet({ navigate, onPublish, user }) {
  const [form, setForm] = useState(buildInitialForm);
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const totalPotential = useMemo(
    () => Number(form.price || 0) * Number(form.seats || 0),
    [form.price, form.seats],
  );

  function clearFeedback() {
    if (feedback.message) {
      setFeedback({ message: "", tone: "" });
    }
  }

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

  function handleDepartSelect(name, coords) {
    setForm((currentForm) => ({
      ...currentForm,
      depart: name || "",
    }));
    clearFeedback();
  }

  function handleDestinationSelect(name, coords) {
    setForm((currentForm) => ({
      ...currentForm,
      destination: name || "",
    }));
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
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback({ message: "", tone: "" });
      await onPublish(form);
      setFeedback({
        message: "Trajet publie. Il est maintenant visible pour les autres comptes.",
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
        subtitle="Cree une offre claire, rapide et reservable"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      <form className="publish-flow" onSubmit={handleSubmit}>
        <div className="publish-compose">
          {/* Interactive Map Section */}
          <section className="publish-card publish-card--map">
            <div className="publish-card__header">
              <div>
                <span className="eyebrow">Carte interactive</span>
                <h3>Choisis sur la carte</h3>
              </div>
              <button
                type="button"
                className="map-toggle-btn"
                onClick={() => setShowMap((v) => !v)}
              >
                <Icon name={showMap ? "x" : "route"} size={16} />
                <span>{showMap ? "Masquer" : "Carte"}</span>
              </button>
            </div>

            {showMap && (
              <InteractiveMap
                onDepartSelect={handleDepartSelect}
                onDestinationSelect={handleDestinationSelect}
                departValue={form.depart}
                destinationValue={form.destination}
              />
            )}
          </section>

          {/* Route fields (manual input still works) */}
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
                    type="text"
                    value={form.depart}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="publish-field publish-field--wide">
                <span>Destination</span>
                <div className="publish-field__control">
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
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={updateField}
                  />
                </div>
              </label>

              <label className="publish-field">
                <span>Heure</span>
                <div className="publish-field__control">
                  <Icon name="clock" size={18} />
                  <input
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={updateField}
                  />
                </div>
              </label>
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
                  <input
                    type="number"
                    name="seats"
                    min="1"
                    max="8"
                    value={form.seats}
                    onChange={updateField}
                    className="publish-stepper__input"
                  />
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
                    onClick={() => adjustNumber("price", -2, 0, 1000)}
                  >
                    -
                  </button>
                  <div className="publish-stepper__price-input">
                    <input
                      type="number"
                      name="price"
                      min="0"
                      max="1000"
                      value={form.price}
                      onChange={updateField}
                      className="publish-stepper__input"
                    />
                    <span className="publish-stepper__unit">DH</span>
                  </div>
                  <button
                    aria-label="Augmenter le prix"
                    type="button"
                    onClick={() => adjustNumber("price", 2, 0, 1000)}
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

          <section className="publish-card publish-card--compact">
            <label className="publish-field publish-field--wide">
              <span>Description (optionnel)</span>
              <textarea
                name="description"
                placeholder="Ex: Je pars a l'heure, petit bagage accepte, trajet direct vers le campus."
                rows="2"
                value={form.description}
                onChange={updateField}
              />
            </label>
          </section>
        </div>

        {feedback.message ? (
          <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
            {feedback.message}
          </p>
        ) : null}

        <div className="publish-sticky-cta">
          <div className="publish-sticky-cta__summary">
            <span>{form.seats} place(s) · {form.price} DH/place · {totalPotential} DH max</span>
          </div>
          <button className="primary-button publish-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Publication..." : "Publier maintenant"}
          </button>
        </div>
      </form>
    </div>
  );
}
