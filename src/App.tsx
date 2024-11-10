import "./App.css";
import { BoardProvider } from "./contexts";
import { Board } from "./components";

function App() {
  return (
    <div class="container">
      <BoardProvider>
        <Board />
      </BoardProvider>
    </div>
  );
}

export default App;
