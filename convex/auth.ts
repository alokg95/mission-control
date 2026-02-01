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
