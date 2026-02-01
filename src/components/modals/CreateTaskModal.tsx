import { useState, useEffect, useRef } from "react";
import { useAgents, useMutations } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import type { Priority } from "../../types";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "../../types";

interface CreateTaskModalProps {
  onClose: () => void;
  preSelectedAgentId?: string;
}

export function CreateTaskModal({ onClose, preSelectedAgentId }: CreateTaskModalProps) {
  const mutations = useMutations();
  const agents = useAgents();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("p2");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    preSelectedAgentId ? [preSelectedAgentId] : []
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  // P0-010: title validation
  const [titleError, setTitleError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // P1-007: Focus trap + Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
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

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = () => {
    // P0-010: Validate non-empty title
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const status = selectedAgents.length > 0 ? "assigned" : "inbox";
    mutations.createTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeIds: selectedAgents,
      tags,
      createdBy: "alok",
    });
    onClose();
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create new task"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-brand-charcoal">New Task</h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Title — P0-010: validation */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              placeholder="What needs to be done?"
              className={`w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 border focus:outline-none placeholder:text-gray-300 ${
                titleError
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-brand-teal"
              }`}
              autoFocus
            />
            {titleError && (
              <p className="text-[10px] text-red-500 mt-1">Title is required</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300 min-h-[80px] resize-y"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {(["p0", "p1", "p2", "p3"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    priority === p
                      ? "ring-2 ring-offset-1"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: `${PRIORITY_COLORS[p]}15`,
                    color: PRIORITY_COLORS[p],
                    ...(priority === p
                      ? { ringColor: PRIORITY_COLORS[p] }
                      : {}),
                  }}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Assign to
            </label>
            <div className="flex gap-2">
              {agents.map((agent) => (
                <button
                  key={agent._id}
                  onClick={() => toggleAgent(agent._id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    selectedAgents.includes(agent._id)
                      ? "bg-brand-teal-light border border-brand-teal"
                      : "bg-gray-50 border border-gray-200 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Avatar name={agent.name} color={agent.avatarColor} size="sm" />
                  <span className="font-medium">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              placeholder="Add tag and press Enter"
              className="w-full text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 bg-brand-teal text-white text-sm font-medium rounded-lg hover:bg-brand-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
