// Mock data store for local development without Convex backend
// Uses the same shapes as Convex documents but with string IDs

import type { TaskStatus, Priority, AgentStatus, AgentLevel, ActivityType } from "../types";

type MockAgent = {
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
};

type MockTask = {
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
};

type MockActivity = {
  _id: string;
  _creationTime: number;
  type: ActivityType;
  agentId: string;
  taskId?: string;
  message: string;
  metadata?: Record<string, unknown>;
};

type MockMessage = {
  _id: string;
  _creationTime: number;
  taskId: string;
  fromAgentId: string;
  content: string;
  mentions?: string[];
};

const now = Date.now();

export const mockAgents: MockAgent[] = [
  {
    _id: "agent_alo",
    _creationTime: now - 86400000 * 30,
    name: "Alo",
    role: "Main Coordinator",
    level: "coordinator",
    status: "working",
    sessionKey: "agent:main:main",
    avatarColor: "#2ABFBF",
    lastHeartbeat: now - 120000,
  },
  {
    _id: "agent_dev",
    _creationTime: now - 86400000 * 30,
    name: "Dev",
    role: "Developer Agent",
    level: "specialist",
    status: "working",
    currentTaskId: "task_1",
    sessionKey: "agent:main:subagent:dev",
    avatarColor: "#6366F1",
    lastHeartbeat: now - 60000,
  },
  {
    _id: "agent_raj",
    _creationTime: now - 86400000 * 30,
    name: "Raj",
    role: "QA Engineer",
    level: "specialist",
    status: "idle",
    sessionKey: "agent:main:subagent:qa",
    avatarColor: "#F59E0B",
    lastHeartbeat: now - 300000,
  },
  {
    _id: "agent_pm",
    _creationTime: now - 86400000 * 30,
    name: "PM",
    role: "Product Manager",
    level: "specialist",
    status: "working",
    currentTaskId: "task_2",
    sessionKey: "agent:main:subagent:pm",
    avatarColor: "#F43F5E",
    lastHeartbeat: now - 180000,
  },
];

