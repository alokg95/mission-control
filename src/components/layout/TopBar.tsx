import { useState, useEffect } from "react";
import { useAgents, useTasks } from "../../lib/store-context";
import { formatClock } from "../../lib/utils";

export function TopBar() {
  const agents = useAgents();
  const tasks = useTasks();
  const [clock, setClock] = useState(formatClock());

  useEffect(() => {
    const interval = setInterval(() => setClock(formatClock()), 10000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = agents.filter((a) => a.status !== "offline").length;
  const taskCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-brand-teal-light flex items-center justify-between px-6 shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-brand-charcoal">
          Mission Control
        </h1>
        <span className="px-2 py-0.5 bg-brand-teal-light text-brand-teal-dark text-[10px] font-semibold rounded-full uppercase tracking-wider">
          AutoReel
        </span>
      </div>

      {/* Center: Stats */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-charcoal leading-none">{activeCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Agents Active
          </div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-charcoal leading-none">{taskCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Tasks in Queue
          </div>
        </div>
      </div>

      {/* Right: Clock + Status */}
      <div className="flex items-center gap-4">
        <button
          className="px-3 py-1.5 text-xs font-medium text-brand-teal-dark bg-brand-teal-light rounded-lg hover:bg-brand-teal/20 transition-colors"
          aria-label="Documents"
        >
          📄 Docs
        </button>
        <span className="text-xs text-gray-400 font-medium tabular-nums">{clock}</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Online
        </span>
      </div>
    </header>
  );
}
