// P0-001: Dual-mode store — Convex when VITE_CONVEX_URL set, MockStore fallback
import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery, useMutation, Authenticated, Unauthenticated } from "convex/react";
import { api } from "../../convex/_generated/api";
import { store, type MockStore } from "./mock-data";
import type { TaskStatus, Priority, ActivityType, AgentStatus, AgentLevel } from "../types";

// Shared types for what the UI consumes
export interface AgentDoc {
  _id: string;
  _creationTime: number;
  name: string;
  role: string;
  level: AgentLevel;
  status: AgentStatus;
  currentTaskId?: string;
  sessionKey: string;
  avatarColor: string;
  lastHeartbeat: number;
  config?: { model?: string; thinkingLevel?: string; autonomy?: string };
}

export interface TaskDoc {
  _id: string;
  _creationTime: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeIds: string[];
  tags: string[];
  parentTaskId?: string;
  blockedReason?: string;
  createdBy: string;
  completedAt?: number;
}

export interface ActivityDoc {
  _id: string;
  _creationTime: number;
  type: ActivityType;
  agentId: string;
  taskId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface MessageDoc {
  _id: string;
  _creationTime: number;
  taskId: string;
  fromAgentId: string;
  content: string;
  mentions?: string[];
}

export interface NotificationDoc {
  _id: string;
  _creationTime: number;
  targetAgentId: string;
  sourceAgentId: string;
  content: string;
  taskId?: string;
  type: "mention" | "assignment" | "review_request" | "escalation" | "block_alert";
  delivered: boolean;
  deliveredAt?: number;
}

// ---- Check mode ----
export const USE_CONVEX = !!import.meta.env.VITE_CONVEX_URL;

// ===================== MOCK STORE MODE =====================

const StoreContext = createContext<MockStore>(store);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): MockStore {
  return useContext(StoreContext);
}

// Mock hooks
function useMockAgents(): AgentDoc[] {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.agents as AgentDoc[]
  );
}

function useMockTasks(): TaskDoc[] {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.tasks as TaskDoc[]
  );
}

function useMockActivities(): ActivityDoc[] {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.activities as ActivityDoc[]
  );
}

function useMockMessages(): MessageDoc[] {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.messages as MessageDoc[]
  );
}

// ===================== CONVEX MODE =====================

function useConvexAgents(): AgentDoc[] {
  const data = useQuery(api.agents.list) as Record<string, unknown>[] | undefined;
  if (!data) return [];
  return data as unknown as AgentDoc[];
}

function useConvexTasks(): TaskDoc[] {
  const data = useQuery(api.tasks.list) as Record<string, unknown>[] | undefined;
  if (!data) return [];
  return (data as unknown as TaskDoc[]).map((t) => ({
    ...t,
    assigneeIds: (t.assigneeIds as string[]).map(String),
  }));
}

function useConvexActivities(): ActivityDoc[] {
  const data = useQuery(api.activities.recent, { limit: 50 }) as Record<string, unknown>[] | undefined;
  if (!data) return [];
  return data as unknown as ActivityDoc[];
}

function useConvexMessagesByTask(taskId: string): MessageDoc[] {
  const data = useQuery(api.messages.byTask, { taskId: taskId as never }) as Record<string, unknown>[] | undefined;
  if (!data) return [];
  return data as unknown as MessageDoc[];
}

// ===================== UNIFIED HOOKS =====================

export function useAgents(): AgentDoc[] {
  if (USE_CONVEX) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexAgents();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMockAgents();
}

export function useTasks(): TaskDoc[] {
  if (USE_CONVEX) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexTasks();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMockTasks();
}

export function useActivities(): ActivityDoc[] {
  if (USE_CONVEX) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexActivities();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMockActivities();
}

