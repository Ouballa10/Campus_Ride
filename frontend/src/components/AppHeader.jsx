import React from "react";
import { Icon } from "./Icons";
import logo from "../assets/images/logo.png";

export default function AppHeader({
  title,
  subtitle,
  leftIcon,
  onLeftClick,
  rightLabel,
  rightIcon,
  onRightClick,
}) {
  return (
    <header className="app-header">
      <button className="icon-button" type="button" onClick={onLeftClick}>
        <Icon name={leftIcon} size={18} />
      </button>

      <div className="app-header__copy">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      {rightLabel || rightIcon ? (
        <button className="text-link" type="button" onClick={onRightClick}>
          {rightLabel ? <span>{rightLabel}</span> : null}
          {rightIcon ? <Icon name={rightIcon} size={16} /> : null}
        </button>
      ) : (
        <span className="app-header__brand" aria-hidden="true">
          <img alt="" className="app-header__brand-logo" src={logo} />
        </span>
      )}
    </header>
  );
}
