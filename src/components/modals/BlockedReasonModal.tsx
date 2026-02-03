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
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Block reason"
    >
      <div
        className="bg-white md:rounded-2xl rounded-t-2xl shadow-2xl w-full md:max-w-md overflow-hidden modal-slide-up md:animate-none safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-4 md:p-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-charcoal">Block Task</h2>
            <p className="text-sm md:text-xs text-gray-400 mt-1 line-clamp-1">
              "{taskTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors md:hidden shrink-0 ml-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 md:p-5">
          <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2 md:mb-1.5">
            Reason for blocking
          </label>
          <textarea
            ref={inputRef}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this task blocked?"
            className="w-full text-base md:text-sm bg-gray-50 rounded-lg px-4 py-3 md:px-3 md:py-2.5 border border-gray-200 focus:outline-none focus:border-brand-teal placeholder:text-gray-300 min-h-[120px] md:min-h-[80px] resize-y"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleSubmit();
            }}
          />
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
            disabled={!reason.trim()}
            className="px-5 py-3 md:px-4 md:py-2 bg-red-500 text-white text-base md:text-sm font-medium rounded-lg hover:bg-red-600 active:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] md:min-h-0"
          >
            Block Task
          </button>
        </div>
      </div>
    </div>
  );
}
