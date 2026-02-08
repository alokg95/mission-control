import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";

export const recent = query({
  args: {
    filterType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("activities").order("desc");
    const results = await q.collect();
    let filtered = results;
    if (args.filterType && args.filterType !== "all") {
      filtered = results.filter((a) => a.type === args.filterType);
    }
    return filtered.slice(0, args.limit ?? 50);
  },
});

export const log = mutation({
  args: {
    type: v.union(
      v.literal("task_update"),
      v.literal("comment"),
      v.literal("decision"),
      v.literal("document"),
      v.literal("status_change"),
      v.literal("handoff"),
      v.literal("escalation")
    ),
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.insert("activities", {
      type: args.type,
      agentId: args.agentId,
      taskId: args.taskId,
      message: args.message,
      metadata: args.metadata,
    });
  },
});

// HTTP action version - no auth required (API key checked in http.ts)
export const logFromHttp = mutation({
  args: {
    type: v.union(
      v.literal("task_update"),
      v.literal("comment"),
      v.literal("decision"),
      v.literal("document"),
      v.literal("status_change"),
      v.literal("handoff"),
      v.literal("escalation")
    ),
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      type: args.type,
      agentId: args.agentId,
      taskId: args.taskId,
      message: args.message,
      metadata: args.metadata,
    });
  },
});
