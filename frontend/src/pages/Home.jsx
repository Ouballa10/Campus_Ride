import React from "react";
import Navbar from "../components/Navbar";
import TrajetCard from "../components/TrajetCard";
import "./Home.css";

function Home() {

  const trajets = [
    {
      depart: "UPM",
      destination: "Guéliz",
      date: "08:30",
      price: 10,
    },
    {
      depart: "UPM",
      destination: "Daoudiat",
      date: "09:00",
      price: 8,
    },
  ];

  return (
    <div className="home">

      <Navbar />

      {/* HEADER */}
      <div className="header">
        <h2>Accueil</h2>
      </div>

      {/* SEARCH */}
      <input 
        className="search"
        placeholder="🔍 Rechercher un trajet..."
      />

      {/* ACTION BUTTONS */}
      <div className="actions">
        <div className="card action green">
          <p>🔍</p>
          <span>Rechercher</span>
        </div>

        <div className="card action orange">
          <p>➕</p>
          <span>Publier</span>
        </div>
      </div>

      {/* LIST */}
      <h3 className="title">Trajets disponibles</h3>

      {trajets.map((t, i) => (
        <TrajetCard key={i} trajet={t} />
      ))}

    </div>
  );
}

export default Home;