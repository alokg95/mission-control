import { useState } from "react";
import { useActivities, useAgents } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import { timeAgo, absoluteTime } from "../../lib/utils";
import { ACTIVITY_FILTERS } from "../../types";
import type { ActivityType } from "../../types";

const typeIcons: Record<ActivityType, string> = {
  task_update: "📋",
  comment: "💬",
  decision: "⚡",
  document: "📄",
  status_change: "🔄",
  handoff: "🤝",
  escalation: "🚨",
};

const PAGE_SIZE = 15;

export function ActivityFeed() {
  const activities = useActivities();
  const agents = useAgents();
  const [filter, setFilter] = useState("all");
  // P1-002: Agent filter
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  // P1-008: Pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  let filtered = filter === "all"
    ? activities
    : activities.filter((a) => a.type === filter);

  if (agentFilter) {
    filtered = filtered.filter((a) => a.agentId === agentFilter);
  }

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <aside className="w-72 shrink-0 bg-white/50 backdrop-blur-sm border-l border-brand-teal-light/50 flex flex-col">
      {/* P1-003: Section header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-charcoal">
            Live Feed
          </h2>
        </div>
        {/* Type Filters */}
        <div className="flex flex-wrap gap-1 mb-2">
          {ACTIVITY_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                filter === key
                  ? "bg-brand-teal text-white"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* P1-002: Agent filter chips */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setAgentFilter(null)}
            className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
              !agentFilter
                ? "bg-brand-charcoal text-white"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            All Agents
          </button>
          {agents.map((agent) => {
            const count = activities.filter((a) => a.agentId === agent._id).length;
            return (
              <button
                key={agent._id}
                onClick={() => setAgentFilter(agentFilter === agent._id ? null : agent._id)}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                  agentFilter === agent._id
                    ? "text-white"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
                style={
                  agentFilter === agent._id
                    ? { backgroundColor: agent.avatarColor }
                    : undefined
                }
              >
                {agent.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {displayed.map((activity) => {
          const agent = agents.find((a) => a._id === activity.agentId);
          return (
            <div
              key={activity._id}
              className="feed-entry p-2.5 rounded-lg hover:bg-white/80 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                {agent ? (
                  <Avatar
                    name={agent.name}
                    color={agent.avatarColor}
                    size="sm"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-brand-charcoal leading-relaxed">
                    <span className="font-semibold">{agent?.name ?? "Unknown"}</span>{" "}
                    <span className="text-gray-400">
                      {typeIcons[activity.type as ActivityType]}{" "}
                    </span>
                    {activity.message}
                  </p>
                  {/* P1-009: Relative timestamp with hover for absolute */}
                  <span
                    className="text-[9px] text-gray-300 mt-0.5 block cursor-default"
                    title={absoluteTime(activity._creationTime)}
                  >
                    {timeAgo(activity._creationTime)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {displayed.length === 0 && (
          <div className="text-center text-gray-300 text-xs py-8">
            No activities yet
          </div>
        )}
        {/* P1-008: Load more */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="w-full py-2 text-[10px] text-brand-teal font-semibold hover:bg-brand-teal-light/30 rounded-lg transition-colors"
          >
            Load more ({filtered.length - visibleCount} remaining)
          </button>
        )}
      </div>
    </aside>
  );
}
