import { useState, useEffect, useCallback } from "react";
import { useAgents, useTasks, useUnreadNotificationCount, USE_CONVEX } from "../../lib/store-context";
import { formatClockTime, formatClockDate } from "../../lib/utils";
import { NotificationDropdown } from "../notifications/NotificationDropdown";

interface TopBarProps {
  onNewTask: () => void;
}

export function TopBar({ onNewTask }: TopBarProps) {
  const agents = useAgents();
  const tasks = useTasks();
  const [clockTime, setClockTime] = useState(formatClockTime());
  const [clockDate, setClockDate] = useState(formatClockDate());
  const [showNotifications, setShowNotifications] = useState(false);
  // P0-009: Connection status (for Convex mode we'll check simple presence; mock always online)
  const unreadCount = useUnreadNotificationCount();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setClockTime(formatClockTime());
      setClockDate(formatClockDate());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // P0-009: Track browser online/offline + Convex connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const activeCount = agents.filter((a) => a.status !== "offline").length;
  const taskCount = tasks.filter((t) => t.status !== "done").length;

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

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

      {/* Right: Actions + Clock + Status */}
      <div className="flex items-center gap-4">
        {/* New Task button */}
        <button
          onClick={onNewTask}
          className="px-3 py-1.5 text-xs font-medium text-white bg-brand-teal rounded-lg hover:bg-brand-teal-dark transition-colors"
          aria-label="New Task"
        >
          + New Task
        </button>

        <button
          className="px-3 py-1.5 text-xs font-medium text-brand-teal-dark bg-brand-teal-light rounded-lg hover:bg-brand-teal/20 transition-colors"
          aria-label="Documents"
        >
          📄 Docs
        </button>

        {/* P0-006: Notification bell */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            🔔
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* P1-004: Clock with large monospace time + date below */}
        <div className="text-right">
          <div className="clock-display text-lg font-bold text-brand-charcoal leading-none">
            {clockTime}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-gray-400 font-medium mt-0.5">
            {clockDate}
          </div>
        </div>

        {/* P0-009: Connection status */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
            isOnline
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            }`}
          />
          {isOnline ? (USE_CONVEX ? "Live" : "Local") : "Offline"}
        </span>
      </div>
    </header>
  );
}
