import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/main.css";
import logo from "../assets/images/logo.png";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/home");
    }, 3000);
  }, []);

  return (
    <div className="splash-screen">
      <div className="splash-hero-image">
        <img src={logo} alt="CampusRide logo" className="logo logo--hero" />
      </div>
      <h1 className="title">
        Campus<span>Ride</span>
      </h1>
      <p className="subtitle">
        Facilitez vos déplacements universitaires
      </p>
    </div>
  );
}

export default Splash;