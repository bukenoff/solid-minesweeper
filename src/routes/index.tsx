import { Board } from "~/components/Board";
import { BoardProvider } from "~/contexts";

export default function Home() {
  return (
    <main>
      <BoardProvider>
        <Board />
      </BoardProvider>
    </main>
  );
}
