import React from "react";
import styles from "./InputBlock.module.scss";
import cn from "classnames";

export function InputBlock({ value, placeholder, disabled, onChange }) {
  return (
    <input
      disabled={disabled}
      className={cn(styles.input)}
      type="text"
      value={value ? value : ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
