import { useEffect, useRef, type RefObject } from "react";

/**
 * Hook for modal keyboard handling: Escape to close + focus trap.
 * DRY extraction from TaskDetailModal, CreateTaskModal, BlockedReasonModal.
 */
export function useModalKeyboard(
  onClose: () => void,
  options: { trapFocus?: boolean } = {}
): RefObject<HTMLDivElement | null> {
  const { trapFocus = true } = options;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape to close
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap
      if (trapFocus && e.key === "Tab" && modalRef.current) {
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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, trapFocus]);

  return modalRef;
}
