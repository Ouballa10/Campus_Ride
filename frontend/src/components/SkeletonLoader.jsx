import React from "react";

/**
 * Skeleton card loader - shows a shimmer placeholder while content loads
 */
export function SkeletonCard({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-card__row">
            <div className="skeleton skeleton--avatar" />
            <div className="skeleton-card__lines">
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--text-sm" />
            </div>
          </div>
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text-sm" style={{ width: "45%" }} />
        </div>
      ))}
    </>
  );
}

/**
 * Inline skeleton text placeholder
 */
export function SkeletonText({ width = "80%", height = "14px" }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "6px" }}
    />
  );
}

/**
 * Full page loading skeleton
 */
export function PageSkeleton() {
  return (
    <div className="screen" style={{ gap: "16px", padding: "16px 0" }}>
      <div className="skeleton skeleton--title" style={{ width: "50%" }} />
      <div className="skeleton skeleton--text" />
      <SkeletonCard count={3} />
    </div>
  );
}

export default SkeletonCard;
