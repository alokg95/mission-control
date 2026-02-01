import { useState } from "react";
import { StoreProvider } from "./lib/store-context";
import { TopBar } from "./components/layout/TopBar";
import { AgentPanel } from "./components/agents/AgentPanel";
import { KanbanBoard } from "./components/kanban/KanbanBoard";
import { ActivityFeed } from "./components/feed/ActivityFeed";
import { TaskDetailModal } from "./components/modals/TaskDetailModal";
import { CreateTaskModal } from "./components/modals/CreateTaskModal";

function Dashboard() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <AgentPanel />
        <KanbanBoard
          onTaskClick={(id) => setSelectedTaskId(id)}
          onNewTask={() => setShowCreateModal(true)}
        />
        <ActivityFeed />
      </div>

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  );
}
