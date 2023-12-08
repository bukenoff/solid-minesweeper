import { Component, createSignal, Show } from "solid-js";

import { getColor } from "~/utils/helpers";

import styles from "./Cell.module.css";

type CellProps = {
  has_bomb: boolean;
  bombs_around: number;
  is_open: boolean;
  row: number;
  col: number;
  onOpen: (row: number, col: number) => void;
};

export const Cell: Component<CellProps> = (props) => {
  const [exploded, setExploded] = createSignal(false);
  const [flagged, setFlagged] = createSignal(false);

  const onClick = () => {
    if (props.is_open || flagged()) return;
    props.onOpen(props.row, props.col);
    props.has_bomb && !exploded() && setExploded(true);
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    if (props.is_open) return;
    setFlagged((value) => !value);
  };

  return (
    <button
      style={getColor(props.bombs_around)}
      class={styles["container"]}
      classList={{
        [styles["open"]]: props.is_open,
        [styles["exploded"]]: exploded(),
        [styles["flagged"]]: flagged(),
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <Show when={props.is_open && !!props.bombs_around}>
        {props.bombs_around}
      </Show>
    </button>
  );
};
