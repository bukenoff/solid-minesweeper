import { COLORS } from "../const";
import type { BoardType } from "../models";

export function getColor(count: number) {
  return { color: COLORS[count - 1] };
}

export function getNeighborCells(row: number, col: number, board: BoardType) {
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
}
