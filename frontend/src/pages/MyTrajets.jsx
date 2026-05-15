import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import {
  getStatusIcon,
  getStatusPillClass,
  isReservationHistory,
} from "../utils/statusUi";

function DriverStat({ icon, label, value }) {
  return (
    <div className="driver-stat-card">
      <span>
        <Icon name={icon} size={18} />
      </span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function PassengerAvatar({ passenger }) {
  return (
    <div className="avatar-badge">
      {passenger.passengerAvatar ? (
        <img alt={passenger.passenger} src={passenger.passengerAvatar} />
      ) : (
        passenger.passengerInitials
      )}
    </div>
  );
}

function PassengerRow({
  action,
  onContact,
  onViewProfile,
  reservation,
  secondaryAction,
}) {
  return (
    <div className="passenger-row passenger-row--pro" key={reservation.id}>
      <PassengerAvatar passenger={reservation} />
      <div className="passenger-row__copy">
        <strong>{reservation.passenger}</strong>
        <span>{reservation.phone || reservation.campus || "Contact non renseigne"}</span>
        {reservation.message ? <p>{reservation.message}</p> : null}
      </div>
      <div className="passenger-row__actions">
        <span className={getStatusPillClass(reservation.status)}>
          <Icon name={getStatusIcon(reservation.status)} size={13} />
          {reservation.status}
        </span>
        {action}
        {secondaryAction}
        <button className="mini-button mini-button--ghost" type="button" onClick={onContact}>
          <Icon name="phone" size={14} />
          Contact
        </button>
        <button className="mini-button mini-button--ghost" type="button" onClick={onViewProfile}>
          <Icon name="user" size={14} />
          Profile
        </button>
      </div>
    </div>
  );
}

function ReservationGroup({ children, count, label, title, tone }) {
  return (
    <section className={`reservation-group reservation-group--${tone}`}>
      <div className="reservation-group__header">
        <div>
          <span>{label}</span>
          <strong>{title}</strong>
        </div>
        <b>{count}</b>
      </div>
      <div className="passenger-list">{children}</div>
    </section>
  );
}

function EmptyPanel({ text, title }) {
  return (
    <div className="reservation-empty reservation-empty--pro">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export default function MyTrajets({
  navigate,
  onCloseTrip,
  onConfirmReservation,
  onDeleteTrip,
  onRejectReservation,
  publishedTrips,
  user,
}) {
  const [busyAction, setBusyAction] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "" });

  const stats = useMemo(() => {
    const passengerReservations = publishedTrips.flatMap(
      (trip) => trip.passengerReservations || [],
    );
    const activeTrips = publishedTrips.filter((trip) => trip.status === "Actif").length;
    const completedTrips = publishedTrips.filter((trip) =>
      ["Passe", "Terminee"].includes(trip.status),
    ).length;
    const canceledTrips = publishedTrips.filter((trip) =>
      ["Annulee", "Ferme"].includes(trip.status),
    ).length;
    const confirmedPassengers = passengerReservations.filter(
      (reservation) => reservation.status === "Confirmee",
    ).length;
    const pendingRequests = passengerReservations.filter(
      (reservation) => reservation.status === "En attente",
    ).length;
    const earnings = publishedTrips.reduce(
      (total, trip) => total + Number(trip.earningsEstimate || 0),
      0,
    );

    return {
      activeTrips,
      canceledTrips,
      completedTrips,
      confirmedPassengers,
      earnings,
      pendingRequests,
    };
  }, [publishedTrips]);

  async function runAction(actionKey, action, successMessage) {
    try {
      setBusyAction(actionKey);
      setFeedback({ message: "", tone: "" });
      await action();
      setFeedback({ message: successMessage, tone: "success" });
    } catch (error) {
      setFeedback({
        message: error.message || "Action impossible pour le moment.",
        tone: "error",
      });
    } finally {
      setBusyAction("");
    }
  }

  function contactPassenger(reservation) {
    if (reservation.phone) {
      window.location.href = `tel:${reservation.phone}`;
    }
  }

  return (
    <div className="screen screen--records">
      <AppHeader
        title="Mes trajets"
        subtitle={`${user.name} - espace conducteur`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("profile")}
        rightLabel="Publier"
        rightIcon="plus"
        onRightClick={() => navigate("publish")}
      />

      <section className="records-hero records-hero--driver">
        <div>
          <span className="eyebrow">Conducteur</span>
          <h3>Driver dashboard</h3>
          <p>
            Garde une vue nette sur tes departs, demandes passagers, places restantes et revenus estimes.
          </p>
        </div>

        <div className="driver-stats-grid">
          <DriverStat icon="route" label="active rides" value={stats.activeTrips} />
          <DriverStat icon="check-badge" label="completed" value={stats.completedTrips} />
          <DriverStat icon="clock" label="pending requests" value={stats.pendingRequests} />
          <DriverStat icon="user" label="confirmed" value={stats.confirmedPassengers} />
          <DriverStat icon="shield" label="canceled/closed" value={stats.canceledTrips} />
          <DriverStat icon="ticket" label="estimated earnings" value={`${stats.earnings} DH`} />
        </div>
      </section>

      {feedback.message ? (
        <p className={`profile-editor-status profile-editor-status--${feedback.tone}`}>
          {feedback.message}
        </p>
      ) : null}

      {!publishedTrips.length ? (
        <div className="empty-state-card">
          <span className="empty-state-card__icon">
            <Icon name="route" size={22} />
          </span>
          <strong>Aucun trajet publie</strong>
          <p>Publie ton premier depart pour recevoir des demandes passagers.</p>
          <button className="mini-button" type="button" onClick={() => navigate("publish")}>
            <Icon name="plus" size={15} />
            Publier un trajet
          </button>
        </div>
      ) : null}

      <div className="stack-list stack-list--records driver-trip-grid">
        {publishedTrips.map((trip) => {
          const reservations = trip.passengerReservations || [];
          const confirmedReservations = reservations.filter(
            (reservation) => reservation.status === "Confirmee",
          );
          const pendingReservations = reservations.filter(
            (reservation) => reservation.status === "En attente",
          );
          const historyReservations = reservations.filter((reservation) =>
            isReservationHistory(reservation.status),
          );

          return (
            <article className="driver-trip-card" key={trip.id}>
              <div className="driver-trip-card__header">
                <div className="route-stack">
                  <span>{trip.date} - {trip.time}</span>
                  <h4>{trip.depart || trip.route}</h4>
                  <Icon name="arrow-right" size={16} />
                  <h4>{trip.destination || ""}</h4>
                </div>
                <span className={getStatusPillClass(trip.status)}>
                  <Icon name={getStatusIcon(trip.status)} size={13} />
                  {trip.status}
                </span>
              </div>

              <div className="driver-trip-metrics">
                <span>
                  <Icon name="seat" size={14} />
                  {trip.seats} seats
                </span>
                <span>
                  <Icon name="user" size={14} />
                  {trip.reservationsCount || reservations.length} reservations
                </span>
                <span>
                  <Icon name="ticket" size={14} />
                  {trip.earningsEstimate || 0} DH estimated
                </span>
              </div>

              <div className="confirmed-avatar-strip">
                {confirmedReservations.slice(0, 5).map((reservation) => (
                  <PassengerAvatar key={reservation.id} passenger={reservation} />
                ))}
                {!confirmedReservations.length ? (
                  <span>Aucun passager confirme</span>
                ) : (
                  <span>{confirmedReservations.length} confirmed passengers</span>
                )}
              </div>

              <div className="driver-trip-actions">
                <button className="mini-button mini-button--ghost" type="button" onClick={() => navigate("publish")}>
                  <Icon name="edit" size={15} />
                  Edit
                </button>
                <button
                  className="mini-button mini-button--ghost"
                  disabled={busyAction === `close-${trip.id}` || ["Ferme", "Passe", "Terminee"].includes(trip.status)}
                  type="button"
                  onClick={() => runAction(
                    `close-${trip.id}`,
                    () => onCloseTrip(trip.id),
                    "Reservations fermees pour ce trajet.",
                  )}
                >
                  <Icon name="shield" size={15} />
                  Close reservations
                </button>
                <button
                  className="mini-button mini-button--danger"
                  disabled={busyAction === `delete-${trip.id}`}
                  type="button"
                  onClick={() => runAction(
                    `delete-${trip.id}`,
                    () => onDeleteTrip(trip.id),
                    "Trajet supprime.",
                  )}
                >
                  <Icon name="x" size={15} />
                  Delete
                </button>
              </div>

              <div className="reservation-board">
                <ReservationGroup
                  count={pendingReservations.length}
                  label="Demandes"
                  title="Pending passenger requests"
                  tone="pending"
                >
                  {pendingReservations.length ? pendingReservations.map((reservation) => (
                    <PassengerRow
                      action={(
                        <button
                          className="mini-button"
                          disabled={busyAction === `accept-${reservation.id}`}
                          type="button"
                          onClick={() => runAction(
                            `accept-${reservation.id}`,
                            () => onConfirmReservation(reservation.id),
                            "Demande confirmee.",
                          )}
                        >
                          Accept
                        </button>
                      )}
                      key={reservation.id}
                      reservation={reservation}
                      secondaryAction={(
                        <button
                          className="mini-button mini-button--danger"
                          disabled={busyAction === `reject-${reservation.id}`}
                          type="button"
                          onClick={() => runAction(
                            `reject-${reservation.id}`,
                            () => onRejectReservation(reservation.id),
                            "Demande refusee.",
                          )}
                        >
                          Reject
                        </button>
                      )}
                      onContact={() => contactPassenger(reservation)}
                      onViewProfile={() => navigate("profile")}
                    />
                  )) : (
                    <EmptyPanel text="Les nouvelles demandes apparaitront ici." title="Aucune demande en attente" />
                  )}
                </ReservationGroup>

                <ReservationGroup
                  count={confirmedReservations.length}
                  label="Confirmes"
                  title="Confirmed passengers"
                  tone="confirmed"
                >
                  {confirmedReservations.length ? confirmedReservations.map((reservation) => (
                    <PassengerRow
                      key={reservation.id}
                      reservation={reservation}
                      onContact={() => contactPassenger(reservation)}
                      onViewProfile={() => navigate("profile")}
                    />
                  )) : (
                    <EmptyPanel text="Aucun passager confirme sur ce depart." title="Liste vide" />
                  )}
                </ReservationGroup>

                {historyReservations.length ? (
                  <ReservationGroup
                    count={historyReservations.length}
                    label="Archive"
                    title="Canceled / refused / completed"
                    tone="history"
                  >
                    {historyReservations.map((reservation) => (
                      <PassengerRow
                        key={reservation.id}
                        reservation={reservation}
                        onContact={() => contactPassenger(reservation)}
                        onViewProfile={() => navigate("profile")}
                      />
                    ))}
                  </ReservationGroup>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
