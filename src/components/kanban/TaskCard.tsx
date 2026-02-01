import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { PRIORITY_COLORS } from "../../types";
import type { Priority } from "../../types";
import { useAgents } from "../../lib/store-context";
import { timeAgo } from "../../lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  assigneeIds: string[];
  creationTime: number;
  blockedReason?: string;
  onClick: () => void;
}

export function TaskCard({
  id,
  title,
  description,
  priority,
  tags,
  assigneeIds,
  creationTime,
  blockedReason,
  onClick,
}: TaskCardProps) {
  const agents = useAgents();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeftColor: PRIORITY_COLORS[priority],
  };

  const assignees = assigneeIds
    .map((aid) => agents.find((a) => a._id === aid))
    .filter(Boolean);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card bg-white rounded-lg border border-gray-100 border-l-[3px] p-3 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${title}`}
    >
      {/* Title */}
      <h4 className="text-[13px] font-semibold text-brand-charcoal leading-snug line-clamp-2">
        {title}
      </h4>

      {/* Description */}
      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Blocked reason */}
      {blockedReason && (
        <div className="mt-2 text-[10px] text-red-500 bg-red-50 rounded px-2 py-1 line-clamp-1">
          ⚠️ {blockedReason}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default" className="!text-[9px] !px-1.5 !py-0">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <span className="text-[9px] text-gray-400">+{tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: Assignees + Time — P1-014: relative age */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex -space-x-1.5">
          {assignees.map((a) =>
            a ? (
              <Avatar
                key={a._id}
                name={a.name}
                color={a.avatarColor}
                size="sm"
                className="ring-2 ring-white"
              />
            ) : null
          )}
        </div>
        <span className="text-[10px] text-gray-300" title={new Date(creationTime).toLocaleString()}>
          {timeAgo(creationTime)}
        </span>
      </div>
    </div>
  );
}
