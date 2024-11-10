import {
  createContext,
  createEffect,
  createSignal,
  JSXElement,
} from "solid-js";
import { createStore } from "solid-js/store";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";

import { DIFFICULTY } from "../const/board";
import type { BoardType, GameStatus } from "../models";
import { getNeighborCells } from "../utils";
import {
  getMinesCoordinates,
  makeEmptyBoard,
  plantMines,
} from "../utils/board";

const WINDOW_SIZES: Record<
  keyof typeof DIFFICULTY,
  { width: number; height: number }
> = {
  easy: { width: 240, height: 320 },
  normal: { width: 400, height: 480 },
  hard: { width: 740, height: 480 },
};

export const BoardContext = createContext<any>();

export function BoardProvider(props: { children: JSXElement }) {
  const [difficulty, setDifficulty] = createSignal(DIFFICULTY["easy"]);
  const [board, setBoard] = createStore(
    makeEmptyBoard(difficulty().rows, difficulty().cols)
  );
  const [status, setStatus] = createSignal<GameStatus>("pending");
  const [minesLeft, setMinesLeft] = createSignal(difficulty().mines);
  const [cellsLeft, setCellsLeft] = createSignal(
    difficulty().rows * difficulty().cols - difficulty().mines
  );
  const [time, setTime] = createSignal(0);
  let intervalId: NodeJS.Timeout;

  createEffect(() => {
    if (!cellsLeft() && status() === "playing") endGame("victory");
  });

  function startGame(row: number, col: number, board: BoardType) {
    plantMines(
      getMinesCoordinates(
        difficulty().rows,
        difficulty().cols,
        difficulty().mines,
        { row, col }
      ),
      setBoard,
      board
    );

    setStatus("playing");
    intervalId = setInterval(() => setTime((value) => value + 1), 1000);
  }

  function endGame(status: GameStatus) {
    setStatus(status);
    intervalId && clearInterval(intervalId);
  }

  function openCell(row: number, col: number) {
    const clickedCell = board[row][col];
    if (status() === "pending") startGame(row, col, board);

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
    setBoard(makeEmptyBoard(difficulty().rows, difficulty().cols));
    setMinesLeft(difficulty().mines);
    setTime(0);
    setCellsLeft(difficulty().rows * difficulty().cols - difficulty().mines);
    intervalId && clearInterval(intervalId);
  }

  function changeDifficulty(key: keyof typeof DIFFICULTY) {
    appWindow.setSize(
      new LogicalSize(WINDOW_SIZES[key].width, WINDOW_SIZES[key].height)
    );
    setDifficulty(DIFFICULTY[key]);
    restart();
  }

  const value = [
    board,
    status,
    minesLeft,
    time,
    difficulty,
    {
      openCell,
      restart,
      flagCell,
      changeDifficulty,
    },
  ];

  return (
    <BoardContext.Provider value={value}>
      {props.children}
    </BoardContext.Provider>
  );
}
