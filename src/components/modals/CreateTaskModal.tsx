import { useState } from "react";
import { useAgents, useMutations } from "../../lib/store-context";
import { Avatar } from "../ui/Avatar";
import type { Priority } from "../../types";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "../../types";
import { useModalKeyboard } from "../../lib/use-modal-keyboard";

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
  
  // P1-007: Focus trap + Escape (extracted to hook)
  const modalRef = useModalKeyboard(onClose);

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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create new task"
    >
      <div
        ref={modalRef}
        className="bg-white md:rounded-2xl rounded-t-2xl shadow-2xl w-full md:max-w-lg h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col modal-slide-up md:animate-none safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-charcoal">New Task</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 md:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {/* Title — P0-010: validation */}
          <div>
            <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
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
              className={`w-full text-base md:text-sm bg-gray-50 rounded-lg px-4 py-3 md:px-3 md:py-2.5 border focus:outline-none placeholder:text-gray-300 ${
                titleError
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-brand-teal"
              }`}
              autoFocus
            />
            {titleError && (
              <p className="text-[11px] md:text-[10px] text-red-500 mt-1">Title is required</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="w-full text-base md:text-sm bg-gray-50 rounded-lg px-4 py-3 md:px-3 md:py-2.5 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300 min-h-[100px] md:min-h-[80px] resize-y"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2 md:mb-1.5">
              Priority
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["p0", "p1", "p2", "p3"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-[11px] font-semibold rounded-lg transition-all min-h-[44px] md:min-h-0 ${
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
            <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2 md:mb-1.5">
              Assign to
            </label>
            <div className="flex gap-2 flex-wrap">
              {agents.map((agent) => (
                <button
                  key={agent._id}
                  onClick={() => toggleAgent(agent._id)}
                  className={`flex items-center gap-2 md:gap-1.5 px-3 py-2.5 md:px-2.5 md:py-1.5 rounded-lg text-sm md:text-xs transition-all min-h-[44px] md:min-h-0 ${
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
            <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 md:gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 md:px-2 md:py-0.5 bg-gray-100 text-gray-500 text-sm md:text-[10px] rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="text-gray-400 hover:text-gray-600 active:text-gray-600 p-1 md:p-0"
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
              className="w-full text-sm md:text-xs bg-gray-50 rounded-lg px-4 py-3 md:px-3 md:py-2 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="p-4 md:p-5 border-t border-gray-100 flex justify-end gap-2 safe-area-bottom">
          <button
            onClick={onClose}
            className="px-5 py-3 md:px-4 md:py-2 bg-gray-100 text-gray-500 text-base md:text-sm font-medium rounded-lg hover:bg-gray-200 active:bg-gray-200 transition-colors min-h-[44px] md:min-h-0"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-3 md:px-4 md:py-2 bg-brand-teal text-white text-base md:text-sm font-medium rounded-lg hover:bg-brand-teal-dark active:bg-brand-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] md:min-h-0"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