export function useMessages(): MessageDoc[] {
  if (USE_CONVEX) {
    // For Convex mode, messages are loaded per-task via useMessagesByTask
    // This returns empty — use useMessagesByTask in modals
    return [];
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMockMessages();
}

export function useMessagesByTask(taskId: string): MessageDoc[] {
  if (USE_CONVEX) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexMessagesByTask(taskId);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const s = useStore();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSyncExternalStore(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.messages.filter((m) => m.taskId === taskId) as MessageDoc[]
  );
}

// ===================== MUTATION HOOKS =====================

export interface StoreMutations {
  updateTaskStatus: (taskId: string, status: TaskStatus, blockedReason?: string) => void;
  createTask: (task: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    assigneeIds: string[];
    tags: string[];
    createdBy: string;
  }) => void;
  updateTask: (taskId: string, updates: Partial<TaskDoc>) => void;
  deleteTask: (taskId: string) => void;
  addMessage: (msg: { taskId: string; fromAgentId: string; content: string; mentions?: string[] }) => void;
  addActivity: (act: { type: ActivityType; agentId: string; taskId?: string; message: string; metadata?: Record<string, unknown> }) => void;
}

export function useMutations(): StoreMutations {
  if (USE_CONVEX) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConvexMutations();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMockMutations();
}

function useMockMutations(): StoreMutations {
  const s = useStore();
  return {
    updateTaskStatus: (taskId, status, blockedReason) => {
      s.updateTaskStatus(taskId, status, blockedReason);
      s.addActivity({
        type: "task_update",
        agentId: "agent_alo",
        taskId,
        message: `Moved task to ${status.replace("_", " ")}`,
      });
    },
    createTask: (task) => {
      s.createTask(task);
      s.addActivity({
        type: "task_update",
        agentId: "agent_alo",
        message: `Created task: '${task.title}'`,
      });
    },
    updateTask: (taskId, updates) => s.updateTask(taskId, updates),
    deleteTask: (taskId) => s.deleteTask(taskId),
    addMessage: (msg) => s.addMessage(msg),
    addActivity: (act) => s.addActivity(act),
  };
}

function useConvexMutations(): StoreMutations {
  const updateStatusMut = useMutation(api.tasks.updateStatus);
  const createTaskMut = useMutation(api.tasks.create);
  const updateTaskMut = useMutation(api.tasks.update);
  const removeTaskMut = useMutation(api.tasks.remove);
  const sendMsgMut = useMutation(api.messages.send);
  const logActivityMut = useMutation(api.activities.log);

  return {
    updateTaskStatus: (taskId, status, blockedReason) => {
      void updateStatusMut({ taskId: taskId as never, status, blockedReason });
    },
    createTask: (task) => {
      void createTaskMut({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeIds: task.assigneeIds as never[],
        tags: task.tags,
        createdBy: task.createdBy,
      });
    },
    updateTask: (taskId, updates) => {
      void updateTaskMut({
        taskId: taskId as never,
        ...(updates.title !== undefined ? { title: updates.title } : {}),
        ...(updates.description !== undefined ? { description: updates.description } : {}),
        ...(updates.priority !== undefined ? { priority: updates.priority } : {}),
        ...(updates.assigneeIds !== undefined ? { assigneeIds: updates.assigneeIds as never[] } : {}),
        ...(updates.tags !== undefined ? { tags: updates.tags } : {}),
      });
    },
    deleteTask: (taskId) => {
      void removeTaskMut({ taskId: taskId as never });
    },
    addMessage: (msg) => {
      void sendMsgMut({
        taskId: msg.taskId as never,
        fromAgentId: msg.fromAgentId as never,
        content: msg.content,
        mentions: msg.mentions as never[] | undefined,
      });
    },
    addActivity: (act) => {
      void logActivityMut({
        type: act.type,
        agentId: act.agentId as never,
        taskId: act.taskId as never | undefined,
        message: act.message,
        metadata: act.metadata,
      });
    },
  };
}

// Re-export for compatibility
export { Authenticated, Unauthenticated };
