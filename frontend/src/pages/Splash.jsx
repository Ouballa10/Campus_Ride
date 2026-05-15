import React from "react";
import { Icon } from "../components/Icons";
import logo from "../assets/images/logo.png";

const splashHighlights = [
  {
    icon: "send",
    title: "Rapide",
    copy: "Reservez un trajet en quelques clics.",
  },
  {
    icon: "shield",
    title: "Securise",
    copy: "Des trajets fiables pour votre campus.",
  },
  {
    icon: "location",
    title: "Partout",
    copy: "Disponible la ou vos etudes vous menent.",
  },
];

export default function Splash({ navigate }) {
  return (
    <div className="screen screen--splash">
      <div className="splash-showcase">
        <div className="splash-showcase__panel">
          <div className="splash-showcase__ornament splash-showcase__ornament--left" aria-hidden="true" />
          <div className="splash-showcase__ornament splash-showcase__ornament--right" aria-hidden="true" />

          <header className="splash-showcase__header">
            <img src={logo} alt="CampusRide logo" className="splash-showcase__logo" />
            <h1>CampusRide simplifie vos trajets universitaires</h1>
            <p>
              Accedez rapidement a vos deplacements campus, trouvez un conducteur
              fiable et voyagez en toute serenite.
            </p>
          </header>

          <div className="splash-showcase__media">
            <img
              alt="CampusRide splash"
              className="splash-showcase__image"
              src="/images/splash-photo.png"
            />
          </div>

          <div className="splash-highlights" aria-label="Points forts CampusRide">
            {splashHighlights.map((item) => (
              <article className="splash-highlight-card" key={item.title}>
                <span className="splash-highlight-card__icon">
                  <Icon name={item.icon} size={24} />
                </span>
                <strong>{item.title}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>

          <div className="splash-showcase__footer">
            <button
              type="button"
              className="splash-showcase__button"
              onClick={() => navigate("login")}
            >
              <span>Suivant</span>
              <Icon name="arrow-right" size={18} />
            </button>

            <div className="splash-dots splash-dots--showcase" aria-label="Navigation des pages">
              <span className="splash-dots__item splash-dots__item--soft" aria-hidden="true" />
              <button
                type="button"
                className="splash-dots__item splash-dots__item--active"
                onClick={() => navigate("login")}
                aria-label="Aller a la page de connexion"
                aria-pressed="true"
              />
              <span className="splash-dots__item splash-dots__item--soft" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
