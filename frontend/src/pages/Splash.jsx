import React from "react";
import logo from "../assets/images/logo.png";
import { WelcomeArtwork } from "../components/Artwork";

export default function Splash({ navigate }) {
  return (
    <div className="screen screen--splash">
      <div className="splash-card">
        <div className="splash-brand">
          <img className="splash-brand__logo" src={logo} alt="CampusRide logo" />
          <h1>CampusRide</h1>
        </div>

        <div className="splash-copy">
          <h2>Facilitez vos deplacements universitaires</h2>
          <p>Une application mobile simple pour covoiturer entre campus en toute securite.</p>
        </div>

        <div className="splash-visual">
          <div className="splash-visual__halo" aria-hidden="true" />
          <div className="splash-visual__art">
            <WelcomeArtwork />
          </div>
        </div>

        <p className="splash-caption">
          Trouvez et proposez des trajets facilement et en toute securite.
        </p>

        <div className="splash-actions">
          <button
            className="primary-button primary-button--auth"
            type="button"
            onClick={() => navigate("register")}
          >
            S'INSCRIRE
          </button>

          <button
            className="text-link text-link--center"
            type="button"
            onClick={() => navigate("login")}
          >
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}
