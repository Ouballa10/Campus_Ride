import React, { useState } from "react";
import { Icon } from "../components/Icons";
import logo from "../assets/images/logo.png";

const slides = [
  {
    id: 1,
    gradient: "splash-gradient--blue",
    illustration: "campus-scene",
  },
  {
    id: 2,
    title: "Rapide, Fiable & Securise",
    subtitle: "Une experience pensee pour vous",
    description:
      "Reservez en quelques secondes, suivez votre conducteur en temps reel et voyagez en toute confiance.",
    icon: "shield",
    gradient: "splash-gradient--purple",
    illustration: "features",
    features: [
      { icon: "send", label: "Rapide", desc: "Reservation instantanee" },
      { icon: "shield", label: "Securise", desc: "Trajets verifies" },
      { icon: "location", label: "Partout", desc: "Tous les campus" },
    ],
  },
  {
    id: 3,
    title: "Pret a Rouler?",
    subtitle: "Rejoignez la communaute CampusRide",
    description:
      "Creez votre compte en un instant et commencez a partager vos trajets des aujourd'hui.",
    icon: "route",
    gradient: "splash-gradient--green",
    illustration: "community",
  },
];

export default function Splash({ navigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  function handleNext() {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("login");
    }
  }

  function handleSkip() {
    navigate("login");
  }

  function handleDotClick(index) {
    setCurrentSlide(index);
  }

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  // First slide has background image layout
  if (slide.illustration === "campus-scene") {
    return (
      <div className="screen screen--splash">
        <div className="splash-poster" onClick={handleNext} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}>
          <header className="splash-poster__content">
            <img src={logo} alt="CampusRide logo" className="splash-poster__logo" />

            <span className="splash-poster__divider" aria-hidden="true" />

            <h2 className="splash-poster__headline">
              Votre trajet,<br />
              <span>notre priorite</span>
            </h2>

            <p className="splash-poster__copy">
              Facilitez vos deplacements universitaires<br />en toute securite.
            </p>
          </header>

          {/* Footer: dots */}
          <div className="splash-poster__footer">
            <div className="splash-onboarding__dots">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`splash-dot ${i === currentSlide ? "splash-dot--active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); handleDotClick(i); }}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slides 2 and 3 use the original layout
  return (
    <div className="screen screen--splash">
      <div className={`splash-onboarding ${slide.gradient}`}>
        {/* Background decorations */}
        <div className="splash-onboarding__bg">
          <div className="splash-bg-circle splash-bg-circle--1" />
          <div className="splash-bg-circle splash-bg-circle--2" />
          <div className="splash-bg-circle splash-bg-circle--3" />
          <div className="splash-bg-particle splash-bg-particle--1" />
          <div className="splash-bg-particle splash-bg-particle--2" />
          <div className="splash-bg-particle splash-bg-particle--3" />
          <div className="splash-bg-particle splash-bg-particle--4" />
        </div>

        {/* Skip button */}
        {!isLast && (
          <button
            type="button"
            className="splash-onboarding__skip"
            onClick={handleSkip}
          >
            Passer
          </button>
        )}

        {/* Logo */}
        <div className="splash-onboarding__logo">
          <img src={logo} alt="CampusRide" className="splash-onboarding__logo-img" />
        </div>

        {/* Illustration area */}
        <div className="splash-onboarding__illustration">
          {slide.illustration === "features" && (
            <div className="splash-illust splash-illust--features">
              {slide.features.map((feat, i) => (
                <div className="splash-feat-card" key={feat.label} style={{ animationDelay: `${i * 0.15}s` }}>
                  <span className="splash-feat-card__icon">
                    <Icon name={feat.icon} size={28} />
                  </span>
                  <strong className="splash-feat-card__label">{feat.label}</strong>
                  <span className="splash-feat-card__desc">{feat.desc}</span>
                </div>
              ))}
            </div>
          )}

          {slide.illustration === "community" && (
            <div className="splash-illust splash-illust--community">
              <div className="splash-community-ring">
                <div className="splash-community-avatar splash-community-avatar--1">
                  <Icon name="user" size={24} />
                </div>
                <div className="splash-community-avatar splash-community-avatar--2">
                  <Icon name="user" size={24} />
                </div>
                <div className="splash-community-avatar splash-community-avatar--3">
                  <Icon name="user" size={24} />
                </div>
                <div className="splash-community-avatar splash-community-avatar--4">
                  <Icon name="user" size={24} />
                </div>
                <div className="splash-community-center">
                  <Icon name="route" size={36} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="splash-onboarding__content">
          <h1 className="splash-onboarding__title">{slide.title}</h1>
          <p className="splash-onboarding__subtitle">{slide.subtitle}</p>
          <p className="splash-onboarding__desc">{slide.description}</p>
        </div>

        {/* Footer: dots + button */}
        <div className="splash-onboarding__footer">
          <div className="splash-onboarding__dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`splash-dot ${i === currentSlide ? "splash-dot--active" : ""}`}
                onClick={() => handleDotClick(i)}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className={`splash-onboarding__btn ${isLast ? "splash-onboarding__btn--cta" : ""}`}
            onClick={handleNext}
          >
            <span>{isLast ? "Commencer" : "Suivant"}</span>
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
