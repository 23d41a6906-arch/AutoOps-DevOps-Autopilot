import React from 'react';
import { useStore } from '../simulator/store';
import { Activity, AlertCircle, Clock, Server, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const HeroHealthGauge: React.FC = () => {
  const state = useStore();
  const { systemHealth, telemetry, services, stage } = state;

  const healthyServicesCount = services.filter((s) => s.status === 'HEALTHY').length;
  const totalServices = services.length;

  // Health gauge color calculations
  const isHealthy = systemHealth >= 90;
  const isDegraded = systemHealth >= 60 && systemHealth < 90;
  const strokeColor = isHealthy ? '#12B76A' : isDegraded ? '#F79009' : '#F04438';
  const bgColor = isHealthy ? '#ECFDF3' : isDegraded ? '#FFFAEB' : '#FEF3F2';
  const badgeTextColor = isHealthy ? '#027A48' : isDegraded ? '#B54708' : '#B42318';

  // SVG circle calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (systemHealth / 100) * circumference;

  const isIncident = stage !== 'HEALTHY' && stage !== 'RESOLVED';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
      {/* Primary Circular Health Score Card */}
      <div className="md:col-span-4 bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#F2F4F7]"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease',
                }}
              />
            </svg>
            {/* Center value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: strokeColor }}
              >
                {systemHealth}%
              </span>
              <span className="text-[10px] uppercase font-bold text-[#667085] tracking-wider">
                HEALTH
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: bgColor, color: badgeTextColor }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: strokeColor }}
              />
              {isHealthy ? 'STABLE PRODUCTION' : isDegraded ? 'SYSTEM DEGRADED' : 'CRITICAL OUTAGE'}
            </div>
            <h3 className="text-sm font-bold text-[#101828]">System Health Score</h3>
            <p className="text-[11px] text-[#667085] leading-relaxed">
              Synthesized from active error budgets, synthetic latency probes, and pod readiness.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Error Rate Card */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-xs font-semibold text-[#475467]">Error Rate</span>
            <AlertCircle
              className={`w-4 h-4 ${telemetry.errorRatePct > 5 ? 'text-[#F04438]' : 'text-[#12B76A]'}`}
            />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-extrabold tracking-tight transition-colors duration-500 ${
                  telemetry.errorRatePct > 5 ? 'text-[#F04438]' : 'text-[#101828]'
                }`}
              >
                {telemetry.errorRatePct.toFixed(1)}%
              </span>
              {telemetry.errorRatePct > 5 ? (
                <span className="text-[11px] font-bold text-[#F04438] flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +{(telemetry.errorRatePct - 0.4).toFixed(1)}%
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[#12B76A] flex items-center">
                  <ArrowDownRight className="w-3 h-3" /> Nominal
                </span>
              )}
            </div>
          </div>
          <div className="text-[11px] text-[#667085] flex justify-between items-center pt-1 border-t border-[#F2F4F7]">
            <span>SLO Threshold</span>
            <span className="font-mono text-[#344054]">&lt; 1.0%</span>
          </div>
        </div>

        {/* Latency Card */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-xs font-semibold text-[#475467]">P99 Latency</span>
            <Clock
              className={`w-4 h-4 ${telemetry.latencyMs > 500 ? 'text-[#F04438]' : 'text-[#12B76A]'}`}
            />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-extrabold tracking-tight transition-colors duration-500 ${
                  telemetry.latencyMs > 500 ? 'text-[#F04438]' : 'text-[#101828]'
                }`}
              >
                {telemetry.latencyMs.toLocaleString()}ms
              </span>
              {telemetry.latencyMs > 500 ? (
                <span className="text-[11px] font-bold text-[#F04438] flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> High
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[#12B76A] flex items-center">
                  <ArrowDownRight className="w-3 h-3" /> Fast
                </span>
              )}
            </div>
          </div>
          <div className="text-[11px] text-[#667085] flex justify-between items-center pt-1 border-t border-[#F2F4F7]">
            <span>Target SLO</span>
            <span className="font-mono text-[#344054]">&lt; 350ms</span>
          </div>
        </div>

        {/* Services Healthy Card */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-xs font-semibold text-[#475467]">Cluster Services</span>
            <Server
              className={`w-4 h-4 ${
                healthyServicesCount < totalServices ? 'text-[#F04438]' : 'text-[#12B76A]'
              }`}
            />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-extrabold tracking-tight ${
                  healthyServicesCount < totalServices ? 'text-[#F04438]' : 'text-[#101828]'
                }`}
              >
                {healthyServicesCount}/{totalServices}
              </span>
              <span className="text-[11px] font-medium text-[#667085]">healthy</span>
            </div>
          </div>
          <div className="text-[11px] text-[#667085] flex justify-between items-center pt-1 border-t border-[#F2F4F7]">
            <span>Replicas Ready</span>
            <span className="font-mono text-[#344054]">
              {services.reduce((acc, s) => acc + s.healthyReplicas, 0)}/
              {services.reduce((acc, s) => acc + s.replicas, 0)}
            </span>
          </div>
        </div>

        {/* Ingress Requests/min & Active Users */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-xs font-semibold text-[#475467]">Active Traffic</span>
            <Activity className="w-4 h-4 text-[#2E5FF2]" />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#101828] tracking-tight">
                {telemetry.reqPerMin.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-[#667085]">rpm</span>
            </div>
          </div>
          <div className="text-[11px] text-[#667085] flex justify-between items-center pt-1 border-t border-[#F2F4F7]">
            <span>Users Online</span>
            <span className="font-mono text-[#344054] flex items-center gap-1">
              <Users className="w-3 h-3 text-[#98A2B3]" />
              {telemetry.activeUsers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
