// P0-012: Simple token-based auth for MVP
// Set MISSION_CONTROL_AUTH_TOKEN env var in Convex dashboard
// Clients pass token as first arg or via header

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to validate auth token
// In production, use Convex Auth or clerk — this is MVP
async function validateToken(token: string): Promise<boolean> {
  // For MVP: compare against environment variable
  // Set via `npx convex env set MISSION_CONTROL_AUTH_TOKEN <your-token>`
  const expected = process.env.MISSION_CONTROL_AUTH_TOKEN;
  if (!expected) return true; // No token set = no auth required (dev mode)
  return token === expected;
}

/**
 * Enforce auth in a mutation/query handler.
 * Reads the auth identity from Convex context.
 * In MVP mode, if MISSION_CONTROL_AUTH_TOKEN is not set, this is a no-op.
 * When the env var IS set, the client must be authenticated via Convex auth.
 */
export async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }): Promise<void> {
  const expected = process.env.MISSION_CONTROL_AUTH_TOKEN;
  if (!expected) return; // Dev mode — no auth required
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
}

export const verify = query({
  args: { token: v.string() },
  handler: async (_ctx, args) => {
    return { valid: await validateToken(args.token) };
  },
});

export const check = mutation({
  args: { token: v.string() },
  handler: async (_ctx, args) => {
    const valid = await validateToken(args.token);
    if (!valid) throw new Error("Invalid auth token");
    return { valid: true };
  },
});
