import React, { useState } from "react";
import styles from "./ButtonDropdown.module.scss";
import { Arrow } from "../assets/icons/Arrow";
import cn from "classnames";

export function ButtonDropdown({ children, label, disabled, onClick }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <div
      className={cn(styles.wrapper, {
        [styles.disabled]: disabled,
      })}
      tabIndex={1}
      onBlur={() => setOpen(false)}
      onClick={() => isOpen && setOpen(false)}
    >
      <button
        className={cn(styles.buttonText)}
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </button>

      {children ? (
        <div
          onClick={() => !disabled && setOpen(!isOpen)}
          className={cn(styles.buttonIcon, {
            [styles.buttonIconOpen]: isOpen,
            [styles.disabled]: disabled,
          })}
        >
          <Arrow />
        </div>
      ) : null}

      {isOpen && <div className={cn(styles.itemButtons)}>{children}</div>}
    </div>
  );
}
