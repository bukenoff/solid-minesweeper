import { createSignal, type Accessor, type JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import styles from "./SettingsPanel.module.css";
import type { Difficulty, GameSetup, Score } from "../../models";

type SettingsPanelProps = {
  setup: Accessor<GameSetup>;
  changeDifficulty: (key: Difficulty) => void;
};

export function SettingsPanel(props: SettingsPanelProps) {
  const [scoresOpen, setScoresOpen] = createSignal(false);
  const [scores, setScores] = createSignal<Score[]>([]);
  const onChange: JSX.EventHandlerUnion<HTMLSelectElement, Event> = (e) =>
    props.changeDifficulty(e.currentTarget.value as Difficulty);

  const openScores = async () => {
    await invoke<{ scores: Score[] }>("get_scores").then((data) => {
      console.log("data is", data.scores);
      setScores(data.scores);
      setScoresOpen(true);
    });
  };

  return (
    <div>
      <select
        name="difficulty"
        id="difficulty"
        value={props.setup().key}
        onchange={onChange}
      >
        <option value="easy">Easy</option>
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
      </select>
      <button onClick={openScores}>scores</button>
      <dialog open={scoresOpen()} class={styles["scores_container"]}>
        <ol>
          {scores().map((score) => (
            <li>
              {score.name} - {score.time}
            </li>
          ))}
        </ol>
        <button onClick={() => setScoresOpen(false)}>OK</button>
      </dialog>
    </div>
  );
}
