import { For, Show } from "solid-js";

import { BoardProvider } from "~/contexts";
import { useBoard } from "~/hooks";

import styles from "./Board.module.css";
import { Cell } from "../Cell";
import { Row } from "../Row";
import { ProgressPanel } from "../ProgressPanel";

export const Board = () => {
  const [board, status, minesLeft, time, { openCell, flagCell, restart }] =
    useBoard();

  return (
    <BoardProvider>
      <div class={styles["container"]}>
        <ProgressPanel restart={restart} minesLeft={minesLeft} time={time} />
        <div class={styles["rows"]}>
          <Show when={status() === "loss" || status() === "victory"}>
            <div
              class={styles["overlay"]}
              classList={{
                [styles["loss"]]: status() === "loss",
                [styles["victory"]]: status() === "victory",
              }}
            />
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
                      is_flagged={cell.is_flagged}
                      row={cell.row}
                      col={cell.col}
                      onOpen={openCell}
                      flagCell={flagCell}
                    />
                  )}
                </For>
              </Row>
            )}
          </For>
        </div>
      </div>
    </BoardProvider>
  );
};
