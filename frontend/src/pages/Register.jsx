import React from "react";
import logo from "../assets/images/logo.png";
import { WelcomeArtwork } from "../components/Artwork";

export default function Register({ navigate }) {
  return (
    <div className="screen screen--welcome">
      <div className="welcome-brand">
        <img className="welcome-brand__logo" src={logo} alt="CampusRide logo" />
        <div>
          <span className="eyebrow">Campus mobility</span>
          <h1>CampusRide</h1>
        </div>
      </div>

      <div className="welcome-copy">
        <h2>Facilitez vos deplacements universitaires</h2>
        <p>
          Trouvez et proposez des trajets facilement et en toute securite avec
          une interface simple, moderne et mobile.
        </p>
      </div>

      <WelcomeArtwork />

      <button
        className="primary-button primary-button--wide"
        type="button"
        onClick={() => navigate("home")}
      >
        S'inscrire
      </button>

      <button
        className="text-link text-link--center"
        type="button"
        onClick={() => navigate("home")}
      >
        Connexion
      </button>
    </div>
  );
}
