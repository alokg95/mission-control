import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const byTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const send = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    mentions: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      taskId: args.taskId,
      fromAgentId: args.fromAgentId,
      content: args.content,
      mentions: args.mentions,
      attachments: undefined,
    });
  },
});
