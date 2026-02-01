import type { AgentStatus } from "../../types";
import { STATUS_COLORS } from "../../types";

interface StatusDotProps {
  status: AgentStatus;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ status, pulse = false, className = "" }: StatusDotProps) {
  const color = STATUS_COLORS[status];
  return (
    <span className={`relative inline-flex ${className}`}>
      {pulse && status === "working" && (
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}
