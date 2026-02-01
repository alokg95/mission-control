import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const updateStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("working"), v.literal("idle"), v.literal("blocked"), v.literal("offline")),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      status: args.status,
      currentTaskId: args.currentTaskId,
      lastHeartbeat: Date.now(),
    });
  },
});