export const mockTasks: MockTask[] = [
  {
    _id: "task_1",
    _creationTime: now - 7200000,
    title: "Fix video export timeout on large files",
    description: "Users report exports failing for files >500MB. Need to implement chunked upload with retry logic.",
    status: "in_progress",
    priority: "p0",
    assigneeIds: ["agent_dev"],
    tags: ["bug", "urgent", "video-export"],
    createdBy: "alok",
  },
  {
    _id: "task_2",
    _creationTime: now - 14400000,
    title: "Write spec: Webhook retry logic v2",
    description: "Define retry backoff strategy, dead letter queue, and monitoring for failed webhook deliveries.",
    status: "in_progress",
    priority: "p1",
    assigneeIds: ["agent_pm"],
    tags: ["spec", "webhooks"],
    createdBy: "Alo",
  },
  {
    _id: "task_3",
    _creationTime: now - 86400000,
    title: "API rate limit handling for enterprise tier",
    description: "Implement per-customer rate limiting with configurable thresholds. Enterprise gets 10x default limits.",
    status: "review",
    priority: "p1",
    assigneeIds: ["agent_dev", "agent_raj"],
    tags: ["feature", "api", "enterprise"],
    createdBy: "PM",
  },
  {
    _id: "task_4",
    _creationTime: now - 172800000,
    title: "Dashboard analytics: video completion rates",
    description: "Add video completion rate metrics to the analytics dashboard. Show daily/weekly/monthly trends.",
    status: "assigned",
    priority: "p2",
    assigneeIds: ["agent_dev"],
    tags: ["feature", "analytics"],
    createdBy: "PM",
  },
  {
    _id: "task_5",
    _creationTime: now - 3600000,
    title: "Investigate Stripe webhook failures",
    description: "3 customers reported missing subscription updates. Check webhook logs and Stripe dashboard.",
    status: "inbox",
    priority: "p1",
    assigneeIds: [],
    tags: ["bug", "billing"],
    createdBy: "alok",
  },
  {
    _id: "task_6",
    _creationTime: now - 7200000,
    title: "Mobile responsive video player",
    description: "Video player clips on screens < 768px. Need proper responsive layout with touch controls.",
    status: "inbox",
    priority: "p2",
    assigneeIds: [],
    tags: ["bug", "mobile", "video-player"],
    createdBy: "Alo",
  },
  {
    _id: "task_7",
    _creationTime: now - 259200000,
    title: "Add team member invite flow",
    description: "Allow workspace owners to invite team members via email. Include role selection and onboarding.",
    status: "assigned",
    priority: "p2",
    assigneeIds: ["agent_pm"],
    tags: ["feature", "teams"],
    createdBy: "alok",
  },
  {
    _id: "task_8",
    _creationTime: now - 43200000,
    title: "E2E test suite for auth flows",
    description: "Playwright tests covering login, signup, password reset, OAuth, and session management.",
    status: "in_progress",
    priority: "p2",
    assigneeIds: ["agent_raj"],
    tags: ["testing", "auth"],
    createdBy: "Raj",
  },
  {
    _id: "task_9",
    _creationTime: now - 86400000,
    title: "Customer onboarding email sequence",
    description: "Design and implement 5-email drip campaign for new signups. Include video tutorials.",
    status: "inbox",
    priority: "p3",
    assigneeIds: [],
    tags: ["marketing", "email"],
    createdBy: "PM",
  },
  {
    _id: "task_10",
    _creationTime: now - 172800000,
    title: "Migrate to Node 22 runtime",
    description: "Update all serverless functions to Node 22. Test for breaking changes in dependencies.",
    status: "done",
    priority: "p2",
    assigneeIds: ["agent_dev"],
    tags: ["infra", "migration"],
    createdBy: "Dev",
    completedAt: now - 86400000,
  },
  {
    _id: "task_11",
    _creationTime: now - 50000000,
    title: "Security audit: JWT token rotation",
    description: "Review and fix JWT refresh token rotation. Ensure tokens expire correctly and refresh is atomic.",
    status: "blocked",
    priority: "p0",
    assigneeIds: ["agent_dev"],
    tags: ["security", "auth", "urgent"],
    createdBy: "alok",
    blockedReason: "Waiting on Auth0 support ticket #4521 for custom claim limits",
  },
  {
    _id: "task_12",
    _creationTime: now - 100000000,
    title: "Write postmortem: Jan 28 outage",
    description: "Document root cause, timeline, and remediation steps for the 45-minute API outage.",
    status: "review",
    priority: "p1",
    assigneeIds: ["agent_pm"],
    tags: ["postmortem", "incident"],
    createdBy: "Alo",
  },
];

export const mockActivities: MockActivity[] = [
  {
    _id: "act_1",
    _creationTime: now - 60000,
    type: "task_update",
    agentId: "agent_dev",
    taskId: "task_1",
    message: "Moved 'Fix video export timeout' to In Progress",
  },
  {
    _id: "act_2",
    _creationTime: now - 180000,
    type: "comment",
    agentId: "agent_raj",
    taskId: "task_3",
    message: "Commented on 'API rate limit handling': Edge case found in burst mode — adding test coverage",
  },
  {
    _id: "act_3",
    _creationTime: now - 300000,
    type: "status_change",
    agentId: "agent_dev",
    message: "Dev went IDLE → WORKING",
    metadata: { from: "idle", to: "working" },
  },
  {
    _id: "act_4",
    _creationTime: now - 600000,
    type: "decision",
    agentId: "agent_alo",
    message: "Decided: Prioritize video export fix over analytics dashboard",
  },
  {
    _id: "act_5",
    _creationTime: now - 900000,
    type: "handoff",
    agentId: "agent_dev",
    taskId: "task_3",
    message: "Dev requested review from Raj on 'API rate limit handling'",
  },
  {
    _id: "act_6",
    _creationTime: now - 1200000,
    type: "document",
    agentId: "agent_pm",
    message: "Created spec: 'Webhook Retry Logic v2'",
  },
  {
    _id: "act_7",
    _creationTime: now - 1800000,
    type: "comment",
    agentId: "agent_pm",
    taskId: "task_4",
    message: "Commented on 'Dashboard analytics': Spec attached, ready for dev pickup",
  },
  {
    _id: "act_8",
    _creationTime: now - 2400000,
    type: "escalation",
    agentId: "agent_alo",
    message: "Escalated 'Security audit: JWT rotation' to Alok — blocked on Auth0 support",
  },
  {
    _id: "act_9",
    _creationTime: now - 3000000,
    type: "task_update",
    agentId: "agent_raj",
    taskId: "task_3",
    message: "Moved 'API rate limit handling' to Review",
  },
  {
    _id: "act_10",
    _creationTime: now - 3600000,
    type: "status_change",
    agentId: "agent_pm",
    message: "PM went IDLE → WORKING",
    metadata: { from: "idle", to: "working" },
  },
];

