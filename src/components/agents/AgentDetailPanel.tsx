// P0-004: Agent detail slide-out panel
import { useEffect, useRef } from "react";
import { useAgents, useTasks, useActivities } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { StatusDot } from "../ui/StatusDot";
import { timeAgo, absoluteTime } from "../../lib/utils";
import { LEVEL_LABELS, LEVEL_VARIANTS, getStatusColor } from "../../types";
import type { AgentLevel, AgentStatus } from "../../types";

interface AgentDetailPanelProps {
  agentId: string;
  onClose: () => void;
}

export function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
  const agents = useAgents();
  const tasks = useTasks();
  const activities = useActivities();
  const panelRef = useRef<HTMLDivElement>(null);
  const agent = agents.find((a) => a._id === agentId);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!agent) return null;

  const agentTasks = tasks.filter((t) => t.assigneeIds.includes(agentId));
  const agentActivities = activities
    .filter((a) => a.agentId === agentId)
    .slice(0, 15);

  const completedTasks = agentTasks.filter((t) => t.status === "done");
  const activeTasks = agentTasks.filter((t) => t.status !== "done");

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="w-full md:w-96 bg-white h-full shadow-2xl slide-in-right overflow-y-auto overscroll-contain safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={agent.name} color={agent.avatarColor} size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-brand-charcoal">{agent.name}</h2>
                  <Badge variant={LEVEL_VARIANTS[agent.level as AgentLevel]}>
                    {LEVEL_LABELS[agent.level as AgentLevel]}
                  </Badge>
                </div>
                <p className="text-sm md:text-xs text-gray-400 mt-0.5">{agent.role}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <StatusDot status={agent.status as AgentStatus} pulse={agent.status === "working"} />
                  <span
                    className="text-[11px] md:text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: getStatusColor(agent.status as AgentStatus) }}
                  >
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Session Info */}
        <div className="p-4 md:p-5 border-b border-gray-100">
          <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-2">
            Session Info
          </h3>
          <div className="space-y-2 md:space-y-1.5 text-sm md:text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Session Key</span>
              <span className="font-mono text-[11px] md:text-[10px] bg-gray-50 px-2 py-1 rounded">{agent.sessionKey}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Last Heartbeat</span>
              <span title={absoluteTime(agent.lastHeartbeat)}>
                {timeAgo(agent.lastHeartbeat)}
              </span>
            </div>
            {agent.config?.model && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Model</span>
                <span>{agent.config.model}</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Tasks */}
        <div className="p-4 md:p-5 border-b border-gray-100">
          <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-2">
            Active Tasks ({activeTasks.length})
          </h3>
          {activeTasks.length === 0 ? (
            <p className="text-sm md:text-xs text-gray-300">No active tasks</p>
          ) : (
            <div className="space-y-2">
              {activeTasks.map((t) => (
                <div
                  key={t._id}
                  className="p-3 md:p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <h4 className="text-sm md:text-xs font-semibold text-brand-charcoal truncate">
                    {t.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 md:mt-1">
                    <Badge
                      variant={
                        t.priority === "p0"
                          ? "red"
                          : t.priority === "p1"
                            ? "amber"
                            : "default"
                      }
                    >
                      {t.priority.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] md:text-[10px] text-gray-400 uppercase">
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task History */}
        <div className="p-4 md:p-5 border-b border-gray-100">
          <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-2">
            Completed ({completedTasks.length})
          </h3>
          {completedTasks.length === 0 ? (
            <p className="text-sm md:text-xs text-gray-300">No completed tasks</p>
          ) : (
            <div className="space-y-2 md:space-y-1.5">
              {completedTasks.map((t) => (
                <div key={t._id} className="text-sm md:text-xs text-gray-500 truncate">
                  ✅ {t.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-4 md:p-5">
          <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-2">
            Recent Activity
          </h3>
          {agentActivities.length === 0 ? (
            <p className="text-sm md:text-xs text-gray-300">No recent activity</p>
          ) : (
            <div className="space-y-3 md:space-y-2">
              {agentActivities.map((a) => (
                <div key={a._id} className="text-sm md:text-[11px] text-gray-600 leading-relaxed">
                  <p>{a.message}</p>
                  <span className="text-[10px] md:text-[9px] text-gray-300" title={absoluteTime(a._creationTime)}>
                    {timeAgo(a._creationTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
