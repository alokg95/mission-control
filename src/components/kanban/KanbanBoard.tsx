import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { useTasks, useAgents, useMutations } from "../../lib/store-context";
import { COLUMN_ORDER } from "../../types";
import type { TaskStatus, Priority } from "../../types";
import { isValidTransition, getTransitionError } from "../../lib/task-state-machine";
import { useToast } from "../../lib/toast";
import { Avatar } from "../ui/Avatar";

interface KanbanBoardProps {
  onTaskClick: (taskId: string) => void;
  onNewTask: () => void;
  onBlockedPrompt: (taskId: string, taskTitle: string) => void;
}

export function KanbanBoard({ onTaskClick, onNewTask, onBlockedPrompt }: KanbanBoardProps) {
  const tasks = useTasks();
  const agents = useAgents();
  const mutations = useMutations();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  // P1-001: Filter state
  const [filterAgent, setFilterAgent] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // P1-001: Apply filters
  let filteredTasks = tasks;
  if (filterAgent) {
    filteredTasks = filteredTasks.filter((t) => t.assigneeIds.includes(filterAgent));
  }
  if (filterPriority) {
    filteredTasks = filteredTasks.filter((t) => t.priority === filterPriority);
  }
  if (filterTag) {
    filteredTasks = filteredTasks.filter((t) => t.tags.includes(filterTag));
  }

  // Collect all unique tags for filter
  const allTags = [...new Set(tasks.flatMap((t) => t.tags))].sort();

  const tasksByStatus = COLUMN_ORDER.reduce(
    (acc, status) => {
      acc[status] = filteredTasks
        .filter((t) => t.status === status)
        .sort((a, b) => {
          const priorityOrder: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
          return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
        });
      return acc;
    },
    {} as Record<TaskStatus, typeof filteredTasks>
  );

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = String(active.id);
    const overIdStr = String(over.id);

    let targetStatus: TaskStatus | null = null;

    if (COLUMN_ORDER.includes(overIdStr as TaskStatus)) {
      targetStatus = overIdStr as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t._id === overIdStr);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    // P0-002: Validate transition
    if (!isValidTransition(task.status, targetStatus)) {
      const err = getTransitionError(task.status, targetStatus);
      if (err) toast(err, "error");
      return; // snap back
    }

    // P1-018: Confirm for Review → Assigned (rejection)
    if (task.status === "review" && targetStatus === "assigned") {
      if (!window.confirm(`Reject "${task.title}" and send back to Assigned?`)) {
        return;
      }
    }

    // P0-008: Blocked reason prompt
    if (targetStatus === "blocked") {
      onBlockedPrompt(taskId, task.title);
      return;
    }

    mutations.updateTaskStatus(taskId, targetStatus);
  }

  return (
    <div className="flex-1 overflow-x-auto">
      {/* P1-003: Section header */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-teal shrink-0" />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-charcoal">
          Mission Queue
        </h2>
      </div>
      {/* P1-001: Filter bar */}
      <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
        {/* Agent filter */}
        {agents.map((agent) => (
          <button
            key={agent._id}
            onClick={() => setFilterAgent(filterAgent === agent._id ? null : agent._id)}
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
              filterAgent === agent._id
                ? "text-white"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
            style={filterAgent === agent._id ? { backgroundColor: agent.avatarColor } : undefined}
          >
            <Avatar name={agent.name} color={agent.avatarColor} size="sm" />
            {agent.name}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200" />
        {/* Priority filter */}
        {(["p0", "p1", "p2", "p3"] as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(filterPriority === p ? null : p)}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full transition-colors ${
              filterPriority === p
                ? "bg-brand-charcoal text-white"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200" />
        {/* Tag filter (show top 5) */}
        {allTags.slice(0, 5).map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
              filterTag === tag
                ? "bg-brand-teal text-white"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
        {/* Clear filters */}
        {(filterAgent || filterPriority || filterTag) && (
          <button
            onClick={() => { setFilterAgent(null); setFilterPriority(null); setFilterTag(null); }}
            className="px-2 py-0.5 text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 px-4 pb-4 h-[calc(100%-2rem)] min-w-max">
          {COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={onTaskClick}
              onNewTask={status === "inbox" ? onNewTask : undefined}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="drag-overlay">
              <TaskCard
                id={activeTask._id}
                title={activeTask.title}
                description={activeTask.description}
                priority={activeTask.priority}
                tags={activeTask.tags}
                assigneeIds={activeTask.assigneeIds}
                creationTime={activeTask._creationTime}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
