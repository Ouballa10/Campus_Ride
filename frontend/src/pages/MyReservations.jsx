import React from "react";
import AppHeader from "../components/AppHeader";

export default function MyReservations({ navigate, reservations }) {
  return (
    <div className="screen screen--records">
      <AppHeader
        title="Mes reservations"
        subtitle="Suivi des trajets confirmes"
        leftIcon="arrow-left"
        onLeftClick={() => navigate("profile")}
      />

      {!reservations.length ? (
        <div className="message-box">
          <strong>Aucune reservation pour le moment</strong>
          <p>Quand tu reserves un trajet depuis Supabase, il apparaitra ici.</p>
        </div>
      ) : null}

      <div className="stack-list stack-list--records">
        {reservations.map((reservation) => (
          <article className="list-card" key={reservation.id}>
            <div className="list-card__row">
              <div>
                <h4>{reservation.route}</h4>
                <p>{reservation.date} - {reservation.time}</p>
              </div>
              <span className="pill">{reservation.status}</span>
            </div>

            <div className="card-note">
              <strong>{reservation.driver}</strong>
              <span>{reservation.pickup}</span>
            </div>

            <div className="trip-card__bottom">
              <span className="meta-chip">{reservation.price} DH</span>
              <button
                className="mini-button mini-button--ghost"
                type="button"
                onClick={() => navigate("search")}
              >
                Rechercher encore
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