export const mockMessages: MockMessage[] = [
  {
    _id: "msg_1",
    _creationTime: now - 3600000,
    taskId: "task_1",
    fromAgentId: "agent_dev",
    content: "Starting investigation. Initial profiling shows the upload stream isn't being properly chunked for files over the 500MB threshold.",
  },
  {
    _id: "msg_2",
    _creationTime: now - 1800000,
    taskId: "task_1",
    fromAgentId: "agent_alo",
    content: "@Dev this is P0 — 3 enterprise customers affected. Keep me posted on ETA.",
    mentions: ["agent_dev"],
  },
  {
    _id: "msg_3",
    _creationTime: now - 900000,
    taskId: "task_1",
    fromAgentId: "agent_dev",
    content: "Found the root cause. The multipart upload was using a single presigned URL instead of chunked. Implementing S3 multipart upload with 50MB chunks and exponential retry. ETA: 2 hours.",
  },
  {
    _id: "msg_4",
    _creationTime: now - 7200000,
    taskId: "task_3",
    fromAgentId: "agent_dev",
    content: "Implementation complete. Using token bucket algorithm with Redis backing. Enterprise tier gets 1000 req/min, standard gets 100 req/min. Ready for review.",
  },
  {
    _id: "msg_5",
    _creationTime: now - 5400000,
    taskId: "task_3",
    fromAgentId: "agent_raj",
    content: "Found edge case: burst requests within the same millisecond can bypass the counter. Adding atomic increment with Lua script. Otherwise LGTM.",
    mentions: ["agent_dev"],
  },
];

// Helper to get agent by ID
export function getAgent(id: string): MockAgent | undefined {
  return mockAgents.find((a) => a._id === id);
}

// Mutable store for local state changes
export class MockStore {
  agents: MockAgent[];
  tasks: MockTask[];
  activities: MockActivity[];
  messages: MockMessage[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.agents = [...mockAgents];
    this.tasks = [...mockTasks];
    this.activities = [...mockActivities];
    this.messages = [...mockMessages];
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  updateTaskStatus(taskId: string, status: TaskStatus, blockedReason?: string) {
    this.tasks = this.tasks.map((t) =>
      t._id === taskId
        ? {
            ...t,
            status,
            blockedReason: status === "blocked" ? blockedReason : undefined,
            completedAt: status === "done" ? Date.now() : t.completedAt,
          }
        : t
    );
    this.notify();
  }

  createTask(task: Omit<MockTask, "_id" | "_creationTime">) {
    const newTask: MockTask = {
      ...task,
      _id: `task_${Date.now()}`,
      _creationTime: Date.now(),
    };
    this.tasks = [...this.tasks, newTask];
    this.notify();
    return newTask;
  }

  updateTask(taskId: string, updates: Partial<MockTask>) {
    this.tasks = this.tasks.map((t) =>
      t._id === taskId ? { ...t, ...updates } : t
    );
    this.notify();
  }

  addMessage(msg: Omit<MockMessage, "_id" | "_creationTime">) {
    const newMsg: MockMessage = {
      ...msg,
      _id: `msg_${Date.now()}`,
      _creationTime: Date.now(),
    };
    this.messages = [...this.messages, newMsg];
    this.addActivity({
      type: "comment",
      agentId: msg.fromAgentId,
      taskId: msg.taskId,
      message: `Commented on task`,
    });
    this.notify();
    return newMsg;
  }

  addActivity(act: Omit<MockActivity, "_id" | "_creationTime">) {
    const newAct: MockActivity = {
      ...act,
      _id: `act_${Date.now()}`,
      _creationTime: Date.now(),
    };
    this.activities = [newAct, ...this.activities];
    this.notify();
    return newAct;
  }

  deleteTask(taskId: string) {
    this.tasks = this.tasks.filter((t) => t._id !== taskId);
    this.notify();
  }
}

export const store = new MockStore();
