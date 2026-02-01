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
import { useTasks, useStore } from "../../lib/store-context";
import { COLUMN_ORDER } from "../../types";
import type { TaskStatus, Priority } from "../../types";

interface KanbanBoardProps {
  onTaskClick: (taskId: string) => void;
  onNewTask: () => void;
}

export function KanbanBoard({ onTaskClick, onNewTask }: KanbanBoardProps) {
  const tasks = useTasks();
  const store = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = COLUMN_ORDER.reduce(
    (acc, status) => {
      acc[status] = tasks
        .filter((t) => t.status === status)
        .sort((a, b) => {
          const priorityOrder = { p0: 0, p1: 1, p2: 2, p3: 3 };
          return (
            priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority]
          );
        });
      return acc;
    },
    {} as Record<TaskStatus, typeof tasks>
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

    // Determine target status
    let targetStatus: TaskStatus | null = null;

    // Check if dropped directly on a column
    if (COLUMN_ORDER.includes(overIdStr as TaskStatus)) {
      targetStatus = overIdStr as TaskStatus;
    } else {
      // Dropped on another task — find that task's status
      const overTask = tasks.find((t) => t._id === overIdStr);
      if (overTask) {
        targetStatus = overTask.status as TaskStatus;
      }
    }

    if (targetStatus) {
      const task = tasks.find((t) => t._id === taskId);
      if (task && task.status !== targetStatus) {
        store.updateTaskStatus(taskId, targetStatus);
        store.addActivity({
          type: "task_update",
          agentId: "agent_alo",
          taskId: taskId,
          message: `Moved '${task.title}' to ${targetStatus.replace("_", " ")}`,
        });
      }
    }
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 p-4 h-full min-w-max">
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
                priority={activeTask.priority as Priority}
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
