// P1-017: Documents Convex functions
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("documents").collect();
    },
});
export const get = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.documentId);
    },
});
export const byTask = query({
    args: { taskId: v.id("tasks") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("documents")
            .filter((q) => q.eq(q.field("taskId"), args.taskId))
            .collect();
    },
});
export const create = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        type: v.union(v.literal("spec"), v.literal("report"), v.literal("decision_log"), v.literal("standup"), v.literal("postmortem")),
        taskId: v.optional(v.id("tasks")),
        authorAgentId: v.id("agents"),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        return await ctx.db.insert("documents", args);
    },
});
export const update = mutation({
    args: {
        documentId: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        const { documentId, ...updates } = args;
        const filtered = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
        await ctx.db.patch(documentId, filtered);
    },
});
export const remove = mutation({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        await ctx.db.delete(args.documentId);
    },
});
