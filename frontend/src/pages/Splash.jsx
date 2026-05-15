import React from "react";
import { Icon } from "../components/Icons";
import logo from "../assets/images/logo.png";

const splashHighlights = [
  { icon: "search", label: "Trouver" },
  { icon: "shield", label: "Verifier" },
  { icon: "send", label: "Reserver" },
];

export default function Splash({ navigate }) {
  return (
    <div className="screen screen--splash screen--splash-clean">
      <section className="splash-clean">
        <div className="splash-clean__brand">
          <img src={logo} alt="CampusRide logo" />
          <span>CampusRide</span>
        </div>

        <div className="splash-clean__visual" aria-hidden="true">
          <div className="splash-clean__map">
            <span className="splash-clean__pin splash-clean__pin--start">
              <Icon name="location" size={18} />
            </span>
            <span className="splash-clean__pin splash-clean__pin--end">
              <Icon name="check-badge" size={18} />
            </span>
            <span className="splash-clean__route" />
            <span className="splash-clean__car">
              <Icon name="car" size={44} />
            </span>
          </div>
        </div>

        <div className="splash-clean__copy">
          <h1>Ton trajet campus, bien organise.</h1>
          <p>
            Reserve ou publie un trajet avec une interface simple, claire et faite pour mobile.
          </p>
        </div>

        <div className="splash-clean__highlights">
          {splashHighlights.map((item) => (
            <span key={item.label}>
              <Icon name={item.icon} size={16} />
              {item.label}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="splash-clean__button"
          onClick={() => navigate("login")}
        >
          Commencer
          <Icon name="arrow-right" size={18} />
        </button>
      </section>
    </div>
  );
}
