import React, { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import {
  getStatusIcon,
  getStatusPillClass,
  isReservationHistory,
} from "../utils/statusUi";

const dashboardViews = [
  { id: "overview", label: "Apercu", icon: "home" },
  { id: "active", label: "Actifs", icon: "route" },
  { id: "requests", label: "Demandes", icon: "clock" },
  { id: "confirmed", label: "Confirmes", icon: "user" },
  { id: "closed", label: "Archives", icon: "shield" },
];

function DriverStat({ active, icon, label, onClick, value }) {
  return (
    <button
      className={`driver-stat-card ${active ? "driver-stat-card--active" : ""}`}
      type="button"
      onClick={onClick}
    >
      <span>
        <Icon name={icon} size={18} />
      </span>
      <strong>{value}</strong>
      <small>{label}</small>
    </button>
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
  const [activeView, setActiveView] = useState("overview");
  const [selectedPassengerContext, setSelectedPassengerContext] = useState(null);

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

  const filteredTrips = useMemo(() => {
    if (activeView === "active") {
      return publishedTrips.filter((trip) => ["Actif", "Nouveau", "Complet"].includes(trip.status));
    }

    if (activeView === "requests") {
      return publishedTrips.filter((trip) =>
        (trip.passengerReservations || []).some((reservation) => reservation.status === "En attente"),
      );
    }

    if (activeView === "confirmed") {
      return publishedTrips.filter((trip) =>
        (trip.passengerReservations || []).some((reservation) => reservation.status === "Confirmee"),
      );
    }

    if (activeView === "closed") {
      return publishedTrips.filter((trip) =>
        ["Passe", "Terminee", "Annulee", "Ferme"].includes(trip.status) ||
        (trip.passengerReservations || []).some((reservation) => isReservationHistory(reservation.status)),
      );
    }

    return publishedTrips;
  }, [activeView, publishedTrips]);

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
      return;
    }

    setFeedback({
      message: "Ce passager n'a pas encore renseigne son numero.",
      tone: "error",
    });
  }

  function openPassengerProfile(trip, reservation) {
    setSelectedPassengerContext({ reservation, trip });
  }

  function closePassengerProfile() {
    setSelectedPassengerContext(null);
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
          <h3>Tableau de bord</h3>
          <p>
            Garde une vue nette sur tes departs, demandes passagers, places restantes et revenus estimes.
          </p>
        </div>

        <div className="driver-stats-grid">
          <DriverStat active={activeView === "active"} icon="route" label="trajets actifs" value={stats.activeTrips} onClick={() => setActiveView("active")} />
          <DriverStat active={activeView === "closed"} icon="check-badge" label="termines" value={stats.completedTrips} onClick={() => setActiveView("closed")} />
          <DriverStat active={activeView === "requests"} icon="clock" label="en attente" value={stats.pendingRequests} onClick={() => setActiveView("requests")} />
          <DriverStat active={activeView === "confirmed"} icon="user" label="confirmes" value={stats.confirmedPassengers} onClick={() => setActiveView("confirmed")} />
          <DriverStat active={activeView === "closed"} icon="shield" label="annules/fermes" value={stats.canceledTrips} onClick={() => setActiveView("closed")} />
          <DriverStat active={activeView === "overview"} icon="ticket" label="gains estimes" value={`${stats.earnings} DH`} onClick={() => setActiveView("overview")} />
        </div>
      </section>

      <div className="dashboard-view-tabs" aria-label="Filtrer le dashboard conducteur">
        {dashboardViews.map((view) => (
          <button
            className={activeView === view.id ? "dashboard-view-tabs__button dashboard-view-tabs__button--active" : "dashboard-view-tabs__button"}
            key={view.id}
            type="button"
            onClick={() => setActiveView(view.id)}
          >
            <Icon name={view.icon} size={15} />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

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

      {publishedTrips.length && !filteredTrips.length ? (
        <div className="empty-state-card">
          <span className="empty-state-card__icon">
            <Icon name="search" size={22} />
          </span>
          <strong>Aucun resultat dans cette vue</strong>
          <p>Choisis un autre onglet pour voir tes trajets, demandes ou passagers confirmes.</p>
        </div>
      ) : null}

      <div className="stack-list stack-list--records driver-trip-grid">
        {filteredTrips.map((trip) => {
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
                  {trip.seats} places
                </span>
                <span>
                  <Icon name="user" size={14} />
                  {trip.reservationsCount || reservations.length} reservations
                </span>
                <span>
                  <Icon name="ticket" size={14} />
                  {trip.earningsEstimate || 0} DH
                </span>
              </div>

              <div className="confirmed-avatar-strip">
                {confirmedReservations.slice(0, 5).map((reservation) => (
                  <PassengerAvatar key={reservation.id} passenger={reservation} />
                ))}
                {!confirmedReservations.length ? (
                  <span>Aucun passager confirme</span>
                ) : (
                  <span>{confirmedReservations.length} passager(s) confirme(s)</span>
                )}
              </div>

              <div className="driver-trip-actions">
                <button className="mini-button mini-button--ghost" type="button" onClick={() => navigate("publish")}>
                  <Icon name="edit" size={15} />
                  Modifier
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
                  Fermer
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
                  Supprimer
                </button>
              </div>

              <div className="reservation-board">
                {(activeView === "overview" || activeView === "requests") ? (
                <ReservationGroup
                  count={pendingReservations.length}
                  label="Demandes"
                  title="Demandes en attente"
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
                          Accepter
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
                          Refuser
                        </button>
                      )}
                      onContact={() => contactPassenger(reservation)}
                      onViewProfile={() => openPassengerProfile(trip, reservation)}
                    />
                  )) : (
                    <EmptyPanel text="Les nouvelles demandes apparaitront ici." title="Aucune demande en attente" />
                  )}
                </ReservationGroup>
                ) : null}

                {(activeView === "overview" || activeView === "confirmed") ? (
                <ReservationGroup
                  count={confirmedReservations.length}
                  label="Confirmes"
                  title="Passagers confirmes"
                  tone="confirmed"
                >
                  {confirmedReservations.length ? confirmedReservations.map((reservation) => (
                    <PassengerRow
                      key={reservation.id}
                      reservation={reservation}
                      onContact={() => contactPassenger(reservation)}
                      onViewProfile={() => openPassengerProfile(trip, reservation)}
                    />
                  )) : (
                    <EmptyPanel text="Aucun passager confirme sur ce depart." title="Liste vide" />
                  )}
                </ReservationGroup>
                ) : null}

                {(activeView === "closed" || activeView === "overview") && historyReservations.length ? (
                  <ReservationGroup
                    count={historyReservations.length}
                    label="Archive"
                    title="Annules / refuses / termines"
                    tone="history"
                  >
                    {historyReservations.map((reservation) => (
                      <PassengerRow
                        key={reservation.id}
                        reservation={reservation}
                        onContact={() => contactPassenger(reservation)}
                        onViewProfile={() => openPassengerProfile(trip, reservation)}
                      />
                    ))}
                  </ReservationGroup>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {selectedPassengerContext ? (
        <div className="passenger-profile-modal" role="dialog" aria-modal="true">
          <button
            aria-label="Fermer le profil passager"
            className="passenger-profile-modal__backdrop"
            type="button"
            onClick={closePassengerProfile}
          />
          <section className="passenger-profile-card">
            <div className="passenger-profile-card__header">
              <PassengerAvatar passenger={selectedPassengerContext.reservation} />
              <div>
                <span className="eyebrow">Profil passager</span>
                <h3>{selectedPassengerContext.reservation.passenger}</h3>
                <p>{selectedPassengerContext.reservation.campus || selectedPassengerContext.reservation.phone || "Informations limitees"}</p>
              </div>
              <button className="icon-button" type="button" onClick={closePassengerProfile}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="passenger-profile-card__route">
              <span>{selectedPassengerContext.trip.route}</span>
              <strong>{selectedPassengerContext.trip.date} - {selectedPassengerContext.trip.time}</strong>
            </div>

            <div className="passenger-profile-card__facts">
              <span className={getStatusPillClass(selectedPassengerContext.reservation.status)}>
                <Icon name={getStatusIcon(selectedPassengerContext.reservation.status)} size={13} />
                {selectedPassengerContext.reservation.status}
              </span>
              <span>
                <Icon name="phone" size={14} />
                {selectedPassengerContext.reservation.phone || "Telephone non renseigne"}
              </span>
            </div>

            {selectedPassengerContext.reservation.message ? (
              <div className="message-box message-box--soft">
                <strong>Message passager</strong>
                <p>{selectedPassengerContext.reservation.message}</p>
              </div>
            ) : null}

            <div className="passenger-profile-card__actions">
              {selectedPassengerContext.reservation.status === "En attente" ? (
                <>
                  <button
                    className="mini-button"
                    disabled={busyAction === `accept-${selectedPassengerContext.reservation.id}`}
                    type="button"
                    onClick={() => runAction(
                      `accept-${selectedPassengerContext.reservation.id}`,
                      () => onConfirmReservation(selectedPassengerContext.reservation.id),
                      "Demande confirmee.",
                    )}
                  >
                    Accepter
                  </button>
                  <button
                    className="mini-button mini-button--danger"
                    disabled={busyAction === `reject-${selectedPassengerContext.reservation.id}`}
                    type="button"
                    onClick={() => runAction(
                      `reject-${selectedPassengerContext.reservation.id}`,
                      () => onRejectReservation(selectedPassengerContext.reservation.id),
                      "Demande refusee.",
                    )}
                  >
                    Refuser
                  </button>
                </>
              ) : null}
              <button
                className="mini-button mini-button--ghost"
                type="button"
                onClick={() => contactPassenger(selectedPassengerContext.reservation)}
              >
                <Icon name="phone" size={14} />
                Contact
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
