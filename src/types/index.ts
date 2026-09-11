export type IncidentStage =
  | 'HEALTHY'
  | 'DETECTED'
  | 'INVESTIGATING'
  | 'DIAGNOSING'
  | 'PLANNING'
  | 'SAFETY_CHECK'
  | 'REMEDIATING'
  | 'VALIDATING'
  | 'RESOLVED';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ServiceId =
  | 'web'
  | 'gateway'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'inventory'
  | 'payment'
  | 'database';

export type ServiceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';

export interface ServiceNode {
  id: ServiceId;
  name: string;
  version: string;
  previousVersion?: string;
  status: ServiceHealthStatus;
  latencyMs: number;
  errorRatePct: number;
  replicas: number;
  healthyReplicas: number;
  dependencies: ServiceId[];
  description: string;
}

export type SafeActionType =
  | 'restart_service'
  | 'rollback_deployment'
  | 'restore_config'
  | 'switch_version'
  | 'disable_feature'
  | 'restart_dependency'
  | 'run_health_checks';

export const SAFE_ACTIONS: { id: SafeActionType; label: string; description: string }[] = [
  { id: 'restart_service', label: 'Restart Service', description: 'Perform graceful rolling restart of service pods' },
  { id: 'rollback_deployment', label: 'Rollback Deployment', description: 'Revert deployment to previous verified stable SHA/image' },
  { id: 'restore_config', label: 'Restore Config', description: 'Restore last known valid configuration file from versioned backup' },
  { id: 'switch_version', label: 'Switch Version', description: 'Flip traffic split routing to stable blue/green target' },
  { id: 'disable_feature', label: 'Disable Feature', description: 'Disable degraded feature flag via dynamic configuration' },
  { id: 'restart_dependency', label: 'Restart Dependency', description: 'Recycle dependent pool or gateway connection proxy' },
  { id: 'run_health_checks', label: 'Run Health Checks', description: 'Execute comprehensive synthetic canary test suite' },
];

export interface RemediationPlan {
  action: SafeActionType;
  targetService: ServiceId;
  currentVersion: string;
  targetVersion: string;
  riskScore: number; // 0-100
  blastRadius: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  rollbackAvailable: boolean;
  dbMigrationRisk: boolean;
  serviceIsolated: boolean;
  expectedRecoverySec: number;
}

export type AgentId =
  | 'orchestrator'
  | 'sentinel'
  | 'investigator'
  | 'root_cause'
  | 'planner'
  | 'safety'
  | 'remediation'
  | 'validation';

export type AgentState = 'STANDBY' | 'THINKING' | 'EXECUTING' | 'SUCCESS' | 'WAITING_APPROVAL' | 'FAILED';

export interface AgentInfo {
  id: AgentId;
  name: string;
  callsign: string;
  icon: string;
  role: string;
  status: AgentState;
  currentMessage: string;
  elapsedMs: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  agentId: AgentId;
  agentName: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'ACTION';
  isLiveAi?: boolean;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  service: ServiceId;
  message: string;
}

export interface EvidenceItem {
  id: string;
  label: string;
  verified: boolean;
  detail: string;
}

export interface RootCauseAnalysis {
  title: string;
  summary: string;
  confidencePct: number;
  affectedService: ServiceId;
  triggerEvent: string;
  evidence: EvidenceItem[];
  recommendedAction: SafeActionType;
}

export interface HealthCheckTest {
  id: string;
  service: ServiceId;
  name: string;
  endpoint: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  latencyMs: number;
}

export interface DeploymentRecord {
  id: string;
  version: string;
  service: ServiceId;
  deployedAt: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'FAILED' | 'ROLLED_BACK';
  author: string;
  commit: string;
  message: string;
}

export interface PostMortemReport {
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  startedAt: string;
  resolvedAt: string;
  mttrSeconds: number;
  affectedServices: string[];
  affectedUsersEstimate: number;
  rootCause: string;
  remediationSteps: string[];
  automatedChecksPassed: string;
  preventiveMeasures: string[];
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  severity: IncidentSeverity;
  targetService: ServiceId;
  affectedUsers: number;
  metricDeltas: {
    healthScore: number;
    errorRatePct: number;
    latencyMs: number;
    reqPerMin: number;
  };
  symptoms: string[];
  triggerDeployment?: {
    version: string;
    commit: string;
    message: string;
  };
  logs: Omit<SystemLogEntry, 'id' | 'timestamp'>[];
  rootCause: RootCauseAnalysis;
  remediation: RemediationPlan;
  agentReasoning: {
    sentinel: string[];
    investigator: string[];
    root_cause: string[];
    planner: string[];
    safety: string[];
    remediation: string[];
    validation: string[];
    orchestrator: string[];
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  description: string;
  image: string;
}
