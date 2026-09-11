import React from 'react';
import { useStore } from '../simulator/store';
import { IncidentStage } from '../types';
import { AlertCircle, Check, Clock, ShieldCheck, Wrench, Search, Brain, FileCheck } from 'lucide-react';

interface StageConfig {
  id: IncidentStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageConfig[] = [
  { id: 'DETECTED', label: 'Detected', icon: AlertCircle },
  { id: 'INVESTIGATING', label: 'Investigating', icon: Search },
  { id: 'DIAGNOSING', label: 'Diagnosing', icon: Brain },
  { id: 'PLANNING', label: 'Planning', icon: FileCheck },
  { id: 'SAFETY_CHECK', label: 'Safety Check', icon: ShieldCheck },
  { id: 'REMEDIATING', label: 'Remediating', icon: Wrench },
  { id: 'VALIDATING', label: 'Validating', icon: Clock },
  { id: 'RESOLVED', label: 'Resolved', icon: Check },
];

const STAGE_ORDER: IncidentStage[] = [
  'HEALTHY',
  'DETECTED',
  'INVESTIGATING',
  'DIAGNOSING',
  'PLANNING',
  'SAFETY_CHECK',
  'REMEDIATING',
  'VALIDATING',
  'RESOLVED',
];

export const IncidentCommandBar: React.FC = () => {
  const state = useStore();
  const { activeIncident, stage, isAutonomousRunning } = state;

  const currentStageIndex = STAGE_ORDER.indexOf(stage);

  if (stage === 'HEALTHY' && !activeIncident) {
    return (
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#ECFDF3] border border-[#A6F4C5] flex items-center justify-center text-[#12B76A]">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#101828]">Continuous Surveillance Active</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#ECFDF3] text-[#027A48]">
                IDLE / ALL GREEN
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              Sentinel is monitoring 8 microservices, P99 ingress latencies, and error budgets. Zero open incidents.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#667085] flex items-center gap-2">
          <span>Click</span>
          <span className="font-semibold px-2 py-1 bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA] rounded-md text-[11px]">
            🚨 Inject Incident
          </span>
          <span>or</span>
          <span className="font-semibold px-2 py-1 bg-[#EFF4FF] text-[#2E5FF2] border border-[#D1E0FF] rounded-md text-[11px]">
            ⚡ Run Autonomous Recovery
          </span>
          <span>to test AutoOps.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs space-y-4">
      {/* Incident Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F2F4F7]">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
              stage === 'RESOLVED' ? 'bg-[#12B76A]' : 'bg-[#F04438] animate-pulse'
            }`}
          >
            {stage === 'RESOLVED' ? '✓' : '!'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-extrabold text-[#101828]">
                {activeIncident?.id || '#INC-1042'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  stage === 'RESOLVED'
                    ? 'bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]'
                    : 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]'
                }`}
              >
                {stage === 'RESOLVED' ? 'RESOLVED' : activeIncident?.scenario.severity || 'CRITICAL'}
              </span>
              <span className="text-xs font-semibold text-[#101828]">
                {activeIncident?.scenario.name}
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              {activeIncident?.scenario.description}
            </p>
          </div>
        </div>

        {/* Incident Metadata Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
            <span className="text-[#667085]">Affected Service: </span>
            <span className="font-mono font-bold text-[#101828]">
              {activeIncident?.scenario.targetService}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
            <span className="text-[#667085]">Affected Users: </span>
            <span className="font-bold text-[#101828]">
              ~{activeIncident?.scenario.affectedUsers.toLocaleString()}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
            <span className="text-[#667085]">Detected At: </span>
            <span className="font-mono text-[#101828]">{activeIncident?.startedAt}</span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="pt-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {STAGES.map((s, idx) => {
            const stepOrderIndex = STAGE_ORDER.indexOf(s.id);
            const isCompleted = currentStageIndex > stepOrderIndex;
            const isCurrent = stage === s.id;
            const isPending = currentStageIndex < stepOrderIndex;
            const Icon = s.icon;

            return (
              <div
                key={s.id}
                className={`relative flex flex-col p-2 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-[#EFF4FF] border-[#2E5FF2] ring-2 ring-[#2E5FF2]/20 shadow-xs'
                    : isCompleted
                    ? 'bg-[#ECFDF3] border-[#A6F4C5]'
                    : 'bg-[#FAFAFC] border-[#E4E7EC] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#667085]">0{idx + 1}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#2E5FF2] text-white animate-pulse'
                        : isCompleted
                        ? 'bg-[#12B76A] text-white'
                        : 'bg-[#EAECF0] text-[#667085]'
                    }`}
                  >
                    {isCompleted ? '✓' : <Icon className="w-3 h-3" />}
                  </div>
                </div>

                <div className="font-semibold text-xs truncate text-[#101828]">{s.label}</div>
                <div className="text-[10px] mt-0.5 truncate">
                  {isCurrent ? (
                    <span className="text-[#2E5FF2] font-bold animate-pulse">In Progress...</span>
                  ) : isCompleted ? (
                    <span className="text-[#12B76A] font-medium">Passed</span>
                  ) : (
                    <span className="text-[#98A2B3]">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
