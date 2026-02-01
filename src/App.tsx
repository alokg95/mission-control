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

function Dashboard() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  // P0-008: Blocked reason prompt state
  const [blockedPrompt, setBlockedPrompt] = useState<{
    taskId: string;
    taskTitle: string;
  } | null>(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ErrorBoundary fallbackLabel="Top Bar">
        <TopBar onNewTask={() => setShowCreateModal(true)} />
      </ErrorBoundary>
      <div className="flex flex-1 overflow-hidden">
        <ErrorBoundary fallbackLabel="Agents">
          <AgentPanel
            onAgentClick={(id) => setSelectedAgentId(id)}
          />
        </ErrorBoundary>
        <ErrorBoundary fallbackLabel="Mission Queue">
          <KanbanBoard
            onTaskClick={(id) => setSelectedTaskId(id)}
            onNewTask={() => setShowCreateModal(true)}
            onBlockedPrompt={(taskId, taskTitle) =>
              setBlockedPrompt({ taskId, taskTitle })
            }
          />
        </ErrorBoundary>
        <ErrorBoundary fallbackLabel="Live Feed">
          <ActivityFeed />
        </ErrorBoundary>
      </div>

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
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
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
