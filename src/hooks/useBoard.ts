import { useContext } from "solid-js";

import { BoardContext } from "~/contexts/BoardContext";

export function useBoard() {
  return useContext(BoardContext);
}
