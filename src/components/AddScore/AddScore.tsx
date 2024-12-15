import { Accessor, createSignal, Setter } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import styles from "./AddScore.module.css";

type AddScoreProps = {
  time: Accessor<number>;
  isEnteringScore: Accessor<boolean>;
  setEnteringScore: Setter<boolean>;
};

export function AddScore(props: AddScoreProps) {
  const [name, setName] = createSignal("");
  const handleSubmit = () => {
    if (!name()) return;

    invoke("add_score", {
      name: name(),
      scoreTime: props.time(),
    });
    props.setEnteringScore(false);
    setName("");
  };

  return (
    <dialog open={props.isEnteringScore()} class={styles["container"]}>
      <form onSubmit={handleSubmit} method="dialog">
        <p class={styles["call_to_action"]}>
          Your score is good enough to be in our top 10, enter your name if you
          want to be remembered
        </p>
        <div>
          <label for="name">Name:</label>
          <input
            type="text"
            id="name"
            name="user_name"
            value={name()}
            onInput={(e) => {
              setName(e.currentTarget.value);
            }}
          />
        </div>
        <div>
          <button type="button">Cancel</button>
          <button disabled={!name().trim()} type="submit">
            Submit
          </button>
        </div>
      </form>
    </dialog>
  );
}
