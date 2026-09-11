import React, { useState } from 'react';
import { useStore } from '../simulator/store';
import { ServiceId } from '../types';
import {
  FileText,
  Search,
  Filter,
  GitCommit,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const LogExplorer: React.FC = () => {
  const state = useStore();
  const { systemLogs, deployments, metricsHistory, stage } = state;

  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterService, setFilterService] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = systemLogs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesService = filterService === 'ALL' || log.service === filterService;
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesService && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Telemetry Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Error Rate Chart */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F2F4F7]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F04438]" />
              <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Telemetry: Ingress Error Rate (%)
              </h4>
            </div>
            <span className="font-mono text-xs font-bold text-[#F04438]">
              Current: {state.telemetry.errorRatePct.toFixed(1)}%
            </span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#98A2B3' }} />
                <YAxis domain={[0, 65]} tick={{ fontSize: 10, fill: '#98A2B3' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '11px',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#F04438"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Chart */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F2F4F7]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2E5FF2]" />
              <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Telemetry: P99 Ingress Latency (ms)
              </h4>
            </div>
            <span className="font-mono text-xs font-bold text-[#2E5FF2]">
              Current: {state.telemetry.latencyMs.toLocaleString()}ms
            </span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#98A2B3' }} />
                <YAxis domain={[0, 4000]} tick={{ fontSize: 10, fill: '#98A2B3' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    fontSize: '11px',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#2E5FF2"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Grid: Deployment Audit Trail + Log Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Deployment History Column (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7] mb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-[#2E5FF2]" />
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Deployment Audit Trail
                </h3>
              </div>
              <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded">
                checkout-svc
              </span>
            </div>

            <div className="space-y-3">
              {deployments.map((dep) => {
                const isFailed = dep.status === 'FAILED';
                const isRolledBack = dep.status === 'ROLLED_BACK';
                const isActive = dep.status === 'ACTIVE';

                return (
                  <div
                    key={dep.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isFailed
                        ? 'bg-[#FEF3F2] border-[#FDA29B]'
                        : isRolledBack
                        ? 'bg-[#FFFAEB] border-[#FEDF89]'
                        : 'bg-[#FAFAFC] border-[#EAECF0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#101828]">
                          {dep.version}
                        </span>
                        <span className="font-mono text-[10px] text-[#667085] bg-white px-1.5 py-0.2 rounded border border-[#EAECF0]">
                          {dep.commit}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isFailed
                            ? 'bg-[#F04438] text-white'
                            : isRolledBack
                            ? 'bg-[#F79009] text-white'
                            : 'bg-[#12B76A] text-white'
                        }`}
                      >
                        {dep.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#344054] font-medium mt-1 leading-snug">
                      {dep.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#667085] mt-2 pt-1.5 border-t border-black/5">
                      <span>{dep.author}</span>
                      <span>{dep.deployedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-[#D1E0FF] text-xs text-[#175CD3] mt-3">
            <strong>Correlation Insight:</strong> AutoOps Investigator linked incident trigger to commit <code>f94a12c</code> (v2.4.1).
          </div>
        </div>

        {/* Log Explorer Column (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E4E7EC] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F2F4F7] mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2E5FF2]" />
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Cluster Log Explorer
                </h3>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#98A2B3]" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-2 py-1 text-xs border border-[#D0D5DD] rounded-lg bg-white focus:outline-none focus:border-[#2E5FF2]"
                  />
                </div>

                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="text-xs border border-[#D0D5DD] rounded-lg px-2 py-1 bg-white"
                >
                  <option value="ALL">All Levels</option>
                  <option value="ERROR">ERROR</option>
                  <option value="WARN">WARN</option>
                  <option value="INFO">INFO</option>
                </select>

                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="text-xs border border-[#D0D5DD] rounded-lg px-2 py-1 bg-white"
                >
                  <option value="ALL">All Services</option>
                  <option value="checkout">checkout</option>
                  <option value="gateway">gateway</option>
                  <option value="cart">cart</option>
                  <option value="database">database</option>
                  <option value="payment">payment</option>
                </select>
              </div>
            </div>

            {/* Log Stream Output */}
            <div className="font-mono text-xs space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-[#98A2B3] text-center py-8">
                  No log entries matched active filters.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  let badge = 'text-[#027A48] bg-[#ECFDF3] border-[#A6F4C5]';
                  if (log.level === 'ERROR' || log.level === 'FATAL') {
                    badge = 'text-[#B42318] bg-[#FEF3F2] border-[#FECDCA]';
                  } else if (log.level === 'WARN') {
                    badge = 'text-[#B54708] bg-[#FFFAEB] border-[#FEDF89]';
                  }

                  return (
                    <div
                      key={log.id}
                      className="p-1.5 rounded-lg border border-transparent hover:border-[#E4E7EC] hover:bg-[#FAFAFC] flex items-start gap-2 transition-colors"
                    >
                      <span className="text-[#98A2B3] text-[10px] shrink-0">{log.timestamp}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${badge}`}
                      >
                        {log.level}
                      </span>
                      <span className="text-[10px] font-semibold text-[#2E5FF2] shrink-0 bg-[#EFF4FF] px-1.5 py-0.2 rounded">
                        {log.service}
                      </span>
                      <span className="text-[#101828] flex-1 break-all text-[11px]">
                        {log.message}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F2F4F7] mt-2 flex items-center justify-between text-[11px] text-[#667085]">
            <span>Showing {filteredLogs.length} of {systemLogs.length} ingested logs</span>
            <span className="font-mono text-[10px]">Retention: In-Memory Ring Buffer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
