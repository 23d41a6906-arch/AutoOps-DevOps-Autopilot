import React from 'react';
import { useStore } from '../simulator/store';
import { AgentId } from '../types';
import { Bot, Check, Clock, Loader2 } from 'lucide-react';

interface AgentNodeLayout {
  id: AgentId;
  label: string;
  callsign: string;
  icon: string;
  x: number; // percentage in SVG viewBox
  y: number;
}

// Circular layout around center Incident Manager (center is 50, 50)
const SURROUNDING_AGENTS: AgentNodeLayout[] = [
  { id: 'sentinel', label: 'Sentinel', callsign: 'OBSERVER', icon: '🔭', x: 50, y: 14 },
  { id: 'investigator', label: 'Investigator', callsign: 'DETECTOR', icon: '🔍', x: 80, y: 26 },
  { id: 'root_cause', label: 'Root Cause', callsign: 'DIAGNOSTICIAN', icon: '🧬', x: 88, y: 64 },
  { id: 'planner', label: 'Remediation Planner', callsign: 'ARCHITECT', icon: '📋', x: 70, y: 88 },
  { id: 'safety', label: 'Safety Guardian', callsign: 'GUARDIAN', icon: '🛡️', x: 30, y: 88 },
  { id: 'remediation', label: 'Remediation Agent', callsign: 'EXECUTOR', icon: '🔧', x: 12, y: 64 },
  { id: 'validation', label: 'Validation Agent', callsign: 'INSPECTOR', icon: '🧪', x: 20, y: 26 },
];

export const AgentNetworkGraph: React.FC = () => {
  const state = useStore();
  const { agents, activeAgentId, stage, isAutonomousRunning } = state;

  const centerAgent = agents.orchestrator;
  const isCenterActive = activeAgentId === 'orchestrator' || isAutonomousRunning;

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7] mb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#2E5FF2]" />
          <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
            Autonomous Agent Orchestration Mesh
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded">
          8 Cooperating Nodes
        </span>
      </div>

      {/* SVG Canvas for Agent Mesh */}
      <div className="relative flex-1 w-full min-h-[300px] flex items-center justify-center bg-[#FAFAFC] rounded-lg border border-[#F2F4F7] overflow-hidden p-2">
        <svg className="w-full h-full max-h-[360px]" viewBox="0 0 100 100">
          {/* Connection Lines from Center to Surrounding Agents */}
          {SURROUNDING_AGENTS.map((agent) => {
            const agentState = agents[agent.id]?.status;
            const isActive = activeAgentId === agent.id;
            const isCompleted = agentState === 'SUCCESS';

            let strokeColor = '#E4E7EC';
            let strokeWidth = 0.8;
            let strokeDasharray = '1, 1';

            if (isActive) {
              strokeColor = '#2E5FF2';
              strokeWidth = 1.4;
              strokeDasharray = 'none';
            } else if (isCompleted) {
              strokeColor = '#12B76A';
              strokeWidth = 1.0;
              strokeDasharray = 'none';
            }

            return (
              <g key={`link-${agent.id}`}>
                <line
                  x1="50"
                  y1="50"
                  x2={agent.x}
                  y2={agent.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  className={isActive ? 'animate-pulse' : ''}
                />
                {/* Flow particles if active */}
                {isActive && (
                  <circle r="1.2" fill="#2E5FF2">
                    <animateMotion
                      path={`M 50,50 L ${agent.x},${agent.y}`}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Inter-Agent Ring Circle */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#F2F4F7"
            strokeWidth="0.5"
            strokeDasharray="1.5, 1.5"
          />

          {/* Surrounding Agent Nodes in SVG */}
          {SURROUNDING_AGENTS.map((agent) => {
            const agentData = agents[agent.id];
            const isActive = activeAgentId === agent.id;
            const isSuccess = agentData?.status === 'SUCCESS';

            return (
              <g
                key={`node-${agent.id}`}
                transform={`translate(${agent.x}, ${agent.y})`}
                className="cursor-pointer"
              >
                {/* Active pulse aura */}
                {isActive && (
                  <circle
                    r="8.5"
                    fill="none"
                    stroke="#2E5FF2"
                    strokeWidth="0.8"
                    opacity="0.5"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Background */}
                <circle
                  r="6.5"
                  fill={isActive ? '#EFF4FF' : isSuccess ? '#ECFDF3' : '#FFFFFF'}
                  stroke={isActive ? '#2E5FF2' : isSuccess ? '#12B76A' : '#D0D5DD'}
                  strokeWidth={isActive ? 1.2 : 0.8}
                  className="transition-all duration-300 shadow-sm"
                />

                {/* Emoji Icon */}
                <text
                  x="0"
                  y="1.8"
                  fontSize="4.5"
                  textAnchor="middle"
                  className="select-none pointer-events-none"
                >
                  {agent.icon}
                </text>

                {/* Text Label Below Node */}
                <text
                  x="0"
                  y="9.8"
                  fontSize="2.4"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill={isActive ? '#2E5FF2' : isSuccess ? '#027A48' : '#101828'}
                  className="select-none font-sans"
                >
                  {agent.label}
                </text>

                {/* Status Indicator Pill */}
                <g transform="translate(0, 12.8)">
                  <rect
                    x="-8"
                    y="-1.8"
                    width="16"
                    height="3.6"
                    rx="1.8"
                    fill={isActive ? '#2E5FF2' : isSuccess ? '#12B76A' : '#EAECF0'}
                  />
                  <text
                    x="0"
                    y="0.8"
                    fontSize="1.8"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="select-none uppercase"
                  >
                    {isActive ? 'ACTIVE' : isSuccess ? 'DONE' : 'STANDBY'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Center Orchestrator Node (Incident Manager) */}
          <g transform="translate(50, 50)">
            {isCenterActive && (
              <circle
                r="11.5"
                fill="none"
                stroke="#2E5FF2"
                strokeWidth="0.8"
                opacity="0.4"
                className="animate-ping"
              />
            )}
            <circle
              r="9.5"
              fill={stage === 'RESOLVED' ? '#ECFDF3' : '#FFFFFF'}
              stroke={stage === 'RESOLVED' ? '#12B76A' : '#2E5FF2'}
              strokeWidth="1.6"
              className="shadow-md"
            />
            <text x="0" y="2.5" fontSize="6.5" textAnchor="middle" className="select-none">
              🧠
            </text>
            <text
              x="0"
              y="13"
              fontSize="2.7"
              fontWeight="bold"
              textAnchor="middle"
              fill="#101828"
              className="select-none uppercase tracking-tight"
            >
              INCIDENT MANAGER
            </text>
            <text
              x="0"
              y="16"
              fontSize="1.9"
              textAnchor="middle"
              fill="#667085"
              className="select-none font-medium"
            >
              COORDINATOR
            </text>
          </g>
        </svg>
      </div>

      {/* Active Agent Real-Time Thinking Box */}
      <div className="mt-3 p-2.5 rounded-lg bg-[#F8F9FC] border border-[#EAECF0] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#2E5FF2] animate-ping shrink-0" />
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-[#101828]">
              {activeAgentId ? agents[activeAgentId]?.name : 'Incident Manager'}:
            </span>{' '}
            <span className="text-[11px] text-[#475467] truncate">
              {activeAgentId
                ? agents[activeAgentId]?.currentMessage
                : centerAgent.currentMessage}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#667085] shrink-0 ml-2">
          State: {stage}
        </span>
      </div>
    </div>
  );
};
