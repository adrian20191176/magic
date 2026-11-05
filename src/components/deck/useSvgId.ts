import { useId } from "react";

/**
 * A unique id that is safe to use inside SVG `url(#…)` references.
 * React's ids contain characters (":" / "«»") that some browsers refuse in references.
 */
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
