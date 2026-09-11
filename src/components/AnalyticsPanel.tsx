import React from 'react';
import { useStore } from '../simulator/store';
import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const state = useStore();
  const { syntheticChecks, stage } = state;

  const passedChecks = syntheticChecks.filter((c) => c.status === 'PASSED').length;
  const totalChecks = syntheticChecks.length;

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-xs space-y-5">
      {/* Header with Simulated Hackathon Metrics Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F2F4F7]">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-[#2E5FF2]" />
          <div>
            <h3 className="text-sm font-bold text-[#101828]">AutoOps Fleet Performance Analytics</h3>
            <p className="text-xs text-[#667085]">
              Continuous synthetic verification and multi-incident autonomous MTTR telemetry.
            </p>
          </div>
        </div>

        {/* Mandatory Hackathon Disclosure Badge per §17 */}
        <div className="px-2.5 py-1 rounded-full bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] text-[10px] font-bold">
          ⚡ SIMULATED HACKATHON METRICS
        </div>
      </div>

      {/* Benchmark Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
          <span className="text-[11px] text-[#667085] block">Incidents Handled</span>
          <span className="text-xl font-extrabold text-[#101828]">128</span>
          <span className="text-[10px] text-[#12B76A] font-semibold block mt-0.5">30-day window</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
          <span className="text-[11px] text-[#667085] block">Auto-Resolved</span>
          <span className="text-xl font-extrabold text-[#12B76A]">124 (96.8%)</span>
          <span className="text-[10px] text-[#667085] block mt-0.5">Zero human intervention</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
          <span className="text-[11px] text-[#667085] block">Human Escalations</span>
          <span className="text-xl font-extrabold text-[#F79009]">4 (3.2%)</span>
          <span className="text-[10px] text-[#667085] block mt-0.5">Safety policy held</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
          <span className="text-[11px] text-[#667085] block">Avg Detection Time</span>
          <span className="text-xl font-extrabold text-[#2E5FF2]">2.4s</span>
          <span className="text-[10px] text-[#667085] block mt-0.5">SLO anomaly trigger</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
          <span className="text-[11px] text-[#667085] block">Avg Recovery MTTR</span>
          <span className="text-xl font-extrabold text-[#12B76A]">18.6s</span>
          <span className="text-[10px] text-[#12B76A] font-semibold block mt-0.5">84% MTTR reduction</span>
        </div>
      </div>

      {/* Synthetic Canary Checks 24-Point Grid */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
              Validation Suite: 24 Automated Synthetic Canary Probes
            </h4>
          </div>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              passedChecks === totalChecks
                ? 'bg-[#ECFDF3] text-[#027A48]'
                : 'bg-[#FEF3F2] text-[#B42318]'
            }`}
          >
            {passedChecks} / {totalChecks} Tests Passed ({Math.round((passedChecks / totalChecks) * 100)}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {syntheticChecks.map((chk) => {
            const isPassed = chk.status === 'PASSED';
            const isFailed = chk.status === 'FAILED';

            return (
              <div
                key={chk.id}
                className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                  isPassed
                    ? 'bg-[#FAFAFC] border-[#E4E7EC]'
                    : isFailed
                    ? 'bg-[#FEF3F2] border-[#FDA29B]'
                    : 'bg-[#FAFAFC] border-[#EAECF0] opacity-50'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isPassed ? 'bg-[#12B76A]' : isFailed ? 'bg-[#F04438] animate-ping' : 'bg-[#D0D5DD]'
                      }`}
                    />
                    <span className="font-semibold text-[#101828] truncate text-[11px]">
                      {chk.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#667085] truncate block mt-0.5">
                    {chk.endpoint}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#344054] shrink-0">
                  {chk.latencyMs}ms
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
