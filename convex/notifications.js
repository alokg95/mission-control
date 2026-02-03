import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";
export const undelivered = query({
    args: { targetAgentId: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notifications")
            .withIndex("by_target", (q) => q.eq("targetAgentId", args.targetAgentId).eq("delivered", false))
            .collect();
    },
});
export const create = mutation({
    args: {
        targetAgentId: v.id("agents"),
        sourceAgentId: v.id("agents"),
        content: v.string(),
        taskId: v.optional(v.id("tasks")),
        type: v.union(v.literal("mention"), v.literal("assignment"), v.literal("review_request"), v.literal("escalation"), v.literal("block_alert")),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        return await ctx.db.insert("notifications", {
            ...args,
            delivered: false,
            deliveredAt: undefined,
        });
    },
});
export const markDelivered = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        await ctx.db.patch(args.notificationId, {
            delivered: true,
            deliveredAt: Date.now(),
        });
    },
});
