import { COLORS } from "~/const";

export function getColor(count: number) {
  return { color: COLORS[count - 1] };
}
