import type { Component, JSXElement } from "solid-js";

import "./Row.css";

type RowProps = {
  children: JSXElement;
};

export const Row: Component<RowProps> = ({ children }) => {
  return <div class="row-root">{children}</div>;
};
