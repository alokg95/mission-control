import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const byStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"), v.literal("p3")),
    assigneeIds: v.array(v.id("agents")),
    tags: v.array(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      blockedReason: undefined,
      parentTaskId: undefined,
      completedAt: undefined,
    });
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    blockedReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "done") {
      patch.completedAt = Date.now();
    }
    if (args.status === "blocked" && args.blockedReason) {
      patch.blockedReason = args.blockedReason;
    }
    if (args.status !== "blocked") {
      patch.blockedReason = undefined;
    }
    await ctx.db.patch(args.taskId, patch);
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"), v.literal("p3"))),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(taskId, filtered);
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});
