import React, { useRef, useEffect } from 'react';
import { useStore } from '../simulator/store';
import { isLiveAiAvailable } from '../lib/llm';
import { Terminal, Copy, Check, Download } from 'lucide-react';

export const LiveTerminalFeed: React.FC = () => {
  const state = useStore();
  const { activityFeed, stage } = state;
  const feedBottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Auto-scroll on new entries
  useEffect(() => {
    feedBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityFeed]);

  const handleCopy = () => {
    const text = activityFeed
      .map((item) => `${item.timestamp} [${item.agentName.toUpperCase()}] ${item.message}`)
      .reverse()
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-xs flex flex-col h-full overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-[#F8F9FC] border-b border-[#E4E7EC] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDA29B]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEDF89]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#A6F4C5]" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-[#475467]" />
          <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider font-mono">
            Live Agent Activity Feed
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge */}
          {isLiveAiAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
              🟢 LIVE AI
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79009]" />
              🟡 DEMO MODE
            </span>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-[#EAECF0] text-[#667085] transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#12B76A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Log Output (Clean light mode monospace) */}
      <div className="flex-1 p-3 bg-[#FCFCFD] overflow-y-auto font-mono text-xs text-[#1D2939] space-y-1.5 leading-relaxed min-h-[260px] max-h-[380px]">
        {activityFeed.length === 0 ? (
          <div className="text-[#98A2B3] text-center py-10 font-mono text-xs">
            Awaiting agent telemetry events...
          </div>
        ) : (
          activityFeed
            .slice()
            .reverse()
            .map((entry) => {
              let badgeColor = 'text-[#475467] bg-[#F2F4F7] border-[#EAECF0]';
              if (entry.type === 'ERROR') {
                badgeColor = 'text-[#B42318] bg-[#FEF3F2] border-[#FECDCA]';
              } else if (entry.type === 'SUCCESS') {
                badgeColor = 'text-[#027A48] bg-[#ECFDF3] border-[#A6F4C5]';
              } else if (entry.type === 'WARN') {
                badgeColor = 'text-[#B54708] bg-[#FFFAEB] border-[#FEDF89]';
              } else if (entry.type === 'ACTION') {
                badgeColor = 'text-[#175CD3] bg-[#EFF4FF] border-[#D1E0FF]';
              }

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-2.5 py-0.5 hover:bg-[#F2F4F7]/60 px-1.5 rounded transition-colors"
                >
                  <span className="text-[#98A2B3] text-[11px] shrink-0 select-none">
                    {entry.timestamp}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 border uppercase select-none ${badgeColor}`}
                    style={{ minWidth: '94px', textAlign: 'center' }}
                  >
                    {entry.agentName}
                  </span>
                  <span className="text-[#101828] flex-1 break-words">
                    {entry.message}
                  </span>
                  {entry.isLiveAi && (
                    <span className="text-[9px] px-1 bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] rounded select-none shrink-0 font-sans">
                      LIVE
                    </span>
                  )}
                </div>
              );
            })
        )}
        <div ref={feedBottomRef} />
      </div>

      {/* Terminal Footer */}
      <div className="bg-[#F8F9FC] border-t border-[#E4E7EC] px-3 py-1.5 flex items-center justify-between text-[11px] text-[#667085]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
          <span>Event Bus: Streaming</span>
        </div>
        <div className="font-mono text-[10px]">
          Buffer: {activityFeed.length} entries
        </div>
      </div>
    </div>
  );
};
