// P0-002: Task lifecycle state machine per PRD §9.2
import type { TaskStatus } from "../types";

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  inbox: ["assigned"],
  assigned: ["in_progress"],
  in_progress: ["review", "blocked"],
  review: ["done", "assigned"],
  done: [],
  blocked: ["in_progress", "assigned"],
};

export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return false;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidNextStatuses(current: TaskStatus): TaskStatus[] {
  return VALID_TRANSITIONS[current] ?? [];
}

export function getTransitionError(from: TaskStatus, to: TaskStatus): string | null {
  if (from === to) return null;
  if (isValidTransition(from, to)) return null;
  const fromLabel = from.replace("_", " ");
  const toLabel = to.replace("_", " ");
  return `Cannot move from "${fromLabel}" to "${toLabel}"`;
}
