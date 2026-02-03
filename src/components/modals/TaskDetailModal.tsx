import { useState, useEffect, useRef } from "react";
import { useAgents, useMessagesByTask, useTasks, useMutations } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { timeAgo, absoluteTime } from "../../lib/utils";
import {
  COLUMN_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "../../types";
import type { TaskStatus, Priority } from "../../types";
import { getValidNextStatuses } from "../../lib/task-state-machine";
import { extractMentions, renderWithMentions } from "../../lib/mention-parser";
import { useToast } from "../../lib/toast";

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  onBlockedPrompt: (taskId: string, taskTitle: string) => void;
}

export function TaskDetailModal({ taskId, onClose, onBlockedPrompt }: TaskDetailModalProps) {
  const agents = useAgents();
  const tasks = useTasks();
  const mutations = useMutations();
  const messages = useMessagesByTask(taskId);
  const { toast } = useToast();
  const task = tasks.find((t) => t._id === taskId);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title ?? "");
  const [editDesc, setEditDesc] = useState(task?.description ?? "");
  const modalRef = useRef<HTMLDivElement>(null);

  // P1-007: Focus trap + Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      // Trap tab
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!task) return null;

  // P0-003: Only show valid next statuses
  const validNextStatuses = getValidNextStatuses(task.status);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;

    // P0-008: Blocked needs reason
    if (newStatus === "blocked") {
      onBlockedPrompt(taskId, task.title);
      return;
    }

    // P1-018: Confirm rejection
    if (task.status === "review" && newStatus === "assigned") {
      if (!window.confirm(`Reject "${task.title}" and send back to Assigned?`)) return;
    }

    mutations.updateTaskStatus(taskId, newStatus);
    toast(`Moved to ${COLUMN_LABELS[newStatus]}`, "success");
  };

  const handleSaveEdit = () => {
    // P0-010: Title validation
    if (!editTitle.trim()) {
      toast("Title cannot be empty", "error");
      return;
    }
    mutations.updateTask(taskId, { title: editTitle, description: editDesc });
    setIsEditing(false);
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    // P0-007: Extract mentions
    const mentionIds = extractMentions(newComment, agents);
    mutations.addMessage({
      taskId,
      fromAgentId: agents[0]?._id ?? "unknown",
      content: newComment.trim(),
      mentions: mentionIds.length > 0 ? mentionIds : undefined,
    });
    setNewComment("");
  };

  const handleAssign = (agentId: string) => {
    const currentIds = task.assigneeIds;
    if (currentIds.includes(agentId)) {
      mutations.updateTask(taskId, {
        assigneeIds: currentIds.filter((id) => id !== agentId),
      });
    } else {
      mutations.updateTask(taskId, { assigneeIds: [...currentIds, agentId] });
    }
  };

  const handlePriorityChange = (p: Priority) => {
    mutations.updateTask(taskId, { priority: p });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Task: ${task.title}`}
    >
      <div
        ref={modalRef}
        className="bg-white md:rounded-2xl rounded-t-2xl shadow-2xl w-full md:max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col modal-slide-up md:animate-none safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              {isEditing ? (
                <input
                  className="w-full text-base md:text-lg font-bold text-brand-charcoal bg-gray-50 rounded-lg px-3 py-2 md:py-1.5 border border-gray-200 focus:outline-none focus:border-brand-teal"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <h2
                  className="text-base md:text-lg font-bold text-brand-charcoal cursor-pointer hover:text-brand-teal transition-colors leading-tight"
                  onClick={() => setIsEditing(true)}
                >
                  {task.title}
                </h2>
              )}

              {/* Status + Priority row — P0-003: only valid next statuses */}
              <div className="flex items-center gap-2 mt-3 md:mt-2 flex-wrap">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="text-xs md:text-[11px] font-semibold uppercase tracking-wider bg-brand-teal-light text-brand-teal-dark px-3 py-2 md:px-2 md:py-1 rounded-lg border-none cursor-pointer focus:outline-none min-h-[44px] md:min-h-0"
                >
                  <option value={task.status}>
                    {COLUMN_LABELS[task.status]}
                  </option>
                  {validNextStatuses.map((s) => (
                    <option key={s} value={s}>
                      → {COLUMN_LABELS[s]}
                    </option>
                  ))}
                </select>

                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  className="text-xs md:text-[11px] font-semibold px-3 py-2 md:px-2 md:py-1 rounded-lg border-none cursor-pointer focus:outline-none min-h-[44px] md:min-h-0"
                  style={{
                    backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                    color: PRIORITY_COLORS[task.priority],
                  }}
                >
                  {(["p0", "p1", "p2", "p3"] as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>

                {/* Tags */}
                <div className="flex gap-1 flex-wrap">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="default" className="!text-[10px] md:!text-[9px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="ml-2 w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 overscroll-contain">
          {/* Description */}
          <div>
            <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 md:mb-1.5">
              Description
            </h3>
            {isEditing ? (
              <div>
                <textarea
                  className="w-full text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:outline-none focus:border-brand-teal min-h-[100px] resize-y"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 md:px-3 md:py-1 bg-brand-teal text-white text-sm md:text-xs font-medium rounded-lg hover:bg-brand-teal-dark active:bg-brand-teal-dark transition-colors min-h-[44px] md:min-h-0"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 md:px-3 md:py-1 bg-gray-100 text-gray-500 text-sm md:text-xs font-medium rounded-lg hover:bg-gray-200 active:bg-gray-200 transition-colors min-h-[44px] md:min-h-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm text-gray-600 leading-relaxed cursor-pointer hover:bg-gray-50 active:bg-gray-50 rounded-lg p-3 md:p-2 -m-2 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Blocked Reason */}
          {task.blockedReason && (
            <div className="bg-red-50 rounded-lg p-4 md:p-3 border border-red-100">
              <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                ⚠️ Blocked
              </h3>
              <p className="text-sm md:text-xs text-red-600">{task.blockedReason}</p>
            </div>
          )}

          {/* Assignees */}
          <div>
            <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-2">
              Assignees
            </h3>
            <div className="flex flex-wrap gap-2">
              {agents.map((agent) => {
                const isAssigned = task.assigneeIds.includes(agent._id);
                return (
                  <button
                    key={agent._id}
                    onClick={() => handleAssign(agent._id)}
                    className={`flex items-center gap-2 md:gap-1.5 px-3 py-2 md:px-2.5 md:py-1.5 rounded-lg text-sm md:text-xs transition-all min-h-[44px] md:min-h-0 ${
                      isAssigned
                        ? "bg-brand-teal-light border border-brand-teal"
                        : "bg-gray-50 border border-gray-200 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Avatar name={agent.name} color={agent.avatarColor} size="sm" />
                    <span className="font-medium">{agent.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex gap-4 md:gap-6 text-xs md:text-[10px] text-gray-400 flex-wrap">
            <span>Created by <strong>{task.createdBy}</strong></span>
            <span>Created {timeAgo(task._creationTime)}</span>
            {task.completedAt && (
              <span>Completed {timeAgo(task.completedAt)}</span>
            )}
          </div>

          {/* Comment Thread — P0-007: @mention highlighting */}
          <div>
            <h3 className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-2">
              Activity Thread
            </h3>
            <div className="space-y-3">
              {messages.map((msg) => {
                const agent = agents.find((a) => a._id === msg.fromAgentId);
                return (
                  <div key={msg._id} className="flex items-start gap-3 md:gap-2.5">
                    {agent ? (
                      <Avatar
                        name={agent.name}
                        color={agent.avatarColor}
                        size="sm"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                    )}
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 md:p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-xs font-semibold text-brand-charcoal">
                          {agent?.name ?? "Unknown"}
                        </span>
                        <span className="text-[10px] md:text-[9px] text-gray-300" title={absoluteTime(msg._creationTime)}>
                          {timeAgo(msg._creationTime)}
                        </span>
                      </div>
                      <p className="text-sm md:text-[11px] text-gray-600 mt-1 leading-relaxed">
                        {renderWithMentions(msg.content, agents)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-sm md:text-xs text-gray-300 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-100 safe-area-bottom">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment... (use @Name to mention)"
              className="flex-1 text-base md:text-sm bg-gray-50 rounded-lg px-4 py-3 md:px-3 md:py-2 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300"
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="px-5 py-3 md:px-4 md:py-2 bg-brand-teal text-white text-sm md:text-xs font-medium rounded-lg hover:bg-brand-teal-dark active:bg-brand-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] md:min-h-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
