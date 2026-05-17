import React, { useState, useEffect } from "react";
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
    title: "Recherchez votre trajet",
    titleHighlight: "en quelques clics",
    subtitle: "Indiquez votre point de départ et votre destination, nous trouvons le meilleur trajet pour vous.",
    gradient: "splash-gradient--purple",
    illustration: "search-bg",
    features: [
      { icon: "send", label: "Rapidité", desc: "Trouvez votre trajet en quelques secondes." },
      { icon: "shield", label: "Fiabilité", desc: "Des trajets vérifiés pour une sécurité maximale." },
      { icon: "location", label: "Flexibilité", desc: "Disponible pour tous les campus, à tout moment." },
    ],
  },
  {
    id: 3,
    title: "Votre mobilité,",
    titleHighlight: "simplifiée au quotidien",
    subtitle: "Réservez, suivez et profitez d'un trajet sûr, confortable et adapté à votre emploi du temps.",
    bottomText: "Prêt à bouger ?",
    bottomHighlight: "CampusRide est là pour vous.",
    icon: "route",
    gradient: "splash-gradient--green",
    illustration: "mobility-bg",
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

  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        navigate("login");
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const posterClass = [
    "splash-poster",
    slide.illustration === "search-bg" ? "splash-poster--2" : "",
    slide.illustration === "mobility-bg" ? "splash-poster--3" : "",
    "splash-poster--animated",
  ].filter(Boolean).join(" ");

  return (
    <div className="screen screen--splash">
      <div
        key={slide.id}
        className={posterClass}
        onClick={handleNext}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
      >
        {/* Shimmer light effect */}
        <div className="splash-poster__shimmer" aria-hidden="true" />

        <header className="splash-poster__content">
          <img src={logo} alt="CampusRide logo" className="splash-poster__logo splash-anim-logo" />

          <span className="splash-poster__divider splash-anim-divider" aria-hidden="true" />

          <h2 className="splash-poster__headline splash-anim-headline">
            {slide.title || "Votre trajet,"}<br />
            <span>{slide.titleHighlight || "notre priorité"}</span>
          </h2>

          <p className="splash-poster__copy splash-anim-copy">
            {slide.subtitle || "Facilitez vos déplacements universitaires en toute sécurité."}
          </p>
        </header>

        {/* Features (page 2 only) */}
        {slide.features && (
          <div className="splash-poster__features splash-anim-features">
            {slide.features.map((feat, i) => (
              <div className="splash-poster__feat splash-anim-feat" key={feat.label} style={{ animationDelay: `${0.8 + i * 0.12}s` }}>
                <span className="splash-poster__feat-icon">
                  <Icon name={feat.icon} size={24} />
                </span>
                <strong>{feat.label}</strong>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Bottom text (page 3 only) */}
        {slide.bottomText && (
          <div className="splash-poster__bottom-text splash-anim-bottom">
            <p>{slide.bottomText}<br /><span>{slide.bottomHighlight}</span></p>
          </div>
        )}

        {/* Skip button (page 1 only) */}
        {currentSlide === 0 && (
          <button
            type="button"
            className="splash-poster__skip"
            onClick={(e) => { e.stopPropagation(); navigate("login"); }}
          >
            Passer
          </button>
        )}

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
