export type TaskStatus = "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked";
export type Priority = "p0" | "p1" | "p2" | "p3";
export type AgentStatus = "working" | "idle" | "blocked" | "offline";
export type AgentLevel = "coordinator" | "specialist" | "intern";
export type ActivityType = "task_update" | "comment" | "decision" | "document" | "status_change" | "handoff" | "escalation";

export const COLUMN_ORDER: TaskStatus[] = ["inbox", "assigned", "in_progress", "review", "done", "blocked"];

export const COLUMN_LABELS: Record<TaskStatus, string> = {
  inbox: "Inbox",
  assigned: "Assigned",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  blocked: "Blocked",
};

export const LEVEL_LABELS: Record<AgentLevel, string> = {
  coordinator: "COORD",
  specialist: "SPC",
  intern: "INT",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  p0: "P0 Critical",
  p1: "P1 High",
  p2: "P2 Normal",
  p3: "P3 Low",
};

export const STATUS_COLORS: Record<AgentStatus, string> = {
  working: "#2ABFBF",
  idle: "#94A3B8",
  blocked: "#E74C3C",
  offline: "#CBD5E1",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  p0: "#E74C3C",
  p1: "#F59E0B",
  p2: "#2ABFBF",
  p3: "#94A3B8",
};

export const ACTIVITY_FILTERS = [
  { key: "all", label: "All" },
  { key: "task_update", label: "Tasks" },
  { key: "comment", label: "Comments" },
  { key: "decision", label: "Decisions" },
  { key: "document", label: "Docs" },
  { key: "status_change", label: "Status" },
] as const;
