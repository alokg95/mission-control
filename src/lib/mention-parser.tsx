// P0-007: @mention parsing in comments
import type { ReactNode } from "react";

interface AgentInfo {
  _id: string;
  name: string;
}

/**
 * Parse @mentions from text and return array of matched agent IDs
 */
export function extractMentions(text: string, agents: AgentInfo[]): string[] {
  const mentionIds: string[] = [];
  for (const agent of agents) {
    const regex = new RegExp(`@${agent.name}\\b`, "gi");
    if (regex.test(text)) {
      mentionIds.push(agent._id);
    }
  }
  return mentionIds;
}

/**
 * Render text with @mentions highlighted
 */
export function renderWithMentions(text: string, agents: AgentInfo[]): ReactNode[] {
  if (!text) return [text];

  const names = agents.map((a) => a.name).join("|");
  if (!names) return [text];

  const regex = new RegExp(`(@(?:${names}))\\b`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (regex.test(part)) {
      // Reset lastIndex since we reuse the regex
      regex.lastIndex = 0;
      return (
        <span key={i} className="mention-highlight">
          {part}
        </span>
      );
    }
    // Also reset for non-matching
    regex.lastIndex = 0;
    return part;
  });
}
