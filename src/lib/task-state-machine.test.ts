import { describe, it, expect } from "vitest";
import {
  isValidTransition,
  getValidNextStatuses,
  getTransitionError,
} from "./task-state-machine";
import type { TaskStatus } from "../types";

describe("task-state-machine", () => {
  describe("isValidTransition", () => {
    // Valid transitions from inbox
    it("allows inbox → assigned", () => {
      expect(isValidTransition("inbox", "assigned")).toBe(true);
    });

    it("blocks inbox → in_progress (must go through assigned)", () => {
      expect(isValidTransition("inbox", "in_progress")).toBe(false);
    });

    it("blocks inbox → done (must go through workflow)", () => {
      expect(isValidTransition("inbox", "done")).toBe(false);
    });

    // Valid transitions from assigned
    it("allows assigned → inbox (de-assign)", () => {
      expect(isValidTransition("assigned", "inbox")).toBe(true);
    });

    it("allows assigned → in_progress", () => {
      expect(isValidTransition("assigned", "in_progress")).toBe(true);
    });

    it("blocks assigned → done (must go through review)", () => {
      expect(isValidTransition("assigned", "done")).toBe(false);
    });

    // Valid transitions from in_progress
    it("allows in_progress → review", () => {
      expect(isValidTransition("in_progress", "review")).toBe(true);
    });

    it("allows in_progress → blocked", () => {
      expect(isValidTransition("in_progress", "blocked")).toBe(true);
    });

    it("allows in_progress → inbox (abandon)", () => {
      expect(isValidTransition("in_progress", "inbox")).toBe(true);
    });

    it("blocks in_progress → done (must go through review)", () => {
      expect(isValidTransition("in_progress", "done")).toBe(false);
    });

    // Valid transitions from review
    it("allows review → done", () => {
      expect(isValidTransition("review", "done")).toBe(true);
    });

    it("allows review → assigned (rejection)", () => {
      expect(isValidTransition("review", "assigned")).toBe(true);
    });

    it("allows review → inbox", () => {
      expect(isValidTransition("review", "inbox")).toBe(true);
    });

    // Done is terminal
    it("blocks done → any status (terminal)", () => {
      const allStatuses: TaskStatus[] = [
        "inbox",
        "assigned",
        "in_progress",
        "review",
        "blocked",
      ];
      for (const status of allStatuses) {
        expect(isValidTransition("done", status)).toBe(false);
      }
    });

    // Blocked can be unblocked
    it("allows blocked → in_progress (unblock)", () => {
      expect(isValidTransition("blocked", "in_progress")).toBe(true);
    });

    it("allows blocked → inbox (abandon)", () => {
      expect(isValidTransition("blocked", "inbox")).toBe(true);
    });

    it("allows blocked → assigned", () => {
      expect(isValidTransition("blocked", "assigned")).toBe(true);
    });

    // Same status is not a transition
    it("blocks same status transitions", () => {
      const allStatuses: TaskStatus[] = [
        "inbox",
        "assigned",
        "in_progress",
        "review",
        "done",
        "blocked",
      ];
      for (const status of allStatuses) {
        expect(isValidTransition(status, status)).toBe(false);
      }
    });
  });

  describe("getValidNextStatuses", () => {
    it("returns correct next statuses for inbox", () => {
      expect(getValidNextStatuses("inbox")).toEqual(["assigned"]);
    });

    it("returns correct next statuses for assigned", () => {
      expect(getValidNextStatuses("assigned")).toEqual(["inbox", "in_progress"]);
    });

    it("returns correct next statuses for in_progress", () => {
      expect(getValidNextStatuses("in_progress")).toEqual([
        "inbox",
        "review",
        "blocked",
      ]);
    });

    it("returns correct next statuses for review", () => {
      expect(getValidNextStatuses("review")).toEqual([
        "inbox",
        "done",
        "assigned",
      ]);
    });

    it("returns empty array for done (terminal)", () => {
      expect(getValidNextStatuses("done")).toEqual([]);
    });

    it("returns correct next statuses for blocked", () => {
      expect(getValidNextStatuses("blocked")).toEqual([
        "inbox",
        "in_progress",
        "assigned",
      ]);
    });
  });

  describe("getTransitionError", () => {
    it("returns null for valid transitions", () => {
      expect(getTransitionError("inbox", "assigned")).toBeNull();
      expect(getTransitionError("in_progress", "review")).toBeNull();
      expect(getTransitionError("review", "done")).toBeNull();
    });

    it("returns null for same-status (not an error, just no-op)", () => {
      expect(getTransitionError("inbox", "inbox")).toBeNull();
    });

    it("returns error message for invalid transitions", () => {
      const error = getTransitionError("inbox", "done");
      expect(error).toBe('Cannot move from "inbox" to "done"');
    });

    it("returns error message for terminal state transition", () => {
      const error = getTransitionError("done", "inbox");
      expect(error).toBe('Cannot move from "done" to "inbox"');
    });
  });
});
