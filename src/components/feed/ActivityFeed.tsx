import { useState } from "react";
import { useActivities, useAgents } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import { timeAgo } from "../../lib/utils";
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

export function ActivityFeed() {
  const activities = useActivities();
  const agents = useAgents();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? activities
      : activities.filter((a) => a.type === filter);

  return (
    <aside className="w-72 shrink-0 bg-white/50 backdrop-blur-sm border-l border-brand-teal-light/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-charcoal">
          Live Feed
        </h2>
        {/* Filters */}
        <div className="flex flex-wrap gap-1 mt-2.5">
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
      </div>

      {/* Feed Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.map((activity) => {
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
                  <span className="text-[9px] text-gray-300 mt-0.5 block">
                    {timeAgo(activity._creationTime)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-gray-300 text-xs py-8">
            No activities yet
          </div>
        )}
      </div>
    </aside>
  );
}
