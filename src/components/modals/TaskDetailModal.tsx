import { useState } from "react";
import { useAgents, useMessages, useStore } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { timeAgo } from "../../lib/utils";
import {
  COLUMN_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  COLUMN_ORDER,
} from "../../types";
import type { TaskStatus, Priority } from "../../types";

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const store = useStore();
  const agents = useAgents();
  const allMessages = useMessages();
  const task = store.tasks.find((t) => t._id === taskId);
  const messages = allMessages.filter((m) => m.taskId === taskId);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title ?? "");
  const [editDesc, setEditDesc] = useState(task?.description ?? "");

  if (!task) return null;

  const handleStatusChange = (newStatus: TaskStatus) => {
    store.updateTaskStatus(taskId, newStatus);
    store.addActivity({
      type: "task_update",
      agentId: "agent_alo",
      taskId,
      message: `Moved '${task.title}' to ${COLUMN_LABELS[newStatus]}`,
    });
  };

  const handleSaveEdit = () => {
    store.updateTask(taskId, { title: editTitle, description: editDesc });
    setIsEditing(false);
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    store.addMessage({
      taskId,
      fromAgentId: "agent_alo",
      content: newComment.trim(),
    });
    setNewComment("");
  };

  const handleAssign = (agentId: string) => {
    const currentIds = task.assigneeIds;
    if (currentIds.includes(agentId)) {
      store.updateTask(taskId, {
        assigneeIds: currentIds.filter((id) => id !== agentId),
      });
    } else {
      store.updateTask(taskId, { assigneeIds: [...currentIds, agentId] });
    }
  };

  const handlePriorityChange = (p: Priority) => {
    store.updateTask(taskId, { priority: p });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Task: ${task.title}`}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  className="w-full text-lg font-bold text-brand-charcoal bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 focus:outline-none focus:border-brand-teal"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <h2
                  className="text-lg font-bold text-brand-charcoal cursor-pointer hover:text-brand-teal transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {task.title}
                </h2>
              )}

              {/* Status + Priority row */}
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="text-[11px] font-semibold uppercase tracking-wider bg-brand-teal-light text-brand-teal-dark px-2 py-1 rounded-lg border-none cursor-pointer focus:outline-none"
                >
                  {COLUMN_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {COLUMN_LABELS[s]}
                    </option>
                  ))}
                </select>

                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border-none cursor-pointer focus:outline-none"
                  style={{
                    backgroundColor: `${PRIORITY_COLORS[task.priority as Priority]}20`,
                    color: PRIORITY_COLORS[task.priority as Priority],
                  }}
                >
                  {(["p0", "p1", "p2", "p3"] as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>

                {/* Tags */}
                <div className="flex gap-1 ml-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="default" className="!text-[9px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
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
                    className="px-3 py-1 bg-brand-teal text-white text-xs font-medium rounded-lg hover:bg-brand-teal-dark transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm text-gray-600 leading-relaxed cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Blocked Reason */}
          {task.blockedReason && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                ⚠️ Blocked
              </h3>
              <p className="text-xs text-red-600">{task.blockedReason}</p>
            </div>
          )}

          {/* Assignees */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Assignees
            </h3>
            <div className="flex flex-wrap gap-2">
              {agents.map((agent) => {
                const isAssigned = task.assigneeIds.includes(agent._id);
                return (
                  <button
                    key={agent._id}
                    onClick={() => handleAssign(agent._id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
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
          <div className="flex gap-6 text-[10px] text-gray-400">
            <span>Created by <strong>{task.createdBy}</strong></span>
            <span>Created {timeAgo(task._creationTime)}</span>
            {task.completedAt && (
              <span>Completed {timeAgo(task.completedAt)}</span>
            )}
          </div>

          {/* Comment Thread */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Activity Thread
            </h3>
            <div className="space-y-3">
              {messages.map((msg) => {
                const agent = agents.find((a) => a._id === msg.fromAgentId);
                return (
                  <div key={msg._id} className="flex items-start gap-2.5">
                    {agent ? (
                      <Avatar
                        name={agent.name}
                        color={agent.avatarColor}
                        size="sm"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                    )}
                    <div className="flex-1 bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-brand-charcoal">
                          {agent?.name ?? "Unknown"}
                        </span>
                        <span className="text-[9px] text-gray-300">
                          {timeAgo(msg._creationTime)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-xs text-gray-300 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 text-sm bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300"
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-brand-teal text-white text-xs font-medium rounded-lg hover:bg-brand-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
