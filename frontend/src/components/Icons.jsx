import React from "react";

function iconPaths(name) {
  if (name === "menu") {
    return (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    );
  }

  if (name === "search") {
    return (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.2-4.2" />
      </>
    );
  }

  if (name === "plus") {
    return (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    );
  }

  if (name === "home") {
    return (
      <>
        <path d="m4 11 8-6 8 6" />
        <path d="M7 10v8h10v-8" />
      </>
    );
  }

  if (name === "route") {
    return (
      <>
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="17" cy="17" r="2.5" />
        <path d="M9.5 7h4a3.5 3.5 0 0 1 0 7h-3" />
      </>
    );
  }

  if (name === "user") {
    return (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
      </>
    );
  }

  if (name === "calendar") {
    return (
      <>
        <rect x="4" y="6" width="16" height="14" rx="3" />
        <path d="M8 4v4" />
        <path d="M16 4v4" />
        <path d="M4 10h16" />
      </>
    );
  }

  if (name === "clock") {
    return (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.5l3 1.5" />
      </>
    );
  }

  if (name === "car") {
    return (
      <>
        <path d="M5 14.5h14l-1.2-4.4a2 2 0 0 0-1.9-1.5H8.1a2 2 0 0 0-1.9 1.5Z" />
        <path d="M6 14.5V17" />
        <path d="M18 14.5V17" />
        <circle cx="8" cy="17" r="1.6" />
        <circle cx="16" cy="17" r="1.6" />
      </>
    );
  }

  if (name === "seat") {
    return (
      <>
        <path d="M8 6v6a2 2 0 0 0 2 2h5" />
        <path d="M8 12h8a3 3 0 0 1 3 3v1" />
        <path d="M8 18v-3" />
      </>
    );
  }

  if (name === "chat") {
    return (
      <>
        <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      </>
    );
  }

  if (name === "chevron-right") {
    return <path d="m9 6 6 6-6 6" />;
  }

  if (name === "arrow-left") {
    return (
      <>
        <path d="m14 6-6 6 6 6" />
        <path d="M9 12h9" />
      </>
    );
  }

  if (name === "arrow-right") {
    return (
      <>
        <path d="m10 6 6 6-6 6" />
        <path d="M6 12h10" />
      </>
    );
  }

  if (name === "logout") {
    return (
      <>
        <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
        <path d="m14 8 4 4-4 4" />
        <path d="M18 12H9" />
      </>
    );
  }

  if (name === "ticket") {
    return (
      <>
        <path d="M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
        <path d="M10 6v12" />
      </>
    );
  }

  if (name === "bookmark") {
    return (
      <>
        <path d="M7 5h10a1 1 0 0 1 1 1v13l-6-3-6 3V6a1 1 0 0 1 1-1Z" />
      </>
    );
  }

  if (name === "location") {
    return (
      <>
        <path d="M12 20s6-4.9 6-10a6 6 0 1 0-12 0c0 5.1 6 10 6 10Z" />
        <circle cx="12" cy="10" r="2.3" />
      </>
    );
  }

  if (name === "camera") {
    return (
      <>
        <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6h1.8l1.1-1.6h3.2L14.7 6h1.8A2.5 2.5 0 0 1 19 8.5v7A2.5 2.5 0 0 1 16.5 18h-9A2.5 2.5 0 0 1 5 15.5Z" />
        <circle cx="12" cy="12" r="3.2" />
      </>
    );
  }

  if (name === "mail") {
    return (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2.5" />
        <path d="m5.5 8.5 6.5 5 6.5-5" />
      </>
    );
  }

  if (name === "phone") {
    return (
      <>
        <path d="M7.5 4.5h2a1.5 1.5 0 0 1 1.4 1l.8 2.3a1.5 1.5 0 0 1-.4 1.6l-1 1a13.5 13.5 0 0 0 3.3 3.3l1-1a1.5 1.5 0 0 1 1.6-.4l2.3.8a1.5 1.5 0 0 1 1 1.4v2A1.5 1.5 0 0 1 18 19.5h-1c-6.9 0-12.5-5.6-12.5-12.5v-1A1.5 1.5 0 0 1 6 4.5Z" />
      </>
    );
  }

  if (name === "edit") {
    return (
      <>
        <path d="m14.5 5.5 4 4" />
        <path d="M4 20h4.5L19 9.5a1.8 1.8 0 0 0 0-2.5l-2-2a1.8 1.8 0 0 0-2.5 0L4 15.5Z" />
      </>
    );
  }

  if (name === "check-badge") {
    return (
      <>
        <path d="m12 3 2 2.1 2.8-.3 1.2 2.6 2.5 1.4-.8 2.7.8 2.7-2.5 1.4-1.2 2.6-2.8-.3L12 21l-2-2.1-2.8.3-1.2-2.6L3.5 15l.8-2.7-.8-2.7L6 8.2l1.2-2.6 2.8.3Z" />
        <path d="m9.3 12.2 1.8 1.8 3.8-4" />
      </>
    );
  }

  if (name === "send") {
    return (
      <>
        <path d="M4 11.5 20 4l-5.5 16-2.8-5.7Z" />
        <path d="M11.7 14.3 20 4" />
      </>
    );
  }

  if (name === "shield") {
    return (
      <>
        <path d="m12 4 7 3v4.8c0 4.4-2.9 6.9-7 8.2-4.1-1.3-7-3.8-7-8.2V7Z" />
        <path d="m9.5 12 1.7 1.7 3.5-3.7" />
      </>
    );
  }

  if (name === "star") {
    return (
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8Z" />
    );
  }

  return (
    <>
      <circle cx="12" cy="12" r="8" />
    </>
  );
}

export function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths(name)}
    </svg>
  );
}

export function Stars({ value }) {
  const filledStars = Math.round(value);

  return (
    <div className="stars" aria-label={`${value} sur 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          className={`stars__item ${
            index < filledStars ? "stars__item--filled" : ""
          }`}
          key={index}
        >
          <Icon name="star" size={14} />
        </span>
      ))}
    </div>
  );
}
