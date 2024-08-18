import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { BoardProvider } from "./contexts";
import { Board } from "./components";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  return (
    <div class="container">
      <BoardProvider>
        <Board />
      </BoardProvider>
    </div>
  );
}

export default App;
