import type { Difficulty, GameSetup } from "../models";

export const SETUPS_BY_DIFFICULTY: Record<Difficulty, GameSetup> = {
  easy: {
    cols: 9,
    rows: 9,
    mines: 10,
    key: "easy",
  },
  normal: {
    cols: 16,
    rows: 16,
    mines: 40,
    key: "normal",
  },
  hard: {
    cols: 30,
    rows: 16,
    mines: 99,
    key: "hard",
  },
};
