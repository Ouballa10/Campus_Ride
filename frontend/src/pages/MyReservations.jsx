import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import RatingModal from "../components/RatingModal";
import { Icon } from "../components/Icons";
import {
  getStatusIcon,
  getStatusPillClass,
  isReservationHistory,
} from "../utils/statusUi";
import { evaluationService } from "../services/evaluationService";

function ReservationSkeleton() {
  return (
    <div className="reservation-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function EmptyState({ copy, icon = "bookmark", title }) {
  return (
    <div className="empty-state-card">
      <span className="empty-state-card__icon">
        <Icon name={icon} size={22} />
      </span>
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  );
}

function ReservationStatusSection({ children, count, title, tone }) {
  return (
    <section className={`reservation-status-section reservation-status-section--${tone}`}>
      <div className="reservation-status-section__header">
        <strong>{title}</strong>
        <span>{count}</span>
      </div>
      <div className="stack-list stack-list--records">{children}</div>
    </section>
  );
}

function Timeline({ status }) {
  const steps = [
    { label: "Demande", active: true },
    { label: "Validation", active: ["Confirmee", "Terminee"].includes(status) },
    { label: "Trajet", active: status === "Terminee" },
  ];

  if (["Annulee", "Refusee"].includes(status)) {
    steps[1] = { label: status, active: true, blocked: true };
  }

  return (
    <div className="ride-timeline">
      {steps.map((step) => (
        <div
          className={[
            "ride-timeline__step",
            step.active ? "ride-timeline__step--active" : "",
            step.blocked ? "ride-timeline__step--blocked" : "",
          ].filter(Boolean).join(" ")}
          key={step.label}
        >
          <span />
          <small>{step.label}</small>
        </div>
      ))}
    </div>
  );
}

function ReservationCard({ busyId, navigate, onCancelReservation, onViewDriver, onRate, reservation }) {
  const isCancellable = ["En attente", "Confirmee"].includes(reservation.status);
  const isRatable = ["Confirmee", "Terminee"].includes(reservation.status);
  const driverHref = reservation.driverPhone ? `tel:${reservation.driverPhone}` : undefined;
  const cancelLabel = busyId === reservation.id ? "Annulation..." : "Cancel reservation";

  return (
    <article className="reservation-pro-card">
      <div className="reservation-pro-card__top">
        <div className="route-stack">
          <span>{reservation.date} - {reservation.time}</span>
          <h4>{reservation.depart}</h4>
          <Icon name="arrow-right" size={16} />
          <h4>{reservation.destination}</h4>
        </div>
        <span className={getStatusPillClass(reservation.status)}>
          <Icon name={getStatusIcon(reservation.status)} size={13} />
          {reservation.status}
        </span>
      </div>

      <Timeline status={reservation.status} />

      <div className="reservation-driver-card">
        <div
          className="avatar-badge avatar-badge--clickable"
          role="button"
          tabIndex={0}
          title={`Voir le profil de ${reservation.driver}`}
          onClick={() => onViewDriver?.(reservation)}
        >
          {reservation.driverAvatar ? (
            <img alt={reservation.driver} src={reservation.driverAvatar} />
          ) : (
            reservation.driverInitials
          )}
        </div>
        <div>
          <strong
            className="trip-card__driver-name"
            role="button"
            tabIndex={0}
            onClick={() => onViewDriver?.(reservation)}
          >
            {reservation.driver}
          </strong>
          <span>{reservation.pickup}</span>
        </div>
      </div>

      <div className="reservation-facts">
        <span>
          <Icon name="ticket" size={14} />
          {reservation.price} DH
        </span>
        <span>
          <Icon name="seat" size={14} />
          {reservation.seats} seats
        </span>
        <span>
          <Icon name="location" size={14} />
          Meeting point
        </span>
      </div>

      {reservation.message ? (
        <div className="message-box message-box--soft">
          <strong>Ta note</strong>
          <p>{reservation.message}</p>
        </div>
      ) : null}

      <div className="reservation-card-actions">
        <button className="mini-button mini-button--ghost" type="button" onClick={() => onViewDriver?.(reservation)}>
          <Icon name="user" size={15} />
          Profil driver
        </button>
        {isRatable ? (
          <button className="mini-button mini-button--star" type="button" onClick={() => onRate?.(reservation)}>
            <Icon name="star" size={15} />
            Evaluer
          </button>
        ) : null}
        <a
          className={`mini-button mini-button--ghost ${!driverHref ? "mini-button--disabled" : ""}`}
          href={driverHref}
          onClick={(event) => {
            if (!driverHref) event.preventDefault();
          }}
        >
          <Icon name="phone" size={15} />
          Contact driver
        </a>
        <button
          className="mini-button mini-button--danger"
          disabled={!isCancellable || busyId === reservation.id}
          type="button"
          onClick={() => onCancelReservation(reservation.id)}
        >
          <Icon name="x" size={15} />
          {isCancellable ? cancelLabel : reservation.status}
        </button>
      </div>
    </article>
  );
}

export default function MyReservations({
  navigate,
  onCancelReservation,
  onViewDriver,
  reservations,
  sessionUserId,
  tripOptions = [],
}) {
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });
  const [isRefreshing] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);

  const groupedReservations = useMemo(() => ({
    confirmed: reservations.filter((reservation) => reservation.status === "Confirmee"),
    history: reservations.filter((reservation) => isReservationHistory(reservation.status)),
    pending: reservations.filter((reservation) => reservation.status === "En attente"),
  }), [reservations]);

  async function handleCancelReservation(reservationId) {
    try {
      setBusyId(reservationId);
      setFeedback({ message: "", tone: "" });
      await onCancelReservation(reservationId);
      setFeedback({
        message: "Reservation annulee avec succes.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: error.message || "Annulation impossible pour le moment.",
        tone: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  function handleViewDriverFromReservation(reservation) {
    // Build driver data from reservation + tripOptions
    const matchingTrip = tripOptions.find((t) => t.id === reservation.trajetId);
    const driverData = matchingTrip || {
      conducteurId: reservation.conducteurId || "",
      driver: reservation.driver,
      driverInitials: reservation.driverInitials || "",
      driverAvatar: reservation.driverAvatar || "",
      driverPhone: reservation.driverPhone || "",
      car: "",
      rating: 0,
    };
    onViewDriver?.(driverData);
  }

  function handleRate(reservation) {
    setRatingTarget(reservation);
  }

  async function handleSubmitRating({ rating, comment }) {
    if (!ratingTarget) return;

    const matchingTrip = tripOptions.find((t) => t.id === ratingTarget.trajetId);
    const conducteurId = matchingTrip?.conducteurId || ratingTarget.conducteurId || "";

    if (!conducteurId || !sessionUserId) {
      throw new Error("Impossible d'identifier le conducteur ou ton compte.");
    }

    await evaluationService.submitEvaluation({
      trajetId: ratingTarget.trajetId,
      conducteurId,
      passagerId: sessionUserId,
      note: rating,
      commentaire: comment,
    });

    setFeedback({ message: "Evaluation envoyee ! Merci.", tone: "success" });
  }

  return (
    <div className="screen screen--records">
      <AppHeader
        title="Mes reservations"
        subtitle="Demandes, trajets confirmes et historique"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("profile")}
      />

      <section className="records-hero records-hero--passenger">
        <div>
          <span className="eyebrow">Passager</span>
          <h3>Tableau de bord reservations</h3>
          <p>
            Suis le statut de chaque demande, contacte le conducteur et garde ton point de rendez-vous sous la main.
          </p>
        </div>

        <div className="summary-strip summary-strip--soft">
          <div>
            <strong>{reservations.length}</strong>
            <span>au total</span>
          </div>
          <div>
            <strong>{groupedReservations.confirmed.length}</strong>
            <span>confirmees</span>
          </div>
          <div>
            <strong>{groupedReservations.pending.length}</strong>
            <span>en attente</span>
          </div>
        </div>
      </section>

      {feedback.message ? (
        <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
          {feedback.message}
        </p>
      ) : null}

      {isRefreshing ? (
        <div className="stack-list stack-list--records">
          <ReservationSkeleton />
          <ReservationSkeleton />
        </div>
      ) : null}

      {!reservations.length ? (
        <EmptyState
          copy="Quand tu reserves un trajet, il apparait ici avec son conducteur, son statut et les actions utiles."
          title="Aucune reservation pour le moment"
        />
      ) : (
        <div className="reservation-page-board">
          <ReservationStatusSection
            count={groupedReservations.pending.length}
            title="Pending requests"
            tone="pending"
          >
            {groupedReservations.pending.length ? groupedReservations.pending.map((reservation) => (
              <ReservationCard
                busyId={busyId}
                key={reservation.id}
                navigate={navigate}
                reservation={reservation}
                onCancelReservation={handleCancelReservation}
                onViewDriver={handleViewDriverFromReservation}
                onRate={handleRate}
              />
            )) : (
              <EmptyState copy="Aucune demande en attente." icon="clock" title="Tout est clair" />
            )}
          </ReservationStatusSection>

          <ReservationStatusSection
            count={groupedReservations.confirmed.length}
            title="Confirmed trips"
            tone="confirmed"
          >
            {groupedReservations.confirmed.length ? groupedReservations.confirmed.map((reservation) => (
              <ReservationCard
                busyId={busyId}
                key={reservation.id}
                navigate={navigate}
                reservation={reservation}
                onCancelReservation={handleCancelReservation}
                onViewDriver={handleViewDriverFromReservation}
                onRate={handleRate}
              />
            )) : (
              <EmptyState copy="Les trajets valides par un conducteur apparaitront ici." icon="check-badge" title="Aucun trajet confirme" />
            )}
          </ReservationStatusSection>

          <ReservationStatusSection
            count={groupedReservations.history.length}
            title="Canceled / refused / completed"
            tone="history"
          >
            {groupedReservations.history.length ? groupedReservations.history.map((reservation) => (
              <ReservationCard
                busyId={busyId}
                key={reservation.id}
                navigate={navigate}
                reservation={reservation}
                onCancelReservation={handleCancelReservation}
                onViewDriver={handleViewDriverFromReservation}
                onRate={handleRate}
              />
            )) : (
              <EmptyState copy="Aucun trajet archive pour le moment." icon="shield" title="Historique vide" />
            )}
          </ReservationStatusSection>
        </div>
      )}

      {ratingTarget ? (
        <RatingModal
          driverName={ratingTarget.driver}
          onClose={() => setRatingTarget(null)}
          onSubmit={handleSubmitRating}
        />
      ) : null}
    </div>
  );
}
