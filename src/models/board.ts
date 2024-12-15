export type CellType = {
  has_bomb: boolean;
  bombs_around: number;
  is_open: boolean;
  row: number;
  col: number;
  is_flagged: boolean;
};

export type BoardType = CellType[][];

export type GameStatus = "pending" | "playing" | "victory" | "loss";

export type Difficulty = "easy" | "normal" | "hard";

export type GameSetup = {
  cols: number;
  rows: number;
  mines: number;
  key: string;
};

export type Score = {
  name: string;
  time: number;
};
