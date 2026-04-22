import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import { SplashHeroArtwork } from "../components/Artwork";
import { Icon } from "../components/Icons";

export default function Splash({ navigate }) {
  const [useFallbackArtwork, setUseFallbackArtwork] = useState(false);
  const showHeader = useFallbackArtwork;

  return (
    <div className="screen screen--splash">
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
            {useFallbackArtwork ? (
              <SplashHeroArtwork />
            ) : (
              <img
                alt="CampusRide splash"
                className="splash-hero__image"
                src="/images/splash-photo.png"
                onError={() => setUseFallbackArtwork(true)}
              />
            )}
          </div>
        </div>

        <div className="splash-footer">
          <button
            className="splash-button splash-button--primary"
            type="button"
            onClick={() => navigate("login")}
          >
            <span>Commencer</span>
            <span className="splash-button__icon">
              <Icon name="arrow-right" size={24} />
            </span>
          </button>

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
          </div>
        </div>
      </div>
    </div>
  );
}
