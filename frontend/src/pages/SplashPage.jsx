import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/main.css";
import logo from "../assets/images/logo.png";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/home");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="splash-screen">
      <div className="splash-screen__sky-glow" />
      <div className="splash-screen__sunburst" />
      <div className="splash-screen__arc" />

      <div className="splash-cloud splash-cloud--left" />
      <div className="splash-cloud splash-cloud--right" />
      <div className="splash-cloud splash-cloud--far-left" />

      <div className="splash-grid-mark splash-grid-mark--left" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className="splash-plus splash-plus--left" aria-hidden="true" />
      <div className="splash-plus splash-plus--right" aria-hidden="true" />
      <div className="splash-plus splash-plus--soft" aria-hidden="true" />

      <section className="splash-content">
        <img src={logo} alt="CampusRide logo" className="splash-content__logo" />

        <div className="splash-content__photo-frame">
          <img
            src="/images/splash-photo.jpeg"
            alt="CampusRide splash visual"
            className="splash-content__photo"
          />
        </div>

        <h1 className="splash-content__brand">
          Campus<span>Ride</span>
        </h1>

        <span className="splash-content__divider" aria-hidden="true" />

        <h2 className="splash-content__headline">
          Votre trajet,
          <span>notre priorite</span>
        </h2>

        <p className="splash-content__copy">
          Facilitez vos deplacements universitaires en toute securite.
        </p>
      </section>

      <section className="splash-campus" aria-hidden="true">
        <div className="splash-campus__haze" />
        <div className="splash-campus__tower" />
        <div className="splash-campus__building splash-campus__building--left">
          <span className="splash-campus__sign">UNIVERSITE</span>
        </div>
        <div className="splash-campus__building splash-campus__building--right" />

        <div className="splash-campus__trees">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="splash-campus__ground" />

        <div className="splash-campus__car">
          <div className="splash-campus__car-body">
            <span className="splash-campus__car-window splash-campus__car-window--front" />
            <span className="splash-campus__car-window splash-campus__car-window--rear" />
            <span className="splash-campus__car-light splash-campus__car-light--left" />
            <span className="splash-campus__car-light splash-campus__car-light--right" />
            <span className="splash-campus__car-badge">CampusRide</span>
          </div>
          <span className="splash-campus__wheel splash-campus__wheel--left" />
          <span className="splash-campus__wheel splash-campus__wheel--right" />
          <span className="splash-campus__car-shadow" />
        </div>

        <div className="splash-campus__pin">
          <span className="splash-campus__pin-core" />
        </div>
      </section>
    </div>
  );
}

export default Splash;
