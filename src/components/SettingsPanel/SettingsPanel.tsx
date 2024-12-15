import type { Accessor, JSX } from "solid-js";
import type { Difficulty, GameSetup } from "../../models";

type SettingsPanelProps = {
  setup: Accessor<GameSetup>;
  changeDifficulty: (key: Difficulty) => void;
};

export function SettingsPanel(props: SettingsPanelProps) {
  const onChange: JSX.EventHandlerUnion<HTMLSelectElement, Event> = (e) =>
    props.changeDifficulty(e.currentTarget.value as Difficulty);

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
    </div>
  );
}
