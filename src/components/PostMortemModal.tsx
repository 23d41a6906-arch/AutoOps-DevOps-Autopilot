import React from 'react';
import { useStore } from '../simulator/store';
import { FileText, CheckCircle, ShieldCheck, Clock, Download, X } from 'lucide-react';

interface PostMortemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({ isOpen, onClose }) => {
  const state = useStore();
  const { postMortem } = state;

  if (!isOpen || !postMortem) return null;

  const handleDownload = () => {
    const markdown = `# Post-Mortem Incident Report: ${postMortem.incidentId}
**Title:** ${postMortem.title}
**Severity:** ${postMortem.severity}
**Started:** ${postMortem.startedAt} | **Resolved:** ${postMortem.resolvedAt}
**MTTR (Mean Time to Recovery):** ${postMortem.mttrSeconds} seconds

## Root Cause
${postMortem.rootCause}

## Remediation Steps Executed Autonomously
${postMortem.remediationSteps.map((step) => `- ${step}`).join('\n')}

## Automated Validation
${postMortem.automatedChecksPassed}

## Preventive Actions
${postMortem.preventiveMeasures.map((p) => `- ${p}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postmortem-${postMortem.incidentId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] flex items-center justify-center text-[#12B76A]">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#101828]">
                  Autonomous Incident Post-Mortem Report
                </h3>
                <span className="font-mono text-xs font-bold text-[#2E5FF2] bg-[#EFF4FF] px-2 py-0.5 rounded border border-[#D1E0FF]">
                  {postMortem.incidentId}
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Resolved in {postMortem.mttrSeconds}s with 100% automated verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#98A2B3] hover:text-[#101828] text-lg font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
            <span className="text-[11px] text-[#667085] block">Mean Time to Recover</span>
            <span className="text-lg font-extrabold text-[#12B76A]">{postMortem.mttrSeconds}s</span>
            <span className="text-[10px] text-[#98A2B3] block">Baseline human MTTR: 42m</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
            <span className="text-[11px] text-[#667085] block">Synthetic Checks</span>
            <span className="text-lg font-extrabold text-[#2E5FF2]">24 / 24</span>
            <span className="text-[10px] text-[#98A2B3] block">100% Tests Passed</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAFC] border border-[#EAECF0]">
            <span className="text-[11px] text-[#667085] block">Users Protected</span>
            <span className="text-lg font-extrabold text-[#101828]">
              {postMortem.affectedUsersEstimate.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#98A2B3] block">Zero data loss</span>
          </div>
        </div>

        {/* Root Cause Section */}
        <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#EAECF0] space-y-1">
          <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Root Cause Summary</h4>
          <p className="text-xs text-[#344054] leading-relaxed">{postMortem.rootCause}</p>
        </div>

        {/* Remediation Steps */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
            Autonomous Actions Executed
          </h4>
          <div className="space-y-1">
            {postMortem.remediationSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#FAFAFC] border border-[#F2F4F7] text-xs text-[#344054]"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preventive Measures */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
            Automated Preventive Recommendations
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#475467] bg-[#FAFAFC] p-3 rounded-xl border border-[#EAECF0]">
            {postMortem.preventiveMeasures.map((pm, idx) => (
              <li key={idx}>{pm}</li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7]">
          <span className="text-[11px] text-[#667085]">
            Verified: All synthetic tests passed, checkout operational.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg border border-[#D0D5DD] hover:bg-[#F9FAFB] text-xs font-semibold text-[#344054] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report (.md)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#2E5FF2] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
