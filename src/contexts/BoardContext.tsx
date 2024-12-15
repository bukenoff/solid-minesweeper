import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSXElement,
  onCleanup,
  Setter,
} from "solid-js";
import { createStore } from "solid-js/store";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { SETUPS_BY_DIFFICULTY } from "../const/board";
import type { BoardType, Difficulty, GameSetup, GameStatus } from "../models";
import { getNeighborCells } from "../utils";
import {
  getMinesCoordinates,
  makeEmptyBoard,
  plantMines,
} from "../utils/board";
import { showNotification } from "../utils/misc";
import { LogicalSize } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

const appWindow = getCurrentWebviewWindow();

const WINDOW_SIZES: Record<Difficulty, { width: number; height: number }> = {
  easy: { width: 240, height: 320 },
  normal: { width: 400, height: 480 },
  hard: { width: 740, height: 480 },
};

export const BoardContext = createContext<{
  board: BoardType;
  status: Accessor<GameStatus>;
  minesLeft: Accessor<number>;
  time: Accessor<number>;
  setup: Accessor<GameSetup>;
  current: Accessor<{ row: number; col: number }>;
  isEnteringScore: Accessor<boolean>;
  openCell: (row: number, col: number) => void;
  restart: () => void;
  flagCell: (row: number, col: number, flagged: boolean) => void;
  changeDifficulty: (key: Difficulty) => void;
  setEnteringScore: Setter<boolean>;
}>();

export function BoardProvider(props: { children: JSXElement }) {
  const [current, setCurrent] = createSignal({ row: 0, col: 0 });
  const [setup, setSetup] = createSignal(SETUPS_BY_DIFFICULTY["easy"]);
  const [board, setBoard] = createStore(
    makeEmptyBoard(setup().rows, setup().cols)
  );
  const [status, setStatus] = createSignal<GameStatus>("pending");
  const [minesLeft, setMinesLeft] = createSignal(setup().mines);
  const [cellsLeft, setCellsLeft] = createSignal(
    setup().rows * setup().cols - setup().mines
  );
  const [time, setTime] = createSignal(0);
  const [isEnteringScore, setEnteringScore] = createSignal(false);

  let intervalId: NodeJS.Timeout;

  function startGame(row: number, col: number, board: BoardType) {
    plantMines(
      getMinesCoordinates(setup().rows, setup().cols, setup().mines, {
        row,
        col,
      }),
      setBoard,
      board
    );

    setStatus("playing");
    intervalId = setInterval(() => setTime((value) => value + 1), 1000);
  }

  function endGame(status: GameStatus) {
    if (status === "victory") {
      showNotification("You won!", `Your time is ${time()}`);
    }
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
    const clickedCell = board[row][col];

    if (status() === "loss" || clickedCell.is_open) return;

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
    setBoard(makeEmptyBoard(setup().rows, setup().cols));
    setMinesLeft(setup().mines);
    setTime(0);
    setCellsLeft(setup().rows * setup().cols - setup().mines);
    intervalId && clearInterval(intervalId);
  }

  function changeDifficulty(key: Difficulty) {
    appWindow.setSize(
      new LogicalSize(WINDOW_SIZES[key].width, WINDOW_SIZES[key].height)
    );
    setSetup(SETUPS_BY_DIFFICULTY[key]);
    restart();
  }

  createEffect(() => {
    if (!cellsLeft() && status() === "playing") {
      endGame("victory");
      invoke<{ time: number }>("get_last_score").then((score) => {
        if (score.time > time()) {
          setEnteringScore(true);
        }
      });
    }
  });

  createEffect(() => {
    const maxRow = setup().rows - 1;
    const maxCol = setup().cols - 1;

    const handleKeyDown = (event: any) => {
      if (isEnteringScore()) return;

      switch (event.key) {
        case "0":
          setCurrent({
            row: current().row,
            col: 0,
          });
          break;
        case "$":
          setCurrent({
            row: current().row,
            col: maxCol,
          });
          break;

        case "k":
          setCurrent({
            row: Math.max(current().row - 1, 0),
            col: current().col,
          });
          break;
        case "j":
          setCurrent({
            row: Math.min(current().row + 1, maxRow),
            col: current().col,
          });
          break;
        case "h":
          setCurrent({
            row: current().row,
            col: Math.max(current().col - 1, 0),
          });
          break;
        case "l":
          setCurrent({
            row: current().row,
            col: Math.min(current().col + 1, maxCol),
          });
          break;
        case "r":
          restart();
          break;
        case "m":
          const is_flagged = board[current().row][current().col].is_flagged;
          flagCell(current().row, current().col, !is_flagged);
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
    <BoardContext.Provider
      value={{
        board,
        status,
        minesLeft,
        time,
        setup,
        current,
        isEnteringScore,
        openCell,
        restart,
        flagCell,
        changeDifficulty,
        setEnteringScore,
      }}
    >
      {props.children}
    </BoardContext.Provider>
  );
}
