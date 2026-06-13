import type { ComponentType } from "react";

/**
 * Slug → interactive client widget. Browser tools register their engine UI here.
 * Tools without an entry fall back to the engine-aware placeholder.
 * (Populated as each tool's engine ships — see batch A.)
 */
export const widgets: Record<string, ComponentType> = {};
