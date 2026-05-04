import React, { useState } from "react";
import { SplashHeroArtwork } from "../components/Artwork";
import { Icon } from "../components/Icons";

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
      <div className="splash-screen splash-screen--full-image">
        <div className="splash-body splash-body--full-image">
          <div
            className="splash-hero splash-hero--full-image"
            style={{ "--splash-bg-image": `url(${slides[currentSlide].src})` }}
          >
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
          ) : (
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
          )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
