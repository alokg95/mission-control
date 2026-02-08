import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
const http = httpRouter();
// Simple API key auth for agent logging
const AGENT_API_KEY = process.env.AGENT_API_KEY || "mc-agent-key-2026";
const VALID_ACTIVITY_TYPES = [
    "task_update",
    "comment",
    "decision",
    "document",
    "status_change",
    "handoff",
    "escalation",
];
// POST /api/activity - Log activity from agents
http.route({
    path: "/api/activity",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // Check API key
        const authHeader = request.headers.get("Authorization");
        if (authHeader !== `Bearer ${AGENT_API_KEY}`) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const body = (await request.json());
        const { type, agentName, taskId, message, metadata } = body;
        // Validate required fields
        if (!type || !agentName || !message) {
            return new Response(JSON.stringify({
                error: "Missing required fields: type, agentName, message",
            }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        // Validate type
        if (!VALID_ACTIVITY_TYPES.includes(type)) {
            return new Response(JSON.stringify({
                error: `Invalid type. Must be one of: ${VALID_ACTIVITY_TYPES.join(", ")}`,
            }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        // Look up agent by name
        const agents = await ctx.runQuery(api.agents.list);
        const agent = agents.find((a) => a.name.toLowerCase() === agentName.toLowerCase());
        if (!agent) {
            return new Response(JSON.stringify({ error: `Agent not found: ${agentName}` }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        // Log the activity (skip auth for HTTP actions)
        const activityId = await ctx.runMutation(api.activities.logFromHttp, {
            type: type,
            agentId: agent._id,
            taskId: taskId,
            message,
            metadata,
        });
        return new Response(JSON.stringify({ ok: true, activityId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});
export default http;
