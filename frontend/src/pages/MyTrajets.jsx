import React from "react";
import AppHeader from "../components/AppHeader";

export default function MyTrajets({ navigate, user, publishedTrips }) {
  return (
    <div className="screen screen--records">
      <AppHeader
        title="Mes trajets"
        subtitle={`${user.name} - conducteur campus`}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("profile")}
      />

      <div className="summary-strip summary-strip--soft">
        <div>
          <strong>{publishedTrips.length}</strong>
          <span>annonces</span>
        </div>
        <div>
          <strong>7</strong>
          <span>passagers</span>
        </div>
        <div>
          <strong>4.8</strong>
          <span>note moyenne</span>
        </div>
      </div>

      <div className="stack-list stack-list--records">
        {publishedTrips.map((trip) => (
          <article className="list-card" key={trip.id}>
            <div className="list-card__row">
              <div>
                <h4>{trip.route}</h4>
                <p>{trip.date} - {trip.time}</p>
              </div>
              <span className="pill">{trip.status}</span>
            </div>

            <div className="trip-card__meta">
              <span className="meta-chip">{trip.seats} places</span>
              <span className="meta-chip">{trip.price} DH</span>
            </div>

            <p className="card-note">{trip.passengers}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
