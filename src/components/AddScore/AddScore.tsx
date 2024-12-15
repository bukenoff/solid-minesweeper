import { Accessor } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import styles from "./AddScore.module.css";

type AddScoreProps = {
  time: Accessor<number>;
  isEnteringScore: Accessor<boolean>;
};

export function AddScore(props: AddScoreProps) {
  return (
    <dialog open={props.isEnteringScore()} class={styles["container"]}>
      <form
        onSubmit={(values) => {
          console.log("values are", values);
          invoke("add_score", {
            name: "current dude",
            scoreTime: props.time(),
          });
        }}
        method="dialog"
      >
        <p class={styles["call_to_action"]}>
          Your score is good enough to be in our top 10, enter your name if you
          want to be remembered
        </p>
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" name="user_name" />
        </div>
        <div>
          <button type="button">Cancel</button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </dialog>
  );
}
