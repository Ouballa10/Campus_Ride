import React, { useEffect, useState } from "react";
import { Icon } from "../components/Icons";
import logo from "../assets/images/logo.png";

const splashHighlights = [
  {
    icon: "send",
    title: "Rapide",
    copy: "Reservez en quelques clics.",
  },
  {
    icon: "shield",
    title: "Securise",
    copy: "Trajets fiables et verifies.",
  },
  {
    icon: "location",
    title: "Campus",
    copy: "Partout ou vous etudiez.",
  },
];

export default function Splash({ navigate }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="screen screen--splash">
      <div className="splash-showcase">
        <div className="splash-showcase__panel">
          <header className="splash-showcase__header">
            <img src={logo} alt="CampusRide logo" className="splash-showcase__logo" />
            <h1>Vos trajets campus simplifies</h1>
            <p>
              Trouvez un conducteur fiable ou proposez vos places disponibles en toute serenite.
            </p>
          </header>

          <div className="splash-showcase__media">
            <img
              alt="CampusRide"
              className="splash-showcase__image"
              src="/images/splash-photo.png"
            />
          </div>

          <div className="splash-highlights" aria-label="Points forts">
            {splashHighlights.map((item, i) => (
              <article
                className="splash-highlight-card"
                key={item.title}
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <span className="splash-highlight-card__icon">
                  <Icon name={item.icon} size={20} />
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
              <span>Commencer</span>
              <Icon name="arrow-right" size={18} />
            </button>

            <div className="splash-dots" aria-label="Navigation">
              <span className="splash-dots__item splash-dots__item--soft" aria-hidden="true" />
              <button
                type="button"
                className="splash-dots__item splash-dots__item--active"
                onClick={() => navigate("login")}
                aria-label="Connexion"
              />
              <span className="splash-dots__item splash-dots__item--soft" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
