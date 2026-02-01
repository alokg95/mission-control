/* eslint-disable */
// Stub generated API types for build without `npx convex dev`
// Run `npx convex dev` to generate real types

import type { FunctionReference } from "convex/server";

type AnyQuery = FunctionReference<"query">;
type AnyMutation = FunctionReference<"mutation">;

declare const api: {
  agents: {
    list: AnyQuery;
    updateStatus: AnyMutation;
  };
  tasks: {
    list: AnyQuery;
    byStatus: AnyQuery;
    get: AnyQuery;
    create: AnyMutation;
    updateStatus: AnyMutation;
    update: AnyMutation;
    remove: AnyMutation;
  };
  messages: {
    byTask: AnyQuery;
    send: AnyMutation;
  };
  activities: {
    recent: AnyQuery;
    log: AnyMutation;
  };
  notifications: {
    undelivered: AnyQuery;
    create: AnyMutation;
    markDelivered: AnyMutation;
  };
  documents: {
    list: AnyQuery;
    get: AnyQuery;
    byTask: AnyQuery;
    create: AnyMutation;
    update: AnyMutation;
    remove: AnyMutation;
  };
  seed: {
    seed: AnyMutation;
  };
};

export { api };
