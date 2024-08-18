import { SetStoreFunction } from "solid-js/store";
import type { BoardType, CellType } from "../models";
import { getNeighborCells } from "./helpers";

export function makeEmptyBoard(rows: number, cols: number): BoardType {
  return Array.from({ length: rows }, (_, row) => {
    return Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      has_bomb: false,
      bombs_around: 0,
      is_open: false,
    }));
  });
}

export function getMinesCoordinates(
  rows: number,
  cols: number,
  count: number,
  firstClick: { row: number; col: number }
): Set<string> {
  const coordinates = new Set<string>();

  while (count) {
    const randomRow = Math.floor(Math.random() * rows);
    const randomCol = Math.floor(Math.random() * cols);

    if (
      coordinates.has(`${randomRow}-${randomCol}`) ||
      (randomRow === firstClick.row && randomCol === firstClick.col)
    )
      continue;
    coordinates.add(`${randomRow}-${randomCol}`);
    count -= 1;
  }

  return coordinates;
}

export function plantMines(
  coordinates: Set<string>,
  setBoard: SetStoreFunction<CellType[][]>,
  board: BoardType
) {
  for (let position of coordinates) {
    const [row, col] = position.split("-");
    const neighbors = getNeighborCells(+row, +col, board);

    neighbors.forEach((position) => {
      if (board[position.row][position.col].has_bomb) return;

      setBoard(
        position.row,
        position.col,
        "bombs_around",
        board[position.row][position.col].bombs_around + 1
      );
    });

    setBoard(+row, +col, "has_bomb", true);
  }
}
