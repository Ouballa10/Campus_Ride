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

  // First slide has a completely custom layout
  if (slide.illustration === "campus-scene") {
    return (
      <div className="screen screen--splash">
        <div className="splash-campus-scene">
          {/* Sky background with gradient and light effects */}
          <div className="splash-campus-scene__sky">
            <div className="splash-sky__glow splash-sky__glow--1" />
            <div className="splash-sky__glow splash-sky__glow--2" />
            <div className="splash-sky__cloud splash-sky__cloud--1" />
            <div className="splash-sky__cloud splash-sky__cloud--2" />
            <div className="splash-sky__cloud splash-sky__cloud--3" />
            {/* Floating particles */}
            <div className="splash-sky__particle splash-sky__particle--1" />
            <div className="splash-sky__particle splash-sky__particle--2" />
            <div className="splash-sky__particle splash-sky__particle--3" />
            <div className="splash-sky__particle splash-sky__particle--4" />
            <div className="splash-sky__particle splash-sky__particle--5" />
          </div>

          {/* Skip button */}
          <button
            type="button"
            className="splash-onboarding__skip"
            onClick={handleSkip}
          >
            Passer
          </button>

          {/* Top content: Logo + text */}
          <div className="splash-campus-scene__header">
            <img src={logo} alt="CampusRide" className="splash-campus-scene__logo" />
            <h1 className="splash-campus-scene__brand">CampusRide</h1>
            <div className="splash-campus-scene__divider" />
            <h2 className="splash-campus-scene__slogan">
              Votre trajet, <span>notre priorite</span>
            </h2>
            <p className="splash-campus-scene__subtitle">
              Facilitez vos deplacements universitaires en toute securite
            </p>
          </div>

          {/* Campus cityscape illustration */}
          <div className="splash-campus-scene__cityscape">
            {/* Buildings left side */}
            <div className="splash-city__building splash-city__building--1">
              <div className="splash-city__windows">
                <span /><span /><span />
                <span /><span /><span />
                <span /><span /><span />
                <span /><span /><span />
              </div>
            </div>
            <div className="splash-city__building splash-city__building--2">
              <div className="splash-city__windows">
                <span /><span />
                <span /><span />
                <span /><span />
                <span /><span />
                <span /><span />
              </div>
            </div>

            {/* Center tower / university */}
            <div className="splash-city__building splash-city__building--center">
              <div className="splash-city__tower-top" />
              <div className="splash-city__windows splash-city__windows--center">
                <span /><span /><span />
                <span /><span /><span />
                <span /><span /><span />
              </div>
            </div>

            {/* Buildings right side */}
            <div className="splash-city__building splash-city__building--3">
              <div className="splash-city__windows">
                <span /><span />
                <span /><span />
                <span /><span />
                <span /><span />
              </div>
            </div>
            <div className="splash-city__building splash-city__building--4">
              <div className="splash-city__windows">
                <span /><span /><span />
                <span /><span /><span />
                <span /><span /><span />
              </div>
            </div>

            {/* Trees */}
            <div className="splash-city__trees">
              <span className="splash-city__tree" />
              <span className="splash-city__tree" />
              <span className="splash-city__tree" />
              <span className="splash-city__tree" />
            </div>

            {/* Road */}
            <div className="splash-city__road">
              <div className="splash-city__road-line" />
              <div className="splash-city__road-line" />
              <div className="splash-city__road-line" />
              <div className="splash-city__road-line" />
            </div>

            {/* Car */}
            <div className="splash-city__car">
              <div className="splash-city__car-body">
                <div className="splash-city__car-roof" />
                <div className="splash-city__car-window splash-city__car-window--front" />
                <div className="splash-city__car-window splash-city__car-window--rear" />
                <div className="splash-city__car-light splash-city__car-light--front" />
                <div className="splash-city__car-light splash-city__car-light--rear" />
              </div>
              <div className="splash-city__car-wheel splash-city__car-wheel--left" />
              <div className="splash-city__car-wheel splash-city__car-wheel--right" />
              <div className="splash-city__car-shadow" />
            </div>

            {/* Location pin */}
            <div className="splash-city__pin">
              <Icon name="location" size={16} />
            </div>
          </div>

          {/* Footer: dots + button */}
          <div className="splash-campus-scene__footer">
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
              className="splash-onboarding__btn"
              onClick={handleNext}
            >
              <span>Suivant</span>
              <Icon name="arrow-right" size={18} />
            </button>
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
