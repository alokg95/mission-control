import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    agents: defineTable({
        name: v.string(),
        role: v.string(),
        level: v.union(v.literal("coordinator"), v.literal("specialist"), v.literal("intern")),
        status: v.union(v.literal("working"), v.literal("idle"), v.literal("blocked"), v.literal("offline")),
        currentTaskId: v.optional(v.id("tasks")),
        sessionKey: v.string(),
        avatarColor: v.string(),
        lastHeartbeat: v.number(),
        config: v.optional(v.object({
            model: v.optional(v.string()),
            thinkingLevel: v.optional(v.string()),
            autonomy: v.optional(v.string()),
        })),
    }),
    tasks: defineTable({
        title: v.string(),
        description: v.string(),
        status: v.union(v.literal("inbox"), v.literal("assigned"), v.literal("in_progress"), v.literal("review"), v.literal("done"), v.literal("blocked")),
        priority: v.union(v.literal("p0"), v.literal("p1"), v.literal("p2"), v.literal("p3")),
        assigneeIds: v.array(v.id("agents")),
        tags: v.array(v.string()),
        parentTaskId: v.optional(v.id("tasks")),
        blockedReason: v.optional(v.string()),
        createdBy: v.string(),
        completedAt: v.optional(v.number()),
    })
        .index("by_status", ["status"])
        .index("by_priority", ["priority"]),
    messages: defineTable({
        taskId: v.id("tasks"),
        fromAgentId: v.id("agents"),
        content: v.string(),
        attachments: v.optional(v.array(v.object({
            name: v.string(),
            url: v.string(),
        }))),
        mentions: v.optional(v.array(v.id("agents"))),
    }).index("by_task", ["taskId"]),
    activities: defineTable({
        type: v.union(v.literal("task_update"), v.literal("comment"), v.literal("decision"), v.literal("document"), v.literal("status_change"), v.literal("handoff"), v.literal("escalation")),
        agentId: v.id("agents"),
        taskId: v.optional(v.id("tasks")),
        message: v.string(),
        metadata: v.optional(v.any()),
    }),
    documents: defineTable({
        title: v.string(),
        content: v.string(),
        type: v.union(v.literal("spec"), v.literal("report"), v.literal("decision_log"), v.literal("standup"), v.literal("postmortem")),
        taskId: v.optional(v.id("tasks")),
        authorAgentId: v.id("agents"),
    }),
    notifications: defineTable({
        targetAgentId: v.id("agents"),
        sourceAgentId: v.id("agents"),
        content: v.string(),
        taskId: v.optional(v.id("tasks")),
        type: v.union(v.literal("mention"), v.literal("assignment"), v.literal("review_request"), v.literal("escalation"), v.literal("block_alert")),
        delivered: v.boolean(),
        deliveredAt: v.optional(v.number()),
    })
        .index("by_target", ["targetAgentId", "delivered"]),
});
