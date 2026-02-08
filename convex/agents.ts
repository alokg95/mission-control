import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

// Efficient lookup by name using index (for HTTP API)
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // Case-insensitive search: index stores as-is, so we check lowercase match
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_name")
      .collect();
    return agents.find((a) => a.name.toLowerCase() === args.name.toLowerCase()) ?? null;
  },
});

export const updateStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("working"), v.literal("idle"), v.literal("blocked"), v.literal("offline")),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch(args.agentId, {
      status: args.status,
      currentTaskId: args.currentTaskId,
      lastHeartbeat: Date.now(),
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    level: v.union(v.literal("coordinator"), v.literal("specialist"), v.literal("intern")),
    sessionKey: v.string(),
    avatarColor: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      level: args.level,
      status: "idle",
      sessionKey: args.sessionKey,
      avatarColor: args.avatarColor,
      lastHeartbeat: Date.now(),
    });
  },
});
