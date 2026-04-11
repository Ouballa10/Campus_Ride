import React from "react";
import "./TrajetCard.css";

function TrajetCard({ trajet }) {
  return (
    <div className="trajet-card">
      <h4>{trajet.depart} ➜ {trajet.destination}</h4>

      <p>🕒 {trajet.date}</p>
      <p>💰 {trajet.price} DH</p>

      <button>Réserver</button>
    </div>
  );
}

export default TrajetCard;