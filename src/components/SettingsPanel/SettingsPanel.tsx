import type { Accessor, JSX } from "solid-js";

type SettingsPanelProps = {
  difficulty: Accessor<any>;
  changeDifficulty: (key: string) => void;
};

export function SettingsPanel(props: SettingsPanelProps) {
  const onChange: JSX.EventHandlerUnion<HTMLSelectElement, Event> = (e) =>
    props.changeDifficulty(e.currentTarget.value);

  return (
    <div>
      <select
        name="difficulty"
        id="difficulty"
        value={props.difficulty().key}
        onchange={onChange}
      >
        <option value="easy">Easy</option>
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  );
}
