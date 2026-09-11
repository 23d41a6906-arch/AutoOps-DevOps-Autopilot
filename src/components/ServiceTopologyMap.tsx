import React from 'react';
import { useStore } from '../simulator/store';
import { ServiceId } from '../types';
import { Server, ArrowRight, ShieldCheck, AlertOctagon, Users, Database } from 'lucide-react';

interface TopologyNode {
  id: ServiceId;
  label: string;
  category: string;
  tier: number;
}

const TOPOLOGY_TIERS: { tier: number; label: string; nodes: TopologyNode[] }[] = [
  {
    tier: 1,
    label: 'Edge & Ingress',
    nodes: [
      { id: 'web', label: 'NovaCart Web UI', category: 'Frontend', tier: 1 },
      { id: 'gateway', label: 'API Gateway (Envoy)', category: 'Gateway', tier: 1 },
    ],
  },
  {
    tier: 2,
    label: 'Microservice Domain Layer',
    nodes: [
      { id: 'product', label: 'Product Catalog', category: 'Microservice', tier: 2 },
      { id: 'cart', label: 'Cart Service', category: 'Microservice', tier: 2 },
      { id: 'checkout', label: 'Checkout Service', category: 'Microservice', tier: 2 },
      { id: 'inventory', label: 'Inventory Service', category: 'Microservice', tier: 2 },
    ],
  },
  {
    tier: 3,
    label: 'External & Persistence',
    nodes: [
      { id: 'payment', label: 'Payment Gateway', category: 'External PCI', tier: 3 },
      { id: 'database', label: 'PostgreSQL Cluster', category: 'Persistence', tier: 3 },
    ],
  },
];

export const ServiceTopologyMap: React.FC = () => {
  const state = useStore();
  const { services, activeIncident, stage } = state;

  const affectedServiceId = activeIncident?.scenario.targetService;
  const isIncident = stage !== 'HEALTHY' && stage !== 'RESOLVED';

  const affectedCount = services.filter((s) => s.status !== 'HEALTHY').length;
  const healthyCount = services.filter((s) => s.status === 'HEALTHY').length;

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-xs space-y-5">
      {/* Header & Blast Radius Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F2F4F7]">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#2E5FF2]" />
            <h3 className="text-sm font-bold text-[#101828]">
              Service Mesh Topology & Blast Radius Analyzer
            </h3>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time graph of dependency relationships, health status, and cascading failure isolation.
          </p>
        </div>

        {/* Blast Radius Counter */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F04438]" />
            <span className="text-[#B42318] font-bold">
              {affectedCount} Affected Node{affectedCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#ECFDF3] border border-[#A6F4C5] text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
            <span className="text-[#027A48] font-bold">
              {healthyCount} Isolated & Healthy
            </span>
          </div>
          {isIncident && (
            <div className="px-3 py-1.5 rounded-lg bg-[#F8F9FC] border border-[#D0D5DD] text-xs flex items-center gap-1 text-[#344054]">
              <Users className="w-3.5 h-3.5 text-[#667085]" />
              <span className="font-bold">
                ~{activeIncident?.scenario.affectedUsers.toLocaleString()}
              </span>{' '}
              users in blast radius
            </div>
          )}
        </div>
      </div>

      {/* Tiered Architecture Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOPOLOGY_TIERS.map((tierGroup) => (
          <div
            key={tierGroup.tier}
            className="p-3.5 rounded-xl bg-[#FAFAFC] border border-[#EAECF0] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EAECF0] mb-3">
              <span className="text-xs font-bold text-[#475467] uppercase tracking-wider">
                Tier {tierGroup.tier}: {tierGroup.label}
              </span>
              <span className="text-[10px] text-[#667085] bg-white px-2 py-0.5 rounded border border-[#EAECF0]">
                {tierGroup.nodes.length} Services
              </span>
            </div>

            <div className="space-y-2.5">
              {tierGroup.nodes.map((node) => {
                const serviceData = services.find((s) => s.id === node.id);
                const status = serviceData?.status || 'HEALTHY';
                const isCritical = status === 'CRITICAL';
                const isDegraded = status === 'DEGRADED';
                const isHealthy = status === 'HEALTHY';

                let cardBorder = 'border-[#E4E7EC]';
                let cardBg = 'bg-white';
                let dotColor = 'bg-[#12B76A]';
                let textColor = 'text-[#101828]';

                if (isCritical) {
                  cardBorder = 'border-[#FDA29B] ring-2 ring-[#FDA29B]/30';
                  cardBg = 'bg-[#FEF3F2]';
                  dotColor = 'bg-[#F04438] animate-ping';
                  textColor = 'text-[#B42318]';
                } else if (isDegraded) {
                  cardBorder = 'border-[#FEDF89]';
                  cardBg = 'bg-[#FFFAEB]';
                  dotColor = 'bg-[#F79009]';
                  textColor = 'text-[#B54708]';
                }

                return (
                  <div
                    key={node.id}
                    className={`p-3 rounded-xl border transition-all ${cardBg} ${cardBorder} shadow-2xs`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                          <h4 className={`text-xs font-bold ${textColor}`}>{node.label}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#667085] block mt-0.5">
                          {serviceData?.version} • {serviceData?.healthyReplicas}/
                          {serviceData?.replicas} pods ready
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isCritical
                            ? 'bg-[#FEF3F2] text-[#F04438] border border-[#FECDCA]'
                            : isDegraded
                            ? 'bg-[#FFFAEB] text-[#F79009] border border-[#FEDF89]'
                            : 'bg-[#ECFDF3] text-[#12B76A] border border-[#A6F4C5]'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#667085] pt-2 border-t border-[#F2F4F7] mt-2 font-mono">
                      <span>Lat: {serviceData?.latencyMs}ms</span>
                      <span>Err: {serviceData?.errorRatePct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Dependency Pipeline Visualization */}
      <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#D0D5DD]">
        <span className="text-[11px] font-bold text-[#475467] uppercase tracking-wider block mb-2">
          End-to-End Transaction Route
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-2.5 py-1 rounded-md bg-white border border-[#D0D5DD] text-[#344054]">
            👤 Client / User
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3]" />
          <span className="px-2.5 py-1 rounded-md bg-white border border-[#D0D5DD] text-[#344054]">
            🌐 NovaCart Web UI
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3]" />
          <span className="px-2.5 py-1 rounded-md bg-white border border-[#D0D5DD] text-[#344054]">
            🛡️ Envoy API Gateway
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3]" />
          <span
            className={`px-2.5 py-1 rounded-md border font-semibold ${
              affectedServiceId === 'checkout'
                ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                : 'bg-white border-[#D0D5DD] text-[#344054]'
            }`}
          >
            🛒 Checkout Pipeline
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3]" />
          <span
            className={`px-2.5 py-1 rounded-md border font-semibold ${
              affectedServiceId === 'payment'
                ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                : 'bg-white border-[#D0D5DD] text-[#344054]'
            }`}
          >
            💳 Stripe / Payment
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3]" />
          <span
            className={`px-2.5 py-1 rounded-md border font-semibold ${
              affectedServiceId === 'database'
                ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                : 'bg-white border-[#D0D5DD] text-[#344054]'
            }`}
          >
            🗄️ PostgreSQL
          </span>
        </div>
      </div>
    </div>
  );
};
