import React from "react";
import { Icon } from "./Icons";

const fields = [
  {
    key: "depart",
    label: "Depart",
    icon: "location",
    placeholder: "Ex: Gueliz",
    type: "text",
  },
  {
    key: "destination",
    label: "Destination",
    icon: "route",
    placeholder: "Ex: UPM",
    type: "text",
  },
  {
    key: "date",
    label: "Date",
    icon: "calendar",
    placeholder: "",
    type: "date",
  },
  {
    key: "time",
    label: "Heure minimum",
    icon: "clock",
    placeholder: "",
    type: "time",
  },
];

export default function SearchBar({ values, onChange, onReset }) {
  return (
    <div className="search-form-card">
      <div className="section-heading section-heading--compact">
        <div>
          <h3>Filtrer les trajets</h3>
          <p>Recherche rapide par zone, date et horaire campus.</p>
        </div>

        <button className="text-link" type="button" onClick={onReset}>
          Reinitialiser
        </button>
      </div>

      <div className="search-form-grid">
        {fields.map((field) => (
          <label className="profile-editor-field" key={field.key}>
            <span className="profile-editor-field__label">{field.label}</span>
            <div className="profile-editor-field__control">
              <Icon name={field.icon} size={18} />
              <input
                name={field.key}
                placeholder={field.placeholder}
                type={field.type}
                value={values[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
