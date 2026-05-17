import React, { useState } from "react";
import { Icon } from "./Icons";

export default function RatingModal({ driverName, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit() {
    if (rating === 0) {
      setFeedback("Choisis au moins 1 etoile.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback("");
      await onSubmit({ rating, comment: comment.trim() });
      onClose();
    } catch (err) {
      setFeedback(err.message || "Impossible d'envoyer l'evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rating-modal__close" type="button" onClick={onClose}>
          <Icon name="x" size={20} />
        </button>

        <div className="rating-modal__header">
          <Icon name="star" size={28} />
          <h3>Evaluer {driverName}</h3>
          <p>Comment s'est passe ton trajet ?</p>
        </div>

        <div className="rating-modal__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              className={`rating-star ${star <= (hoveredStar || rating) ? "rating-star--active" : ""}`}
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
              aria-label={`${star} etoile${star > 1 ? "s" : ""}`}
            >
              <Icon name="star" size={32} />
            </button>
          ))}
        </div>

        <p className="rating-modal__label">
          {rating === 0 && "Touche une etoile"}
          {rating === 1 && "Mauvais"}
          {rating === 2 && "Pas top"}
          {rating === 3 && "Correct"}
          {rating === 4 && "Bien"}
          {rating === 5 && "Excellent !"}
        </p>

        <textarea
          className="rating-modal__comment"
          placeholder="Un commentaire ? (optionnel)"
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {feedback ? (
          <p className="rating-modal__feedback">{feedback}</p>
        ) : null}

        <div className="rating-modal__actions">
          <button
            className="mini-button mini-button--ghost"
            type="button"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="primary-button"
            disabled={rating === 0 || isSubmitting}
            type="button"
            onClick={handleSubmit}
          >
            {isSubmitting ? "Envoi..." : "Envoyer l'evaluation"}
          </button>
        </div>
      </div>
    </div>
  );
}
