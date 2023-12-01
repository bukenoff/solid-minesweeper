import { For } from "solid-js";

import { BoardProvider } from "~/contexts";
import { useBoard } from "~/hooks";

import { Cell } from "../Cell";
import { Row } from "../Row";

export const Board = () => {
  const [board, { open }] = useBoard();

  return (
    <BoardProvider>
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
    </BoardProvider>
  );
};
