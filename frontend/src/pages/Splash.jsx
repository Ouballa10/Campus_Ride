import React, { useState } from "react";
import { SplashHeroArtwork } from "../components/Artwork";

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

  return (
    <div className="screen screen--splash">
      <div className="splash-screen splash-screen--full-image">
        <div className="splash-body splash-body--full-image">
          <div className="splash-hero splash-hero--full-image">
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

        <div
          className="splash-footer splash-footer--overlay"
          onClick={handleNext}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handleNext();
            }
          }}
        >
          <div className="splash-dots" aria-hidden="true">
            <span className={`splash-dots__item ${currentSlide === 0 ? "splash-dots__item--active" : ""}`.trim()} />
            <span className={`splash-dots__item ${currentSlide === 1 ? "splash-dots__item--active" : ""}`.trim()} />
            <span className="splash-dots__item" />
          </div>
        </div>
      </div>
    </div>
  );
}
