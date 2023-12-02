import { For, Show } from "solid-js";

import { BoardProvider } from "~/contexts";
import { useBoard } from "~/hooks";

import "./Board.css";
import { Cell } from "../Cell";
import { Row } from "../Row";

export const Board = () => {
  const [board, gameOver, { open }] = useBoard();

  return (
    <BoardProvider>
      <div class="board-root">
        <Show when={gameOver()}>
          <div class="board-overlay"></div>
        </Show>
        <For each={board}>
          {(row) => (
            <Row>
              <For each={row}>
                {(cell) => (
                  <Cell
                    has_bomb={cell.has_bomb}
                    bombs_around={cell.bombs_around}
                    is_open={cell.is_open}
                    row={cell.row}
                    col={cell.col}
                    onOpen={open}
                  />
                )}
              </For>
            </Row>
          )}
        </For>
      </div>
    </BoardProvider>
  );
};
