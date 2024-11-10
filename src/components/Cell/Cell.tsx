import { Accessor, createSignal, Show } from "solid-js";

import { getColor } from "../../utils/helpers";

import styles from "./Cell.module.css";

type CellProps = {
  has_bomb: boolean;
  bombs_around: number;
  is_open: boolean;
  is_flagged?: boolean;
  row: number;
  col: number;
  current: Accessor<{ row: number; col: number }>;
  onOpen: (row: number, col: number) => void;
  flagCell: (row: number, col: number, flagged: boolean) => void;
};

export function Cell(props: CellProps) {
  const [exploded, setExploded] = createSignal(false);

  const onClick = () => {
    if (props.is_open || props.is_flagged) return;
    props.onOpen(props.row, props.col);
    props.has_bomb && !exploded() && setExploded(true);
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    if (props.is_open) return;
    props.flagCell(props.row, props.col, !props.is_flagged);
  };

  return (
    <button
      style={getColor(props.bombs_around)}
      class={styles["container"]}
      classList={{
        [styles["open"]]: props.is_open,
        [styles["exploded"]]: exploded(),
        [styles["flagged"]]: props.is_flagged,
        [styles["current"]]:
          props.current().row === props.row &&
          props.current().col === props.col,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <Show when={props.is_open && !!props.bombs_around}>
        {props.bombs_around}
      </Show>
    </button>
  );
}
