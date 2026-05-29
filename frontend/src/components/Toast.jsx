import React, { useEffect, useState } from "react";
import { Icon } from "./Icons";

/**
 * Toast notification component
 * Usage: <Toast message="Success!" type="success" onClose={() => {}} />
 */
export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible || !message) return null;

  const iconName = type === "success" ? "check" : type === "error" ? "x" : "bell";

  return (
    <div className={`toast toast--${type}`}>
      <Icon name={iconName} size={16} />
      <span>{message}</span>
    </div>
  );
}
