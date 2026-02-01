// P0-008: Blocked reason prompt modal
import { useState, useEffect, useRef } from "react";
import { useMutations } from "../../lib/store-context";

interface BlockedReasonModalProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export function BlockedReasonModal({ taskId, taskTitle, onClose }: BlockedReasonModalProps) {
  const [reason, setReason] = useState("");
  const mutations = useMutations();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // P1-007: focus trap + Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    mutations.updateTaskStatus(taskId, "blocked", reason.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Block reason"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-brand-charcoal">Block Task</h2>
          <p className="text-xs text-gray-400 mt-1 truncate">
            "{taskTitle}"
          </p>
        </div>
        <div className="p-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
            Reason for blocking
          </label>
          <textarea
            ref={inputRef}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this task blocked?"
            className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300 min-h-[80px] resize-y"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleSubmit();
            }}
          />
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
            disabled={!reason.trim()}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Block Task
          </button>
        </div>
      </div>
    </div>
  );
}
