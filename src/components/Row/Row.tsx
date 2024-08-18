import type { JSXElement } from "solid-js";

import styles from "./Row.module.css";

type RowProps = {
  children: JSXElement;
};

export function Row(props: RowProps) {
  return <div class={styles["container"]}>{props.children}</div>;
}
