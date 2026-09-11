import React, { useState } from 'react';
import { useStore, store } from '../simulator/store';
import { SAFE_ACTIONS } from '../types';
import {
  Brain,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Play,
  XCircle,
  Info,
  ShieldAlert,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

export const RootCauseFixPlan: React.FC = () => {
  const state = useStore();
  const { rootCause, remediationPlan, stage, isAutonomousRunning, activeIncident } = state;
  const [showRegistryModal, setShowRegistryModal] = useState(false);
  const [showReasoningModal, setShowReasoningModal] = useState(false);

  const scenario = activeIncident?.scenario;
  const activeRootCause = rootCause || scenario?.rootCause;
  const activePlan = remediationPlan || scenario?.remediation;

  if (stage === 'HEALTHY' && !activeIncident) {
    return (
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-xs h-full flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 rounded-full bg-[#EFF4FF] border border-[#D1E0FF] flex items-center justify-center text-[#2E5FF2] mb-3">
          <Brain className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#101828]">Root Cause & Fix Planning Engine</h4>
        <p className="text-xs text-[#667085] max-w-sm mt-1">
          When an anomaly is detected, the Root Cause Analyst will cross-reference telemetry with commit diffs, and the Remediation Planner will synthesize a safe fix proposal.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* Root Cause Panel (7 cols) */}
      <div className="lg:col-span-6 bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7] mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#2E5FF2]" />
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Root Cause Synthesis
              </h3>
            </div>
            {activeRootCause && (
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#EFF4FF] text-[#2E5FF2] border border-[#D1E0FF]">
                Confidence: {activeRootCause.confidencePct}%
              </span>
            )}
          </div>

          {activeRootCause ? (
            <div className="space-y-3">
              {/* Problem Title */}
              <div>
                <h4 className="text-sm font-bold text-[#101828]">{activeRootCause.title}</h4>
                <p className="text-xs text-[#475467] mt-1 leading-relaxed">
                  {activeRootCause.summary}
                </p>
              </div>

              {/* Evidence Checklist */}
              <div>
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block mb-2">
                  Verified Diagnostic Evidence
                </span>
                <div className="space-y-1.5">
                  {activeRootCause.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded-lg bg-[#FAFAFC] border border-[#EAECF0] flex items-start gap-2 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#101828]">{ev.label}</span>
                        {ev.detail && (
                          <p className="text-[11px] text-[#667085] mt-0.5">{ev.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#98A2B3]">
              Investigator and Root Cause Analyst currently diagnosing telemetry traces...
            </div>
          )}
        </div>

        {/* Trigger Event footer */}
        {activeRootCause && (
          <div className="pt-2 border-t border-[#F2F4F7] mt-2 flex items-center justify-between text-[11px] text-[#667085]">
            <span>Trigger: {activeRootCause.triggerEvent}</span>
            <span className="font-mono text-[#2E5FF2] font-semibold">
              Service: {activeRootCause.affectedService}
            </span>
          </div>
        )}
      </div>

      {/* AI Fix Plan Card (5 cols) */}
      <div className="lg:col-span-6 bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7] mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Recommended Remediation Plan
              </h3>
            </div>
            <button
              onClick={() => setShowRegistryModal(true)}
              className="text-[11px] text-[#2E5FF2] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3 h-3" /> Safe Action Registry
            </button>
          </div>

          {activePlan ? (
            <div className="space-y-3">
              {/* Proposed Action Badge & Title */}
              <div className="p-3 rounded-xl bg-[#F8F9FC] border border-[#D0D5DD]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-white text-[#2E5FF2] border border-[#D1E0FF]">
                    {activePlan.action}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#667085]">Risk Score:</span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.2 rounded ${
                        activePlan.riskScore < 25
                          ? 'bg-[#ECFDF3] text-[#027A48]'
                          : 'bg-[#FFFAEB] text-[#B54708]'
                      }`}
                    >
                      {activePlan.riskScore}/100 ({activePlan.blastRadius} BLAST)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#344054] leading-relaxed mb-3">
                  {activePlan.explanation}
                </p>

                {/* Target vs Current version switch representation */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EAECF0] text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#667085]">Current:</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#FEF3F2] text-[#B42318] font-mono font-bold">
                      {activePlan.currentVersion} 🔴
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#98A2B3]" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#667085]">Target:</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#ECFDF3] text-[#027A48] font-mono font-bold">
                      {activePlan.targetVersion} 🟢
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085]">
                    Recovery ~{activePlan.expectedRecoverySec}s
                  </div>
                </div>
              </div>

              {/* Safety Guardian Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-[#FAFAFC] border border-[#EAECF0] flex items-center gap-1.5 text-[#344054]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
                  <span>Rollback Image Available</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFAFC] border border-[#EAECF0] flex items-center gap-1.5 text-[#344054]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
                  <span>No DB Schema Migration</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFAFC] border border-[#EAECF0] flex items-center gap-1.5 text-[#344054]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
                  <span>Service Boundary Isolated</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFAFC] border border-[#EAECF0] flex items-center gap-1.5 text-[#344054]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
                  <span>Safety Guardian Cleared</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#98A2B3]">
              Planner synthesizes remediation strategy once root cause confidence exceeds 85%...
            </div>
          )}
        </div>

        {/* Human Override Action Buttons */}
        <div className="pt-3 border-t border-[#F2F4F7] mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => store.approveFix()}
              disabled={isAutonomousRunning || stage === 'RESOLVED'}
              className="px-3 py-1.5 rounded-lg bg-[#12B76A] hover:bg-[#027A48] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Approve Fix</span>
            </button>
            <button
              onClick={() => store.rejectFix()}
              disabled={isAutonomousRunning || stage === 'RESOLVED'}
              className="px-3 py-1.5 rounded-lg border border-[#FDA29B] bg-white hover:bg-[#FEF3F2] text-[#D92D20] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>

          <button
            onClick={() => setShowReasoningModal(true)}
            className="text-xs text-[#475467] hover:text-[#101828] font-medium underline cursor-pointer"
          >
            View Reasoning Chain
          </button>
        </div>
      </div>

      {/* Safe Action Registry Modal */}
      {showRegistryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E5FF2]" />
                <h3 className="text-sm font-bold text-[#101828]">Safe Action Registry (Fixed Whitelist)</h3>
              </div>
              <button
                onClick={() => setShowRegistryModal(false)}
                className="text-[#98A2B3] hover:text-[#101828] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#667085]">
              Per safety specification (§12), AutoOps agents never execute free-form arbitrary shell or LLM code. All remediation actions must match this verified registry:
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {SAFE_ACTIONS.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg border border-[#EAECF0] bg-[#FAFAFC] flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2E5FF2]">{act.id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#ECFDF3] text-[#027A48] font-semibold">
                      VERIFIED SAFE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#475467]">{act.description}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowRegistryModal(false)}
                className="px-4 py-1.5 bg-[#2E5FF2] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reasoning Chain Modal */}
      {showReasoningModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#2E5FF2]" />
                <h3 className="text-sm font-bold text-[#101828]">Agent Reasoning Trace</h3>
              </div>
              <button
                onClick={() => setShowReasoningModal(false)}
                className="text-[#98A2B3] hover:text-[#101828] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs max-h-80 overflow-y-auto">
              <div className="p-2 rounded bg-[#FAFAFC] border border-[#EAECF0]">
                <strong className="text-[#101828]">Hypothesis:</strong>
                <p className="text-[#475467] mt-0.5">{activeRootCause?.summary}</p>
              </div>
              <div className="p-2 rounded bg-[#FAFAFC] border border-[#EAECF0]">
                <strong className="text-[#101828]">Safety Assessment:</strong>
                <p className="text-[#475467] mt-0.5">
                  Action {activePlan?.action} evaluated with risk score {activePlan?.riskScore}/100. Blast radius strictly limited to {activePlan?.targetService} pod replica set.
                </p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowReasoningModal(false)}
                className="px-4 py-1.5 bg-[#2E5FF2] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
