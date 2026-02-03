import { useState, useRef, useEffect } from "react";
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
  onClick: () => void;
  onAssignTask?: (agentId: string) => void;
  onSendMessage?: (agentId: string) => void;
}

const levelVariants: Record<AgentLevel, "teal" | "dark" | "amber"> = {
  coordinator: "teal",
  specialist: "dark",
  intern: "amber",
};

export function AgentCard({
  id,
  name,
  role,
  level,
  status,
  avatarColor,
  currentTaskId,
  onClick,
  onAssignTask,
  onSendMessage,
}: AgentCardProps) {
  const tasks = useTasks();
  const currentTask = currentTaskId
    ? tasks.find((t) => t._id === currentTaskId)
    : undefined;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // P0-005: Close kebab menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  // Long press handler for mobile context menu
  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowMenu(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div className="relative h-full">
      <button
        className="w-full h-full text-left p-4 md:p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-teal-light hover:shadow-sm active:border-brand-teal-light active:shadow-sm transition-all group cursor-pointer"
        aria-label={`Agent ${name}, ${status}`}
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="flex items-start gap-3">
          <Avatar name={name} color={avatarColor} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-brand-charcoal">{name}</span>
              <Badge variant={levelVariants[level]}>{LEVEL_LABELS[level]}</Badge>
            </div>
            <div className="text-xs md:text-[11px] text-gray-400 mt-0.5">{role}</div>
            <div className="flex items-center gap-1.5 mt-2 md:mt-1.5">
              <StatusDot status={status} pulse={status === "working"} />
              <span
                className="text-[11px] md:text-[10px] font-semibold uppercase tracking-wider"
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
            {/* P1-013: Show current task on card */}
            {currentTask && (
              <div className="mt-2 text-xs md:text-[11px] text-gray-500 truncate">
                🔧 {currentTask.title}
              </div>
            )}
          </div>

          {/* P0-005: Kebab menu - visible on hover (desktop) or long-press (mobile) */}
          <div
            ref={menuRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="w-8 h-8 md:w-6 md:h-6 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-100 text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              aria-label="Agent actions"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 md:top-7 w-48 md:w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
                <button
                  className="w-full text-left px-4 py-3 md:px-3 md:py-2 text-sm md:text-xs text-gray-600 hover:bg-gray-50 active:bg-gray-50 transition-colors"
                  onClick={() => { setShowMenu(false); onAssignTask?.(id); }}
                >
                  Assign Task
                </button>
                <button
                  className="w-full text-left px-4 py-3 md:px-3 md:py-2 text-sm md:text-xs text-gray-600 hover:bg-gray-50 active:bg-gray-50 transition-colors"
                  onClick={() => { setShowMenu(false); onSendMessage?.(id); }}
                >
                  Send Message
                </button>
                {["View Session Log", "Restart Session"].map(
                  (action) => (
                    <button
                      key={action}
                      className="w-full text-left px-4 py-3 md:px-3 md:py-2 text-sm md:text-xs text-gray-600 hover:bg-gray-50 active:bg-gray-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      {action}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
