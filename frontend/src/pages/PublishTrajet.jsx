import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import InteractiveMap from "../components/InteractiveMap";
import "../components/InteractiveMap.css";

const numberFields = ["seats", "price", "durationMinutes"];
const numberFieldsSet = new Set(numberFields);

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

  // Check if profile is complete enough to publish (driver requirements)
  const missingFields = [];
  if (!user?.name || user.name === "CampusRide") missingFields.push("Nom complet");
  if (!user?.phone) missingFields.push("Téléphone");
  if (!user?.vehicle?.make && !user?.vehicle?.model) missingFields.push("Véhicule (marque/modèle)");
  if (!user?.vehicle?.plate) missingFields.push("Plaque d'immatriculation");
  if (!user?.vehicle?.license) missingFields.push("Numéro de permis");
  if (!user?.vehicle?.photos || user.vehicle.photos.length === 0) missingFields.push("Photo du véhicule (min 1)");
  const profileIncomplete = missingFields.length > 0;

  const totalPotential = useMemo(
    () => (Number(form.price) || 0) * (Number(form.seats) || 0),
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
      [name]: numberFieldsSet.has(name) ? value : value,
    }));
    clearFeedback();
  }

  function handleNumberBlur(event) {
    const { name, value } = event.target;
    if (numberFieldsSet.has(name)) {
      setForm((currentForm) => ({
        ...currentForm,
        [name]: Number(value) || 0,
      }));
    }
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
        message: "Trajet publié. Il est maintenant visible pour les autres comptes.",
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

  if (profileIncomplete) {
    return (
      <div className="screen screen--publish">
        <AppHeader
          title="Publier un trajet"
          subtitle="Profil incomplet"
          leftIcon="arrow-left"
          onLeftClick={() => navigate("home")}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              border: "1.5px solid #e5e7eb",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              padding: "36px 28px",
              textAlign: "center",
              width: "100%",
              maxWidth: "360px",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🚫</div>
            <h3 style={{ marginBottom: "8px", color: "#1f2937", fontSize: "1.1rem" }}>
              Complète ton profil d'abord
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Pour publier un trajet, les passagers ont besoin de savoir qui tu es. Il te manque :
            </p>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "28px" }}>
              {missingFields.map((field) => (
                <li key={field} style={{ color: "#ef4444", fontSize: "0.9rem", marginBottom: "6px" }}>
                  <strong>• {field}</strong>
                </li>
              ))}
            </ul>
            <button
              className="primary-button"
              type="button"
              onClick={() => navigate("profile")}
              style={{ width: "100%", display: "block", margin: "0 auto" }}
            >
              Compléter mon profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--publish">
      <AppHeader
        title="Publier un trajet"
        subtitle="Créez une offre claire et réservable"
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

          {/* Route fields */}
          <section className="publish-card publish-card--route">
            <div className="publish-card__header">
              <div>
                <span className="eyebrow">Itinéraire</span>
                <h3>D'où à où ?</h3>
              </div>
              <span className="publish-live-badge">
                <Icon name="check-badge" size={12} /> Visible après publication
              </span>
            </div>

            <div className="publish-route-fields">
              <label className="publish-field publish-field--wide">
                <span>Point de départ</span>
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
                  placeholder="Porte principale, parking, café proche..."
                  type="text"
                  value={form.pickupNote}
                  onChange={updateField}
                />
              </div>
            </label>
          </section>

          {/* Schedule & Seats */}
          <section className="publish-card">
            <div className="publish-card__header">
              <div>
                <span className="eyebrow">Disponibilité</span>
                <h3>Horaire & places</h3>
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
                    onBlur={handleNumberBlur}
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
                      onBlur={handleNumberBlur}
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
              <span>Durée estimée (min)</span>
              <div className="publish-field__control">
                <Icon name="clock" size={18} />
                <input
                  min="10"
                  name="durationMinutes"
                  step="5"
                  type="number"
                  value={form.durationMinutes}
                  onChange={updateField}
                  onBlur={handleNumberBlur}
                />
              </div>
            </label>
          </section>

          {/* Description */}
          <section className="publish-card publish-card--compact">
            <label className="publish-field publish-field--wide">
              <span>Description (optionnel)</span>
              <textarea
                name="description"
                placeholder="Ex: Je pars à l'heure, petit bagage accepté, trajet direct vers le campus."
                rows="3"
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
            <span><Icon name="seat" size={14} /> {form.seats} place(s)</span>
            <span><Icon name="ticket" size={14} /> {form.price} DH/place</span>
            <span><strong>{totalPotential} DH</strong> max</span>
          </div>
          <button className="primary-button publish-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Publication..." : "Publier maintenant"}
          </button>
        </div>
      </form>
    </div>
  );
}
