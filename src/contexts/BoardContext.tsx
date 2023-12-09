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

  return [
    { row: row - 1, col },
    { row: row - 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row + 1, col },
    { row: row + 1, col: col - 1 },
    { row: row + 1, col: col + 1 },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ].filter(
    (neighbor) =>
      neighbor.row !== -1 &&
      neighbor.col !== -1 &&
      neighbor.row !== maxRow + 1 &&
      neighbor.col !== maxCol + 1
  );
};

export const BoardContext = createContext<any>();

export function BoardProvider(props: { children: JSXElement }) {
  const [board, setBoard] = createStore(makeBoard());
  const [gameOver, setGameOver] = createSignal(false);
  const [minesLeft, setMinesLeft] = createSignal(10);

  function openCell(row: number, col: number) {
    if (gameOver() || board[row][col].is_open || board[row][col].is_flagged)
      return;
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
      flagCell,
    },
  ];

  return (
    <BoardContext.Provider value={value}>
      {props.children}
    </BoardContext.Provider>
  );
}
