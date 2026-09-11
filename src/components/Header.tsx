import React from 'react';
import { useStore, store } from '../simulator/store';
import { SCENARIOS } from '../data/scenarios';
import { isLiveAiAvailable } from '../lib/llm';
import {
  ShieldAlert,
  Zap,
  RotateCcw,
  Pause,
  Play,
  Activity,
  Bot,
  Sparkles,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'command-center' | 'novacart' | 'topology' | 'logs';
  setActiveTab: (tab: 'command-center' | 'novacart' | 'topology' | 'logs') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const state = useStore();
  const isIncident = state.stage !== 'HEALTHY' && state.stage !== 'RESOLVED';

  return (
    <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-40 shadow-2xs">
      {/* Top Notice Bar with Prominent Philosophy Quote */}
      <div className="bg-[#F8F9FC] border-b border-[#F2F4F7] px-6 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-[#475467]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2E5FF2] shrink-0" />
          <span className="font-medium text-[#101828]">Core Principle:</span>
          <span className="italic text-[#475467]">
            "AutoOps doesn't just detect failures. It understands the incident, evaluates the safest response, takes controlled action, and proves that the system recovered."
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isLiveAiAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
              🟢 LIVE AI (Groq Llama-3.3)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79009]" />
              🟡 DEMO MODE (Deterministic Zero-Setup)
            </span>
          )}
          <span className="text-[#98A2B3]">|</span>
          <span className="font-mono text-[#667085]">Safe Action Registry: ENFORCED</span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2E5FF2] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-[#101828]">AUTOOPS</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFF4FF] text-[#2E5FF2] border border-[#D1E0FF]">
                  v2.4 PROTOTYPE
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Autonomous Multi-Agent DevOps Incident Response Platform
              </p>
            </div>
          </div>

          {/* Live Status Pill */}
          <div className="ml-2">
            {isIncident ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3F2] border border-[#FECDCA] text-[#D92D20] text-xs font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F04438]" />
                INCIDENT ACTIVE ({state.activeIncident?.scenario.severity || 'CRITICAL'})
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A]" />
                SYSTEM OPERATIONAL
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center bg-[#F2F4F7] p-1 rounded-lg border border-[#E4E7EC]">
          <button
            onClick={() => setActiveTab('command-center')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'command-center'
                ? 'bg-white text-[#101828] shadow-xs font-semibold'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            Command Center
          </button>
          <button
            onClick={() => setActiveTab('novacart')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'novacart'
                ? 'bg-white text-[#2E5FF2] shadow-xs font-semibold'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            <span>NovaCart Demo App</span>
            {isIncident && <span className="w-2 h-2 rounded-full bg-[#F04438] animate-ping" />}
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'topology'
                ? 'bg-white text-[#101828] shadow-xs font-semibold'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            Service Map & Topology
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-[#101828] shadow-xs font-semibold'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            Telemetry & Logs
          </button>
        </div>

        {/* Right: Hero Incident Injection & Autonomous Recovery Controls */}
        <div className="flex items-center gap-2.5">
          {/* Incident Selector Dropdown */}
          <div className="relative">
            <select
              value={state.selectedScenarioId}
              onChange={(e) => store.selectScenario(e.target.value)}
              disabled={state.isAutonomousRunning}
              className="text-xs bg-[#F9FAFB] border border-[#D0D5DD] text-[#344054] font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#2E5FF2] disabled:opacity-50 cursor-pointer"
            >
              {SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inject Incident Button */}
          <button
            onClick={() => store.injectIncident()}
            disabled={state.isAutonomousRunning}
            className="px-3 py-2 rounded-lg bg-white border border-[#FDA29B] text-[#D92D20] hover:bg-[#FEF3F2] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#F04438]" />
            <span>🚨 Inject Incident</span>
          </button>

          {/* HERO BUTTON: Run Autonomous Recovery */}
          <button
            onClick={() => store.runAutonomousRecovery()}
            disabled={state.isAutonomousRunning}
            className="px-4 py-2 rounded-lg bg-[#2E5FF2] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-60"
          >
            <Zap className={`w-4 h-4 text-[#FEDF89] ${state.isAutonomousRunning ? 'animate-bounce' : ''}`} />
            <span>{state.isAutonomousRunning ? 'Recovering...' : '⚡ Run Autonomous Recovery'}</span>
          </button>

          {/* Pause / Resume button */}
          {state.isAutonomousRunning ? (
            <button
              onClick={() => store.pauseAutonomy()}
              className="p-2 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F2F4F7] text-xs cursor-pointer"
              title="Pause Autonomy"
            >
              <Pause className="w-4 h-4 text-[#475467]" />
            </button>
          ) : state.isPaused ? (
            <button
              onClick={() => store.approveFix()}
              className="p-2 rounded-lg border border-[#A6F4C5] bg-[#ECFDF3] text-[#027A48] hover:bg-[#D1FADF] text-xs cursor-pointer font-semibold flex items-center gap-1"
              title="Resume Autonomy"
            >
              <Play className="w-4 h-4 text-[#12B76A]" />
              Resume
            </button>
          ) : null}

          {/* Reset System Button */}
          <button
            onClick={() => store.resetSystem()}
            className="px-2.5 py-2 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#475467] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#667085]" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
