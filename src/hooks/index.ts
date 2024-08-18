import { useContext } from "solid-js";

import { BoardContext } from "../contexts/BoardContext";

export function useBoard() {
  const context = useContext(BoardContext);

  if (!context) {
    throw new Error("useBoard: cannot find a BoardContext");
  }

  return context;
}
