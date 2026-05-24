import React from "react";
import { Icon } from "./Icons";
import logo from "../assets/images/logo.png";
import { useMenuContext } from "../context/MenuContext";
import AppMenu from "./AppMenu";

export default function AppHeader({
  title,
  subtitle,
  leftSlot,
  leftIcon,
  onLeftClick,
  rightSlot,
  rightLabel,
  rightIcon,
  onRightClick,
}) {
  const menuProps = useMenuContext();

  // Default right slot: show AppMenu (hamburger) if no custom rightSlot is provided
  let rightContent;
  if (rightSlot) {
    rightContent = rightSlot;
  } else if (rightLabel || rightIcon) {
    rightContent = (
      <button className="text-link" type="button" onClick={onRightClick}>
        {rightLabel ? <span>{rightLabel}</span> : null}
        {rightIcon ? <Icon name={rightIcon} size={16} /> : null}
      </button>
    );
  } else if (menuProps) {
    rightContent = <AppMenu {...menuProps} />;
  } else {
    rightContent = (
      <span className="app-header__brand" aria-hidden="true">
        <img alt="" className="app-header__brand-logo" src={logo} />
      </span>
    );
  }

  return (
    <header className="app-header">
      {leftSlot ? (
        leftSlot
      ) : leftIcon ? (
        <button className="icon-button" type="button" onClick={onLeftClick}>
          <Icon name={leftIcon} size={18} />
        </button>
      ) : (
        <span className="app-header__spacer" aria-hidden="true" />
      )}

      <div className="app-header__copy">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      {rightContent}
    </header>
  );
}
