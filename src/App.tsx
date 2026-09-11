import React, { useState } from 'react';
import { useStore, store } from './simulator/store';
import { Header } from './components/Header';
import { HeroHealthGauge } from './components/HeroHealthGauge';
import { IncidentCommandBar } from './components/IncidentCommandBar';
import { AgentNetworkGraph } from './components/AgentNetworkGraph';
import { LiveTerminalFeed } from './components/LiveTerminalFeed';
import { RootCauseFixPlan } from './components/RootCauseFixPlan';
import { NovaCart } from './components/novacart/NovaCart';
import { ServiceTopologyMap } from './components/ServiceTopologyMap';
import { LogExplorer } from './components/LogExplorer';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { PostMortemModal } from './components/PostMortemModal';
import {
  FileText,
  Activity,
  ShoppingCart,
  Server,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

export function App() {
  const state = useStore();
  const [activeTab, setActiveTab] = useState<'command-center' | 'novacart' | 'topology' | 'logs'>(
    'command-center'
  );
  const [isPostMortemOpen, setIsPostMortemOpen] = useState(false);

  // Automatically open post-mortem button when resolved
  const isResolved = state.stage === 'RESOLVED' && state.postMortem !== null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#101828] flex flex-col antialiased selection:bg-[#2E5FF2]/10 selection:text-[#2E5FF2]">
      {/* Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Post-Mortem Notification Banner if resolved */}
        {isResolved && (
          <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] shadow-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-[#12B76A]" />
              <div>
                <h4 className="text-xs font-bold text-[#027A48]">
                  Incident Verified & Autonomously Resolved!
                </h4>
                <p className="text-[11px] text-[#027A48]">
                  Recovery verified across 24 synthetic checks. NovaCart checkout restored in{' '}
                  {state.postMortem?.mttrSeconds}s.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPostMortemOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#12B76A] hover:bg-[#027A48] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              View Post-Mortem Report
            </button>
          </div>
        )}

        {/* TAB 1: COMMAND CENTER */}
        {activeTab === 'command-center' && (
          <div className="space-y-5">
            {/* Live Health Gauge & KPIs */}
            <HeroHealthGauge />

            {/* Active Incident Banner & Visual 8-Stage Timeline */}
            <IncidentCommandBar />

            {/* Split Grid: Agent Mesh Network + Live Monospace Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <AgentNetworkGraph />
              </div>
              <div className="lg:col-span-6">
                <LiveTerminalFeed />
              </div>
            </div>

            {/* Root Cause Synthesis & AI Fix Plan */}
            <RootCauseFixPlan />

            {/* Split View with Interactive NovaCart Mini Preview + Quick Topology */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7] mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#2E5FF2]" />
                      <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                        NovaCart Live Integration Preview
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('novacart')}
                      className="text-xs text-[#2E5FF2] hover:underline font-semibold cursor-pointer"
                    >
                      Open Full Storefront →
                    </button>
                  </div>
                  <div className="h-[460px]">
                    <NovaCart />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <AnalyticsPanel />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL NOVACART STOREFRONT */}
        {activeTab === 'novacart' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E4E7EC]">
              <div>
                <h2 className="text-sm font-bold text-[#101828]">NovaCart Production E-Commerce</h2>
                <p className="text-xs text-[#667085]">
                  Test product additions and checkout transactions against active cluster health.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('command-center')}
                className="px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold hover:bg-[#F9FAFB] cursor-pointer"
              >
                ← Back to Ops Command Center
              </button>
            </div>
            <div className="h-[680px]">
              <NovaCart />
            </div>
          </div>
        )}

        {/* TAB 3: TOPOLOGY & BLAST RADIUS */}
        {activeTab === 'topology' && (
          <div className="space-y-5">
            <ServiceTopologyMap />
            <AnalyticsPanel />
          </div>
        )}

        {/* TAB 4: TELEMETRY & LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-5">
            <LogExplorer />
          </div>
        )}
      </main>

      {/* Post-Mortem Report Modal */}
      <PostMortemModal
        isOpen={isPostMortemOpen}
        onClose={() => setIsPostMortemOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-8 border-t border-[#E4E7EC] bg-white py-4 px-6 text-center text-xs text-[#667085]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>AUTOOPS</strong> — Autonomous Multi-Agent DevOps Incident Response Platform
          </span>
          <span className="font-mono text-[11px] text-[#98A2B3]">
            Light Enterprise UI • React 19 • TypeScript • Tailwind v4 • Framer Motion
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
