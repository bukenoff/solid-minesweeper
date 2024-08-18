import type { Accessor } from "solid-js";
import styles from "./ProgressPanel.module.css";

type ProgressPanelProps = {
  restart: () => void;
  minesLeft: Accessor<number>;
  time: Accessor<number>;
};

export function ProgressPanel(props: ProgressPanelProps) {
  return (
    <div class={styles["container"]}>
      <span>{props.minesLeft()}</span>
      <button onClick={props.restart}>r</button>
      <span>{props.time()}</span>
    </div>
  );
}
