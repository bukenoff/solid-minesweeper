import {
  createContext,
  createEffect,
  createSignal,
  JSXElement,
} from "solid-js";
import { createStore } from "solid-js/store";

import { makeBoard } from "~/const";
import type { GameStatus } from "~/models";
import { getNeighborCells } from "~/utils";

export const BoardContext = createContext<any>();

export function BoardProvider(props: { children: JSXElement }) {
  const [board, setBoard] = createStore(makeBoard());
  const [status, setStatus] = createSignal<GameStatus>("pending");
  const [minesLeft, setMinesLeft] = createSignal(1);
  const [cellsLeft, setCellsLeft] = createSignal(9 * 9 - 1);
  const [time, setTime] = createSignal(0);
  let intervalId: NodeJS.Timer;

  createEffect(() => {
    if (!cellsLeft() && status() === "playing") endGame("victory");
  });

  function startGame() {
    setStatus("playing");
    intervalId = setInterval(() => setTime((value) => value + 1), 1000);
  }

  function endGame(status: GameStatus) {
    setStatus(status);
    intervalId && clearInterval(intervalId);
  }

  function openCell(row: number, col: number) {
    const clickedCell = board[row][col];
    if (status() === "pending") startGame();

    if (status() === "loss" || clickedCell.is_open || clickedCell.is_flagged)
      return;
    if (clickedCell.has_bomb) {
      endGame("loss");
    } else if (!clickedCell.bombs_around) {
      getNeighborCells(row, col, board).forEach((position) => {
        setTimeout(() => openCell(position.row, position.col), 50);
      });
    }

    setBoard(row, col, "is_open", true);
    setCellsLeft((count) => (count -= 1));
  }

  function flagCell(row: number, col: number, flagged: boolean) {
    setMinesLeft((count) => {
      if (flagged) {
        setBoard(row, col, "is_flagged", true);
        return count - 1;
      }
      setBoard(row, col, "is_flagged", false);
      return count + 1;
    });
  }

  function restart() {
    setStatus("pending");
    setBoard(makeBoard());
    setMinesLeft(1);
    setTime(0);
    setCellsLeft(9 * 9 - 1);
    intervalId && clearInterval(intervalId);
  }

  const value = [
    board,
    status,
    minesLeft,
    time,
    {
      openCell,
      restart,
      flagCell,
    },
  ];

  return (
    <BoardContext.Provider value={value}>
      {props.children}
    </BoardContext.Provider>
  );
}
