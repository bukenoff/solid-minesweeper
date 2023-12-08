import { createContext, createSignal, JSXElement } from "solid-js";
import { createStore } from "solid-js/store";

import { makeBoard } from "~/const/mocks";

const getNeighborCells = (
  row: number,
  col: number,
  board: ReturnType<typeof makeBoard>
) => {
  const maxRow = board.length - 1;
  const maxCol = board[0].length - 1;
  const neighbors: { row: number; col: number }[] = [];

  if (row > 0) {
    neighbors.push({ row: row - 1, col });
    if (col > 0) {
      neighbors.push({ row: row - 1, col: col - 1 });
    }
    if (col < maxCol) {
      neighbors.push({ row: row - 1, col: col + 1 });
    }
  }
  if (row < maxRow) {
    neighbors.push({ row: row + 1, col });
    if (col > 0) {
      neighbors.push({ row: row + 1, col: col - 1 });
    }
    if (col < maxCol) {
      neighbors.push({ row: row + 1, col: col + 1 });
    }
  }
  if (col > 0) {
    neighbors.push({ row, col: col - 1 });
  }
  if (col < maxCol) {
    neighbors.push({ row, col: col + 1 });
  }

  return neighbors;
};

export const BoardContext = createContext<any>();

export function BoardProvider(props: { children: JSXElement }) {
  const [board, setBoard] = createStore(makeBoard());
  const [gameOver, setGameOver] = createSignal(false);
  const [minesLeft, setMinesLeft] = createSignal(10);

  function openCell(row: number, col: number) {
    if (gameOver() || board[row][col].is_open) return;
    if (board[row][col].has_bomb) {
      setGameOver(true);
    }

    if (!board[row][col].bombs_around) {
      getNeighborCells(row, col, board).forEach((position) => {
        setTimeout(() => openCell(position.row, position.col), 50);
      });
    }

    setBoard(row, col, "is_open", true);
  }

  function restart() {
    setGameOver(false);
    setBoard(makeBoard());
    setMinesLeft(10);
  }

  const value = [
    board,
    gameOver,
    minesLeft,
    {
      openCell,
      restart,
    },
  ];

  return (
    <BoardContext.Provider value={value}>
      {props.children}
    </BoardContext.Provider>
  );
}
