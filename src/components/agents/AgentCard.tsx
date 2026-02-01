import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { StatusDot } from "../ui/StatusDot";
import { LEVEL_LABELS } from "../../types";
import type { AgentLevel, AgentStatus } from "../../types";
import { useTasks } from "../../lib/store-context";

interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  level: AgentLevel;
  status: AgentStatus;
  avatarColor: string;
  currentTaskId?: string;
}

const levelVariants: Record<AgentLevel, "teal" | "dark" | "amber"> = {
  coordinator: "teal",
  specialist: "dark",
  intern: "amber",
};

export function AgentCard({
  name,
  role,
  level,
  status,
  avatarColor,
  currentTaskId,
}: AgentCardProps) {
  const tasks = useTasks();
  const currentTask = currentTaskId
    ? tasks.find((t) => t._id === currentTaskId)
    : undefined;

  return (
    <button
      className="w-full text-left p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-teal-light hover:shadow-sm transition-all group cursor-pointer"
      aria-label={`Agent ${name}, ${status}`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} color={avatarColor} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-brand-charcoal">{name}</span>
            <Badge variant={levelVariants[level]}>{LEVEL_LABELS[level]}</Badge>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{role}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <StatusDot status={status} pulse={status === "working"} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color:
                  status === "working"
                    ? "#2ABFBF"
                    : status === "blocked"
                      ? "#E74C3C"
                      : "#94A3B8",
              }}
            >
              {status}
            </span>
          </div>
          {currentTask && (
            <div className="mt-2 text-[11px] text-gray-500 truncate">
              🔧 {currentTask.title}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
