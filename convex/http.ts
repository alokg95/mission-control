import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

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
] as const;

type ActivityType = (typeof VALID_ACTIVITY_TYPES)[number];

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

    const body = (await request.json()) as {
      type?: string;
      agentName?: string;
      taskId?: string;
      message?: string;
      metadata?: Record<string, unknown>;
    };
    const { type, agentName, taskId, message, metadata } = body;

    // Validate required fields
    if (!type || !agentName || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: type, agentName, message",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate type
    if (!VALID_ACTIVITY_TYPES.includes(type as ActivityType)) {
      return new Response(
        JSON.stringify({
          error: `Invalid type. Must be one of: ${VALID_ACTIVITY_TYPES.join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Look up agent by name using indexed query
    const agent = await ctx.runQuery(api.agents.getByName, { name: agentName });

    if (!agent) {
      return new Response(
        JSON.stringify({ error: `Agent not found: ${agentName}` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log the activity (skip auth for HTTP actions)
    const activityId = await ctx.runMutation(api.activities.logFromHttp, {
      type: type as ActivityType,
      agentId: agent._id,
      taskId: taskId as Id<"tasks"> | undefined,
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
