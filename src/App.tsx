import { useState } from "react";
import { TopBar } from "./components/layout/TopBar";
import { AgentPanel } from "./components/agents/AgentPanel";
import { AgentDetailPanel } from "./components/agents/AgentDetailPanel";
import { KanbanBoard } from "./components/kanban/KanbanBoard";
import { ActivityFeed } from "./components/feed/ActivityFeed";
import { TaskDetailModal } from "./components/modals/TaskDetailModal";
import { CreateTaskModal } from "./components/modals/CreateTaskModal";
import { BlockedReasonModal } from "./components/modals/BlockedReasonModal";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./lib/toast";

type MobileTab = "agents" | "tasks" | "feed";

function Dashboard() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTaskForAgent, setCreateTaskForAgent] = useState<string | undefined>(undefined);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  // P0-008: Blocked reason prompt state
  const [blockedPrompt, setBlockedPrompt] = useState<{
    taskId: string;
    taskTitle: string;
  } | null>(null);
  // Mobile navigation state
  const [mobileTab, setMobileTab] = useState<MobileTab>("tasks");

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'var(--app-height, 100dvh)' }}>
      <ErrorBoundary fallbackLabel="Top Bar">
        <TopBar onNewTask={() => setShowCreateModal(true)} />
      </ErrorBoundary>
      
      {/* Desktop: 3-panel layout / Mobile: single panel based on tab */}
      <div className="flex flex-1 overflow-hidden pb-20 md:pb-0">
        {/* Agent Panel - visible on desktop, or when mobileTab is "agents" */}
        <div className={`${mobileTab === "agents" ? "flex" : "hidden"} md:flex w-full md:w-auto`}>
          <ErrorBoundary fallbackLabel="Agents">
            <AgentPanel
              onAgentClick={(id) => setSelectedAgentId(id)}
              onAssignTask={(agentId) => {
                setCreateTaskForAgent(agentId);
                setShowCreateModal(true);
              }}
              onSendMessage={(agentId) => setSelectedAgentId(agentId)}
            />
          </ErrorBoundary>
        </div>
        
        {/* Kanban Board - visible on desktop, or when mobileTab is "tasks" */}
        <div className={`${mobileTab === "tasks" ? "flex" : "hidden"} md:flex flex-1`}>
          <ErrorBoundary fallbackLabel="Mission Queue">
            <KanbanBoard
              onTaskClick={(id) => setSelectedTaskId(id)}
              onNewTask={() => setShowCreateModal(true)}
              onBlockedPrompt={(taskId, taskTitle) =>
                setBlockedPrompt({ taskId, taskTitle })
              }
            />
          </ErrorBoundary>
        </div>
        
        {/* Activity Feed - visible on desktop, or when mobileTab is "feed" */}
        <div className={`${mobileTab === "feed" ? "flex" : "hidden"} md:flex w-full md:w-auto`}>
          <ErrorBoundary fallbackLabel="Live Feed">
            <ActivityFeed />
          </ErrorBoundary>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex md:hidden z-40 safe-area-bottom">
        <button
          onClick={() => setMobileTab("agents")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
            mobileTab === "agents" 
              ? "text-brand-teal bg-brand-teal-light/50" 
              : "text-gray-400"
          }`}
        >
          <span className="text-xl">👥</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Agents</span>
        </button>
        <button
          onClick={() => setMobileTab("tasks")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
            mobileTab === "tasks" 
              ? "text-brand-teal bg-brand-teal-light/50" 
              : "text-gray-400"
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Tasks</span>
        </button>
        <button
          onClick={() => setMobileTab("feed")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
            mobileTab === "feed" 
              ? "text-brand-teal bg-brand-teal-light/50" 
              : "text-gray-400"
          }`}
        >
          <span className="text-xl">📡</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Feed</span>
        </button>
      </nav>

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onBlockedPrompt={(taskId, taskTitle) =>
            setBlockedPrompt({ taskId, taskTitle })
          }
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          preSelectedAgentId={createTaskForAgent}
          onClose={() => {
            setShowCreateModal(false);
            setCreateTaskForAgent(undefined);
          }}
        />
      )}

      {selectedAgentId && (
        <AgentDetailPanel
          agentId={selectedAgentId}
          onClose={() => setSelectedAgentId(null)}
        />
      )}

      {blockedPrompt && (
        <BlockedReasonModal
          taskId={blockedPrompt.taskId}
          taskTitle={blockedPrompt.taskTitle}
          onClose={() => setBlockedPrompt(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
