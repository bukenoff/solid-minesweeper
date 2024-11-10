import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSXElement,
  onCleanup,
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

export const BoardContext =
  createContext<
    readonly [
      BoardType,
      Accessor<GameStatus>,
      Accessor<number>,
      Accessor<number>,
      Accessor<(typeof DIFFICULTY)[keyof typeof DIFFICULTY]>,
      Accessor<{ row: number; col: number }>,
      any
    ]
  >();

export function BoardProvider(props: { children: JSXElement }) {
  const [current, setCurrent] = createSignal({ row: 0, col: 0 });
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
    current,
    {
      openCell,
      restart,
      flagCell,
      changeDifficulty,
    },
  ] as const;

  createEffect(() => {
    const maxRow = difficulty().rows;
    const maxCol = difficulty().cols;

    const handleKeyDown = (event: any) => {
      console.log("event key", event.key);
      switch (event.key) {
        case "k":
          setCurrent({
            row: Math.max(current().row - 1, 0),
            col: current().col,
          });
          break;
        case "j":
          setCurrent({ row: (current().row + 1) % maxRow, col: current().col });
          break;
        case "h":
          setCurrent({
            row: current().row,
            col: Math.max(current().col - 1, 0),
          });
          break;
        case "l":
          setCurrent({ row: current().row, col: (current().col + 1) % maxCol });
          break;
        case "r":
          restart();
          break;
        case " ":
          openCell(current().row, current().col);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <BoardContext.Provider value={value}>
      {props.children}
    </BoardContext.Provider>
  );
}
