import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo, cn, absoluteTime, formatClockTime, formatClockDate } from "./utils";

describe("utils", () => {
  describe("timeAgo", () => {
    const now = Date.now();

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "just now" for timestamps less than 60 seconds ago', () => {
      expect(timeAgo(now - 30000)).toBe("just now");
      expect(timeAgo(now - 59000)).toBe("just now");
    });

    it("returns minutes ago for timestamps 1-59 minutes ago", () => {
      expect(timeAgo(now - 60000)).toBe("1m ago");
      expect(timeAgo(now - 120000)).toBe("2m ago");
      expect(timeAgo(now - 3540000)).toBe("59m ago");
    });

    it("returns hours ago for timestamps 1-23 hours ago", () => {
      expect(timeAgo(now - 3600000)).toBe("1h ago");
      expect(timeAgo(now - 7200000)).toBe("2h ago");
      expect(timeAgo(now - 82800000)).toBe("23h ago");
    });

    it("returns days ago for timestamps 1-6 days ago", () => {
      expect(timeAgo(now - 86400000)).toBe("1d ago");
      expect(timeAgo(now - 172800000)).toBe("2d ago");
      expect(timeAgo(now - 518400000)).toBe("6d ago");
    });

    it("returns formatted date for timestamps 7+ days ago", () => {
      const oldDate = now - 604800000; // 7 days
      const result = timeAgo(oldDate);
      // Should be a date string, not "Xd ago"
      expect(result).not.toContain("d ago");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe("cn", () => {
    it("joins class names with space", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("filters out falsy values", () => {
      expect(cn("foo", false, "bar")).toBe("foo bar");
      expect(cn("foo", null, "bar")).toBe("foo bar");
      expect(cn("foo", undefined, "bar")).toBe("foo bar");
    });

    it("handles empty input", () => {
      expect(cn()).toBe("");
    });

    it("handles all falsy values", () => {
      expect(cn(false, null, undefined)).toBe("");
    });

    it("handles conditional classes", () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
        "base active"
      );
    });
  });

  describe("absoluteTime", () => {
    it("formats timestamp to readable date string", () => {
      // Use a fixed date for consistent testing
      const timestamp = new Date("2026-02-08T14:30:00").getTime();
      const result = absoluteTime(timestamp);
      expect(result).toContain("Feb");
      expect(result).toContain("8");
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("formatClockTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-02-08T14:30:45"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns 24-hour time format", () => {
      const result = formatClockTime();
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
      expect(result).toBe("14:30:45");
    });
  });

  describe("formatClockDate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-02-08T14:30:45"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns uppercase formatted date", () => {
      const result = formatClockDate();
      expect(result).toBe(result.toUpperCase());
      expect(result).toContain("FEB");
      expect(result).toContain("8");
    });
  });
});
