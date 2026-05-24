import React from "react";

export default function ImageLightbox({ src, alt, onClose }) {
  if (!src) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-label={alt || "Image agrandie"}
    >
      <button
        className="lightbox-close"
        type="button"
        onClick={onClose}
        aria-label="Fermer"
      >
        ✕
      </button>
      <img
        className="lightbox-image"
        src={src}
        alt={alt || "Image"}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
