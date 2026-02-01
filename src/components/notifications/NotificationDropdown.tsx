// P0-006: Notification dropdown panel
import { useEffect, useRef } from "react";
import { useAgents, useActivities } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import { timeAgo } from "../../lib/utils";

interface NotificationDropdownProps {
  onClose: () => void;
}

// In mock mode, we derive "notifications" from recent activities
// In Convex mode, this would use notifications.undelivered query

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const activities = useActivities();
  const agents = useAgents();

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Show recent activities as notifications (mentions, assignments, reviews, escalations)
  const notifTypes = new Set(["escalation", "handoff", "comment"]);
  const notifications = activities
    .filter((a) => notifTypes.has(a.type))
    .slice(0, 10);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
          Notifications
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((n) => {
            const agent = agents.find((a) => a._id === n.agentId);
            return (
              <div
                key={n._id}
                className="flex items-start gap-2.5 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                {agent ? (
                  <Avatar name={agent.name} color={agent.avatarColor} size="sm" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                  <span className="text-[9px] text-gray-300 mt-0.5 block">
                    {timeAgo(n._creationTime)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
