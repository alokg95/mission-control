import { describe, it, expect } from "vitest";
import { extractMentions, renderWithMentions } from "./mention-parser";

const mockAgents = [
  { _id: "agent_1", name: "Dev" },
  { _id: "agent_2", name: "PM" },
  { _id: "agent_3", name: "Raj" },
  { _id: "agent_4", name: "Alo" },
];

describe("mention-parser", () => {
  describe("extractMentions", () => {
    it("extracts single mention", () => {
      const result = extractMentions("Hey @Dev, can you check this?", mockAgents);
      expect(result).toEqual(["agent_1"]);
    });

    it("extracts multiple mentions", () => {
      const result = extractMentions("@Dev and @PM please review", mockAgents);
      expect(result).toContain("agent_1");
      expect(result).toContain("agent_2");
      expect(result).toHaveLength(2);
    });

    it("handles case-insensitive mentions", () => {
      const result = extractMentions("Hey @dev and @DEV", mockAgents);
      expect(result).toEqual(["agent_1"]);
    });

    it("returns empty array for no mentions", () => {
      const result = extractMentions("No mentions here", mockAgents);
      expect(result).toEqual([]);
    });

    it("ignores non-existent agent names", () => {
      const result = extractMentions("@NonExistent @Dev", mockAgents);
      expect(result).toEqual(["agent_1"]);
    });

    it("handles mentions at start of text", () => {
      const result = extractMentions("@Raj please check", mockAgents);
      expect(result).toEqual(["agent_3"]);
    });

    it("handles mentions at end of text", () => {
      const result = extractMentions("Check with @Alo", mockAgents);
      expect(result).toEqual(["agent_4"]);
    });

    it("handles empty text", () => {
      const result = extractMentions("", mockAgents);
      expect(result).toEqual([]);
    });

    it("handles empty agents list", () => {
      const result = extractMentions("@Dev please review", []);
      expect(result).toEqual([]);
    });

    it("matches word boundaries (no partial matches)", () => {
      const result = extractMentions("@Developer is not @Dev", mockAgents);
      expect(result).toEqual(["agent_1"]);
    });
  });

  describe("renderWithMentions", () => {
    it("returns text without mentions unchanged", () => {
      const result = renderWithMentions("No mentions here", mockAgents);
      expect(result).toEqual(["No mentions here"]);
    });

    it("highlights mentions in the text", () => {
      const result = renderWithMentions("Hey @Dev check this", mockAgents);
      expect(result).toHaveLength(3); // "Hey ", "@Dev", " check this"
    });

    it("handles empty text", () => {
      const result = renderWithMentions("", mockAgents);
      expect(result).toEqual([""]);
    });

    it("handles multiple mentions", () => {
      const result = renderWithMentions("@Dev and @PM review", mockAgents);
      // Should split into parts with mentions highlighted
      expect(result.length).toBeGreaterThan(1);
    });

    it("handles empty agents list", () => {
      const result = renderWithMentions("@Dev please review", []);
      expect(result).toEqual(["@Dev please review"]);
    });
  });
});
