import type { Component, JSXElement } from "solid-js";

import styles from "./Row.module.css";

type RowProps = {
  children: JSXElement;
};

export const Row: Component<RowProps> = ({ children }) => {
  return <div class={styles["container"]}>{children}</div>;
};
