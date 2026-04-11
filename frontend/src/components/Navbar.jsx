import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <h2 className="logo">CampusRide</h2>

      <div className="nav-icons">
        <span>🏠</span>
        <span>🔍</span>
        <span>➕</span>
        <span>👤</span>
      </div>
    </div>
  );
}

export default Navbar;