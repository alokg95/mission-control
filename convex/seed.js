import { mutation } from "./_generated/server";
export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if already seeded
        const existing = await ctx.db.query("agents").first();
        if (existing)
            return "already seeded";
        // Create agents
        const alo = await ctx.db.insert("agents", {
            name: "Alo",
            role: "Main Coordinator",
            level: "coordinator",
            status: "working",
            sessionKey: "agent:main:main",
            avatarColor: "#2ABFBF",
            lastHeartbeat: Date.now(),
            currentTaskId: undefined,
        });
        const dev = await ctx.db.insert("agents", {
            name: "Dev",
            role: "Developer Agent",
            level: "specialist",
            status: "working",
            sessionKey: "agent:main:subagent:dev",
            avatarColor: "#6366F1",
            lastHeartbeat: Date.now(),
            currentTaskId: undefined,
        });
        const raj = await ctx.db.insert("agents", {
            name: "Raj",
            role: "QA Engineer",
            level: "specialist",
            status: "idle",
            sessionKey: "agent:main:subagent:qa",
            avatarColor: "#F59E0B",
            lastHeartbeat: Date.now() - 300000,
            currentTaskId: undefined,
        });
        const pm = await ctx.db.insert("agents", {
            name: "PM",
            role: "Product Manager",
            level: "specialist",
            status: "working",
            sessionKey: "agent:main:subagent:pm",
            avatarColor: "#F43F5E",
            lastHeartbeat: Date.now(),
            currentTaskId: undefined,
        });
        // Create tasks
        const t1 = await ctx.db.insert("tasks", {
            title: "Fix video export timeout on large files",
            description: "Users report exports failing for files >500MB. Need to implement chunked upload with retry logic.",
            status: "in_progress",
            priority: "p0",
            assigneeIds: [dev],
            tags: ["bug", "urgent", "video-export"],
            createdBy: "alok",
        });
        const t2 = await ctx.db.insert("tasks", {
            title: "Write spec: Webhook retry logic v2",
            description: "Define retry backoff strategy, dead letter queue, and monitoring for failed webhook deliveries.",
            status: "in_progress",
            priority: "p1",
            assigneeIds: [pm],
            tags: ["spec", "webhooks"],
            createdBy: "Alo",
        });
        const t3 = await ctx.db.insert("tasks", {
            title: "API rate limit handling for enterprise tier",
            description: "Implement per-customer rate limiting with configurable thresholds. Enterprise gets 10x default limits.",
            status: "review",
            priority: "p1",
            assigneeIds: [dev, raj],
            tags: ["feature", "api", "enterprise"],
            createdBy: "PM",
        });
        const t4 = await ctx.db.insert("tasks", {
            title: "Dashboard analytics: video completion rates",
            description: "Add video completion rate metrics to the analytics dashboard. Show daily/weekly/monthly trends.",
            status: "assigned",
            priority: "p2",
            assigneeIds: [dev],
            tags: ["feature", "analytics"],
            createdBy: "PM",
        });
        await ctx.db.insert("tasks", {
            title: "Investigate Stripe webhook failures",
            description: "3 customers reported missing subscription updates. Check webhook logs and Stripe dashboard.",
            status: "inbox",
            priority: "p1",
            assigneeIds: [],
            tags: ["bug", "billing"],
            createdBy: "alok",
        });
        await ctx.db.insert("tasks", {
            title: "Mobile responsive video player",
            description: "Video player clips on screens < 768px. Need proper responsive layout with touch controls.",
            status: "inbox",
            priority: "p2",
            assigneeIds: [],
            tags: ["bug", "mobile", "video-player"],
            createdBy: "Alo",
        });
        await ctx.db.insert("tasks", {
            title: "Add team member invite flow",
            description: "Allow workspace owners to invite team members via email. Include role selection and onboarding.",
            status: "assigned",
            priority: "p2",
            assigneeIds: [pm],
            tags: ["feature", "teams"],
            createdBy: "alok",
        });
        await ctx.db.insert("tasks", {
            title: "E2E test suite for auth flows",
            description: "Playwright tests covering login, signup, password reset, OAuth, and session management.",
            status: "in_progress",
            priority: "p2",
            assigneeIds: [raj],
            tags: ["testing", "auth"],
            createdBy: "Raj",
        });
        await ctx.db.insert("tasks", {
            title: "Customer onboarding email sequence",
            description: "Design and implement 5-email drip campaign for new signups. Include video tutorials.",
            status: "inbox",
            priority: "p3",
            assigneeIds: [],
            tags: ["marketing", "email"],
            createdBy: "PM",
        });
        await ctx.db.insert("tasks", {
            title: "Migrate to Node 22 runtime",
            description: "Update all serverless functions to Node 22. Test for breaking changes in dependencies.",
            status: "done",
            priority: "p2",
            assigneeIds: [dev],
            tags: ["infra", "migration"],
            createdBy: "Dev",
            completedAt: Date.now() - 86400000,
        });
        await ctx.db.insert("tasks", {
            title: "Security audit: JWT token rotation",
            description: "Review and fix JWT refresh token rotation. Ensure tokens expire correctly and refresh is atomic.",
            status: "blocked",
            priority: "p0",
            assigneeIds: [dev],
            tags: ["security", "auth", "urgent"],
            createdBy: "alok",
            blockedReason: "Waiting on Auth0 support ticket #4521 for custom claim limits",
        });
        await ctx.db.insert("tasks", {
            title: "Write postmortem: Jan 28 outage",
            description: "Document root cause, timeline, and remediation steps for the 45-minute API outage.",
            status: "review",
            priority: "p1",
            assigneeIds: [pm],
            tags: ["postmortem", "incident"],
            createdBy: "Alo",
        });
        // Update agent current tasks
        await ctx.db.patch(dev, { currentTaskId: t1 });
        await ctx.db.patch(pm, { currentTaskId: t2 });
        // Create activities
        const now = Date.now();
        await ctx.db.insert("activities", {
            type: "task_update",
            agentId: dev,
            taskId: t1,
            message: "Moved 'Fix video export timeout' to In Progress",
        });
        await ctx.db.insert("activities", {
            type: "comment",
            agentId: raj,
            taskId: t3,
            message: "Commented on 'API rate limit handling': Edge case found in burst mode — adding test coverage",
        });
        await ctx.db.insert("activities", {
            type: "status_change",
            agentId: dev,
            message: "Dev went IDLE → WORKING",
            metadata: { from: "idle", to: "working" },
        });
        await ctx.db.insert("activities", {
            type: "decision",
            agentId: alo,
            message: "Decided: Prioritize video export fix over analytics dashboard",
        });
        await ctx.db.insert("activities", {
            type: "handoff",
            agentId: dev,
            taskId: t3,
            message: "Dev requested review from Raj on 'API rate limit handling'",
        });
        await ctx.db.insert("activities", {
            type: "document",
            agentId: pm,
            message: "Created spec: 'Webhook Retry Logic v2'",
        });
        await ctx.db.insert("activities", {
            type: "comment",
            agentId: pm,
            taskId: t4,
            message: "Commented on 'Dashboard analytics': Spec attached, ready for dev pickup",
        });
        await ctx.db.insert("activities", {
            type: "escalation",
            agentId: alo,
            message: "Escalated 'Security audit: JWT rotation' to Alok — blocked on Auth0 support",
        });
        await ctx.db.insert("activities", {
            type: "task_update",
            agentId: raj,
            taskId: t3,
            message: "Moved 'API rate limit handling' to Review",
        });
        await ctx.db.insert("activities", {
            type: "status_change",
            agentId: pm,
            message: "PM went IDLE → WORKING",
            metadata: { from: "idle", to: "working" },
        });
        // Create some notifications
        await ctx.db.insert("notifications", {
            targetAgentId: raj,
            sourceAgentId: dev,
            content: "Dev requested your review on 'API rate limit handling'",
            taskId: t3,
            type: "review_request",
            delivered: true,
            deliveredAt: now - 3600000,
        });
        await ctx.db.insert("notifications", {
            targetAgentId: dev,
            sourceAgentId: alo,
            content: "@Dev please prioritize the video export fix — 3 enterprise customers affected",
            taskId: t1,
            type: "mention",
            delivered: false,
        });
        return "seeded";
    },
});
