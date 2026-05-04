import React, { useState } from "react";
import { SplashHeroArtwork } from "../components/Artwork";
<<<<<<< HEAD
import { Icon } from "../components/Icons";
<<<<<<< Updated upstream
=======

const splashHighlights = [
  {
    icon: "send",
    title: "Rapide",
    copy: "Trouvez votre trajet en quelques clics.",
  },
  {
    icon: "shield",
    title: "Securise",
    copy: "Vos trajets sont verifies et rassurants.",
  },
  {
    icon: "location",
    title: "Partout",
    copy: "Disponible sur tous les campus.",
  },
];
>>>>>>> Stashed changes
=======
>>>>>>> 2ecf0db849ce921d2d053d93173074987598e222

export default function Splash({ navigate }) {
  const [useFallbackArtwork, setUseFallbackArtwork] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      src: "/images/splash-photo.png",
      alt: "CampusRide splash",
      imageClassName: "splash-hero__image--slide-one",
    },
    {
      src: "/images/splash-page-2.png",
      alt: "CampusRide search splash",
      imageClassName: "splash-hero__image--slide-two",
    },
  ];

  function handleNext() {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((previous) => previous + 1);
      return;
    }

    navigate("login");
  }

  function handleDotClick(index) {
    if (index < slides.length) {
      setCurrentSlide(index);
      return;
    }

    navigate("login");
  }

  return (
    <div className="screen screen--splash">
<<<<<<< HEAD
<<<<<<< Updated upstream
      <div className="splash-screen">
        <div className="splash-orb splash-orb--left" aria-hidden="true" />
        <div className="splash-orb splash-orb--right" aria-hidden="true" />

        <div className="splash-body">
          {showHeader ? (
            <div className="splash-header">
              <img className="splash-header__logo" src={logo} alt="CampusRide logo" />
              <h1 className="splash-wordmark">
                <span>Campus</span>
                <span>Ride</span>
              </h1>
              <p className="splash-tagline">
                Facilitez vos deplacements universitaires en toute securite.
              </p>
            </div>
          ) : null}

          <div className={`splash-hero ${showHeader ? "" : "splash-hero--image-only"}`.trim()}>
=======
      <div className="splash-screen splash-screen--full-image">
        <div className="splash-body splash-body--full-image">
          <div
            className="splash-hero splash-hero--full-image"
            style={{ "--splash-bg-image": `url(${slides[currentSlide].src})` }}
          >
>>>>>>> Stashed changes
=======
      <div className="splash-screen splash-screen--full-image">
        <div className="splash-body splash-body--full-image">
          <div className="splash-hero splash-hero--full-image">
>>>>>>> 2ecf0db849ce921d2d053d93173074987598e222
            {useFallbackArtwork ? (
              <SplashHeroArtwork />
            ) : (
              <img
                alt={slides[currentSlide].alt}
                className={`splash-hero__image ${slides[currentSlide].imageClassName}`.trim()}
                src={slides[currentSlide].src}
                onError={() => setUseFallbackArtwork(true)}
              />
            )}
          </div>
        </div>

<<<<<<< HEAD
<<<<<<< Updated upstream
        <div className="splash-footer">
=======
        <div className="splash-footer splash-footer--overlay">
>>>>>>> 2ecf0db849ce921d2d053d93173074987598e222
          <button
            type="button"
            className="splash-next-chip"
            onClick={handleNext}
          >
            <span className="splash-next-chip__label">Suivant</span>
            <span className="splash-next-chip__icon" aria-hidden="true">
              &rarr;
            </span>
          </button>
<<<<<<< HEAD

          <button
            className="splash-button splash-button--secondary"
            type="button"
            onClick={() => navigate("register")}
          >
            <Icon name="user" size={20} />
            <span>Creer un compte</span>
          </button>

          <p className="splash-login">
            <span>Deja un compte ?</span>
            <button type="button" onClick={() => navigate("login")}>
              Se connecter
            </button>
          </p>

          <div className="splash-dots" aria-hidden="true">
            <span className="splash-dots__item splash-dots__item--active" />
            <span className="splash-dots__item" />
            <span className="splash-dots__item" />
=======
        <div className="splash-footer splash-footer--overlay">
          {currentSlide === 0 ? (
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
          ) : null}
          {currentSlide > 0 ? (
            <button
              type="button"
              className="splash-next-chip"
              onClick={handleNext}
            >
              <span className="splash-next-chip__label">Suivant</span>
              <span className="splash-next-chip__icon" aria-hidden="true">
                &rarr;
              </span>
            </button>
          ) : null}
=======
>>>>>>> 2ecf0db849ce921d2d053d93173074987598e222
          <div className="splash-dots" aria-label="Navigation des pages">
            <button
              type="button"
              className={`splash-dots__item ${currentSlide === 0 ? "splash-dots__item--active" : ""}`.trim()}
              onClick={() => handleDotClick(0)}
              aria-label="Aller a la premiere page"
              aria-pressed={currentSlide === 0}
            />
            <button
              type="button"
              className={`splash-dots__item ${currentSlide === 1 ? "splash-dots__item--active" : ""}`.trim()}
              onClick={() => handleDotClick(1)}
              aria-label="Aller a la deuxieme page"
              aria-pressed={currentSlide === 1}
            />
            <button
              type="button"
              className="splash-dots__item"
              onClick={() => handleDotClick(2)}
              aria-label="Aller a la page de connexion"
            />
<<<<<<< HEAD
>>>>>>> Stashed changes
=======
>>>>>>> 2ecf0db849ce921d2d053d93173074987598e222
          </div>
        </div>
      </div>
    </div>
  );
}
