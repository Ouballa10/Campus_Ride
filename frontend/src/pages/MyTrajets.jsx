import React from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

export default function MyTrajets({ navigate, publishedTrips, user }) {
  const activeTrips = publishedTrips.filter((trip) => trip.status === "Actif").length;
  const completedTrips = publishedTrips.filter((trip) => trip.status === "Passe").length;

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

      <section className="records-hero">
        <div>
          <span className="eyebrow">Conducteur</span>
          <h3>Suivi de tes annonces campus</h3>
          <p>
            Retrouve tes departs actifs, les trajets deja passes et l'etat des
            places restantes.
          </p>
        </div>

        <div className="summary-strip summary-strip--soft">
          <div>
            <strong>{publishedTrips.length}</strong>
            <span>annonces</span>
          </div>
          <div>
            <strong>{activeTrips}</strong>
            <span>actifs</span>
          </div>
          <div>
            <strong>{completedTrips}</strong>
            <span>passes</span>
          </div>
        </div>
      </section>

      {!publishedTrips.length ? (
        <div className="message-box">
          <strong>Aucun trajet publie pour le moment</strong>
          <p>Ton premier trajet apparaitra ici des que tu publies une annonce.</p>
        </div>
      ) : null}

      <div className="stack-list stack-list--records">
        {publishedTrips.map((trip) => (
          <article className="list-card list-card--trip" key={trip.id}>
            <div className="list-card__row">
              <div>
                <h4>{trip.route}</h4>
                <p>{trip.date} - {trip.time}</p>
              </div>
              <span className="pill">{trip.status}</span>
            </div>

            <div className="trip-card__meta">
              <span className="meta-chip">
                <Icon name="seat" size={14} />
                {trip.seats} places
              </span>
              <span className="meta-chip">
                <Icon name="ticket" size={14} />
                {trip.price} DH
              </span>
            </div>

            <p className="card-note">{trip.passengers}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
