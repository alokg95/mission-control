import { useAgents } from "../../lib/store-context";
import { AgentCard } from "./AgentCard";
import { StatusDot } from "../ui/StatusDot";
import type { AgentStatus } from "../../types";

interface AgentPanelProps {
  onAgentClick: (agentId: string) => void;
  onAssignTask?: (agentId: string) => void;
  onSendMessage?: (agentId: string) => void;
}

export function AgentPanel({ onAgentClick, onAssignTask, onSendMessage }: AgentPanelProps) {
  const agents = useAgents();

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white/50 backdrop-blur-sm md:border-r border-brand-teal-light/50 flex flex-col h-full">
      {/* P1-003: Section header with colored dot */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <StatusDot status="working" pulse />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-charcoal">
            Agents
          </h2>
          <span className="ml-auto px-2 py-0.5 bg-brand-teal-light text-brand-teal-dark text-[10px] font-bold rounded-full">
            {agents.length}
          </span>
        </div>
      </div>

      {/* Agent List - horizontal scroll on mobile, vertical scroll on desktop */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile: Horizontal scroll carousel */}
        <div className="md:hidden overflow-x-auto overflow-y-hidden h-full p-3 -mx-1">
          <div className="flex gap-3 h-full min-w-max px-1 snap-x snap-mandatory">
            {agents.map((agent) => (
              <div key={agent._id} className="w-[280px] shrink-0 snap-start">
                <AgentCard
                  id={agent._id}
                  name={agent.name}
                  role={agent.role}
                  level={agent.level}
                  status={agent.status as AgentStatus}
                  avatarColor={agent.avatarColor}
                  currentTaskId={agent.currentTaskId}
                  onClick={() => onAgentClick(agent._id)}
                  onAssignTask={onAssignTask}
                  onSendMessage={onSendMessage}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Vertical scroll list */}
        <div className="hidden md:block overflow-y-auto h-full p-3 space-y-2">
          {agents.map((agent) => (
            <AgentCard
              key={agent._id}
              id={agent._id}
              name={agent.name}
              role={agent.role}
              level={agent.level}
              status={agent.status as AgentStatus}
              avatarColor={agent.avatarColor}
              currentTaskId={agent.currentTaskId}
              onClick={() => onAgentClick(agent._id)}
              onAssignTask={onAssignTask}
              onSendMessage={onSendMessage}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
