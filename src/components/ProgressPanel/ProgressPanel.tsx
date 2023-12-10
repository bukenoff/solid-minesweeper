import { Accessor, Component } from "solid-js";
import styles from "./ProgressPanel.module.css";

type ProgressPanelProps = {
  restart: () => void;
  minesLeft: Accessor<number>;
  time: Accessor<number>;
};

export const ProgressPanel: Component<ProgressPanelProps> = (props) => {
  return (
    <div class={styles["container"]}>
      <span>{props.minesLeft()}</span>
      <button onClick={props.restart}>r</button>
      <span>{props.time()}</span>
    </div>
  );
};
