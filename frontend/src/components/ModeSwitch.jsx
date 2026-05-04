import React from "react";
import { Icon } from "./Icons";

const modes = [
  {
    id: "passenger",
    icon: "user",
    label: "Passager",
    text: "Reserver",
  },
  {
    id: "driver",
    icon: "car",
    label: "Driver",
    text: "Publier",
  },
];

export default function ModeSwitch({ mode, onChange }) {
  return (
    <div
      className={`mode-switch mode-switch--${mode === "driver" ? "driver" : "passenger"}`}
      role="tablist"
      aria-label="Mode CampusRide"
    >
      <span className="mode-switch__thumb" aria-hidden="true" />

      {modes.map((item) => {
        const isActive = mode === item.id;

        return (
          <button
            aria-pressed={isActive}
            className={`mode-switch__button ${
              isActive ? "mode-switch__button--active" : ""
            }`.trim()}
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
          >
            <span className="mode-switch__icon">
              <Icon name={item.icon} size={17} />
            </span>
            <span className="mode-switch__copy">
              <strong>{item.label}</strong>
              <small>{item.text}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
