import React from "react";

/**
 * Skeleton loading placeholder components
 */

export function SkeletonText({ width = "70%" }) {
  return <div className="skeleton skeleton--text" style={{ width }} />;
}

export function SkeletonTitle({ width = "55%" }) {
  return <div className="skeleton skeleton--title" style={{ width }} />;
}

export function SkeletonAvatar() {
  return <div className="skeleton skeleton--avatar" />;
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__row">
        <div className="skeleton skeleton--avatar" />
        <div className="skeleton-card__lines">
          <div className="skeleton skeleton--title" style={{ width: "60%" }} />
          <div className="skeleton skeleton--text" style={{ width: "80%" }} />
        </div>
      </div>
      <div className="skeleton skeleton--text" style={{ width: "90%" }} />
      <div className="skeleton skeleton--text-short" style={{ width: "45%" }} />
    </div>
  );
}

export function SkeletonTripCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__row" style={{ justifyContent: "space-between" }}>
        <div className="skeleton skeleton--title" style={{ width: "40%" }} />
        <div className="skeleton skeleton--text-short" style={{ width: "20%" }} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div className="skeleton" style={{ width: "80px", height: "28px", borderRadius: "999px" }} />
        <div className="skeleton" style={{ width: "80px", height: "28px", borderRadius: "999px" }} />
        <div className="skeleton" style={{ width: "60px", height: "28px", borderRadius: "999px" }} />
      </div>
      <div className="skeleton-card__row">
        <div className="skeleton skeleton--avatar" style={{ width: "36px", height: "36px" }} />
        <div className="skeleton-card__lines">
          <div className="skeleton skeleton--text" style={{ width: "50%" }} />
          <div className="skeleton skeleton--text-short" style={{ width: "35%" }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="stack-list" style={{ gap: "14px" }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonTripCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonCard;
