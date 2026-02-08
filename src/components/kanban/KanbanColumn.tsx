import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import type { TaskStatus, Priority } from "../../types";
import { COLUMN_LABELS } from "../../types";
import { cn } from "../../lib/utils";

interface TaskItem {
  _id: string;
  _creationTime: number;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  assigneeIds: string[];
  blockedReason?: string;
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskItem[];
  onTaskClick: (taskId: string) => void;
  onNewTask?: () => void;
  isMobile?: boolean;
}

const columnAccentColors: Record<TaskStatus, string> = {
  inbox: "#94A3B8",
  assigned: "#2ABFBF",
  in_progress: "#10B981",
  review: "#F59E0B",
  done: "#64748B",
  blocked: "#E74C3C",
};

export function KanbanColumn({ status, tasks, onTaskClick, onNewTask, isMobile }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const accent = columnAccentColors[status];

  return (
    <div
      className={cn(
        // Desktop: fixed width columns, Mobile: full width
        "flex flex-col shrink-0 rounded-xl transition-colors h-full",
        isMobile ? "w-full" : "min-w-[290px] w-[290px]",
        isOver && "bg-brand-teal-light/30",
        // P1-015: Blocked column red accent
        status === "blocked" && "kanban-column-blocked"
      )}
    >
      {/* Column Header — P1-011: count in header - Hidden on mobile since we have tabs */}
      <div className={cn(
        "items-center gap-2 px-3 py-2.5 mb-2",
        isMobile ? "hidden" : "flex"
      )}>
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: accent }}
        />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
          {COLUMN_LABELS[status]}
        </h3>
        <span className="ml-auto px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-md">
          {tasks.length}
        </span>
        {/* P1-012: "+" button on Inbox column */}
        {status === "inbox" && onNewTask && (
          <button
            onClick={onNewTask}
            className="ml-1 w-5 h-5 flex items-center justify-center rounded bg-brand-teal text-white text-xs hover:bg-brand-teal-dark transition-colors"
            aria-label="Create new task"
          >
            +
          </button>
        )}
      </div>

      {/* Mobile: Floating add button for inbox */}
      {isMobile && status === "inbox" && onNewTask && (
        <button
          onClick={onNewTask}
          className="fixed bottom-20 right-4 w-14 h-14 flex items-center justify-center rounded-full bg-brand-teal text-white text-2xl shadow-lg hover:bg-brand-teal-dark active:bg-brand-teal-dark transition-colors z-30"
          aria-label="Create new task"
        >
          +
        </button>
      )}

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto space-y-2 md:space-y-2 px-1 pb-4 min-h-[100px]",
          isMobile && "space-y-3 px-0" // More spacing on mobile
        )}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            // P1-016: Empty column state - w-full ensures horizontal centering
            <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center py-12 text-gray-300">
              <div className="text-3xl md:text-2xl mb-2">
                {status === "inbox" ? "📥" : status === "done" ? "✅" : status === "blocked" ? "🚧" : "📋"}
              </div>
              <p className="text-sm md:text-[11px]">No tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                id={task._id}
                title={task.title}
                description={task.description}
                priority={task.priority}
                tags={task.tags}
                assigneeIds={task.assigneeIds}
                creationTime={task._creationTime}
                blockedReason={task.blockedReason}
                onClick={() => onTaskClick(task._id)}
                isMobile={isMobile}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
