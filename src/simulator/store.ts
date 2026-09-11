import { useSyncExternalStore } from 'react';
import {
  IncidentStage,
  ServiceNode,
  AgentId,
  AgentInfo,
  ActivityLogEntry,
  SystemLogEntry,
  RemediationPlan,
  RootCauseAnalysis,
  HealthCheckTest,
  DeploymentRecord,
  PostMortemReport,
  CartItem,
  Product,
  ScenarioDefinition,
  SafeActionType,
} from '../types';
import {
  SCENARIOS,
  INITIAL_SERVICES,
  INITIAL_DEPLOYMENTS,
  SYNTHETIC_CHECKS,
  INITIAL_PRODUCTS,
} from '../data/scenarios';
import { generateAgentReasoning } from '../lib/llm';
import confetti from 'canvas-confetti';

export interface State {
  selectedScenarioId: string;
  stage: IncidentStage;
  systemHealth: number; // 0-100
  telemetry: {
    errorRatePct: number;
    latencyMs: number;
    reqPerMin: number;
    activeUsers: number;
  };
  metricsHistory: {
    time: string;
    errorRate: number;
    latency: number;
    health: number;
  }[];
  services: ServiceNode[];
  deployments: DeploymentRecord[];
  activeIncident: {
    id: string;
    scenario: ScenarioDefinition;
    startedAt: string;
    elapsedSec: number;
  } | null;
  agents: Record<AgentId, AgentInfo>;
  activeAgentId: AgentId | null;
  activityFeed: ActivityLogEntry[];
  systemLogs: SystemLogEntry[];
  syntheticChecks: HealthCheckTest[];
  rootCause: RootCauseAnalysis | null;
  remediationPlan: RemediationPlan | null;
  postMortem: PostMortemReport | null;
  isAutonomousRunning: boolean;
  isPaused: boolean;
  humanOverridePending: boolean;
  // NovaCart state
  novaCart: {
    items: CartItem[];
    isCheckingOut: boolean;
    checkoutError: string | null;
    lastOrder: { orderId: string; total: number; timestamp: string } | null;
    notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  };
}

const INITIAL_AGENTS: Record<AgentId, AgentInfo> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Incident Manager',
    callsign: 'COORDINATOR',
    icon: '🧠',
    role: 'Central orchestrator, sequences agent pipeline, passes evidence, coordinates resolution',
    status: 'STANDBY',
    currentMessage: 'System telemetry nominal. Standing by on event bus.',
    elapsedMs: 0,
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    callsign: 'OBSERVER',
    icon: '🔭',
    role: 'Real-time telemetry monitor, anomaly detector, SLO breach surveillance',
    status: 'STANDBY',
    currentMessage: 'Ingress & service SLOs within acceptable thresholds.',
    elapsedMs: 0,
  },
  investigator: {
    id: 'investigator',
    name: 'Investigator',
    callsign: 'DETECTOR',
    icon: '🔍',
    role: 'Log correlation, deployment audit diffs, dependency health interrogation',
    status: 'STANDBY',
    currentMessage: 'Audit stream quiet. Zero anomalies detected.',
    elapsedMs: 0,
  },
  root_cause: {
    id: 'root_cause',
    name: 'Root Cause Analyst',
    callsign: 'DIAGNOSTICIAN',
    icon: '🧬',
    role: 'Hypothesis generation, evidence synthesis, confidence scoring',
    status: 'STANDBY',
    currentMessage: 'Awaiting anomaly trigger to synthesize hypothesis.',
    elapsedMs: 0,
  },
  planner: {
    id: 'planner',
    name: 'Remediation Planner',
    callsign: 'ARCHITECT',
    icon: '📋',
    role: 'Evaluates fix options against Safe Action Registry, ranks safety profiles',
    status: 'STANDBY',
    currentMessage: 'Ready to evaluate safe remediation strategies.',
    elapsedMs: 0,
  },
  safety: {
    id: 'safety',
    name: 'Safety Guardian',
    callsign: 'GUARDIAN',
    icon: '🛡️',
    role: 'Computes blast radius, database migration risk, checks rollback cache',
    status: 'STANDBY',
    currentMessage: 'Safety gates armed and monitoring.',
    elapsedMs: 0,
  },
  remediation: {
    id: 'remediation',
    name: 'Remediation Agent',
    callsign: 'EXECUTOR',
    icon: '🔧',
    role: 'Executes strictly vetted actions from Safe Action Registry',
    status: 'STANDBY',
    currentMessage: 'Execution engine idle in protected state.',
    elapsedMs: 0,
  },
  validation: {
    id: 'validation',
    name: 'Validation Agent',
    callsign: 'INSPECTOR',
    icon: '🧪',
    role: 'Runs 24 automated synthetic canary checks against all API surfaces',
    status: 'STANDBY',
    currentMessage: 'Synthetic test suites primed.',
    elapsedMs: 0,
  },
};

function createInitialHistory() {
  const history = [];
  const now = Date.now();
  for (let i = 10; i >= 0; i--) {
    const t = new Date(now - i * 5000);
    history.push({
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      errorRate: 0.4 + Number((Math.random() * 0.2).toFixed(1)),
      latency: 160 + Math.floor(Math.random() * 20),
      health: 99,
    });
  }
  return history;
}

const initialState: State = {
  selectedScenarioId: 'checkout_failure',
  stage: 'HEALTHY',
  systemHealth: 99,
  telemetry: {
    errorRatePct: 0.4,
    latencyMs: 168,
    reqPerMin: 4280,
    activeUsers: 14200,
  },
  metricsHistory: createInitialHistory(),
  services: JSON.parse(JSON.stringify(INITIAL_SERVICES)),
  deployments: JSON.parse(JSON.stringify(INITIAL_DEPLOYMENTS)),
  activeIncident: null,
  agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
  activeAgentId: null,
  activityFeed: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      agentId: 'orchestrator',
      agentName: 'Incident Manager',
      message: 'AutoOps system initialized. All 8 autonomous agents online and synchronized.',
      type: 'INFO',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      agentId: 'sentinel',
      agentName: 'Sentinel',
      message: 'Continuous telemetry stream established. All 8 microservices report HEALTHY.',
      type: 'SUCCESS',
    },
  ],
  systemLogs: [
    { id: 'log-1', timestamp: new Date().toLocaleTimeString(), level: 'INFO', service: 'web', message: 'HTTP ingress traffic normal: 4,280 rpm' },
    { id: 'log-2', timestamp: new Date().toLocaleTimeString(), level: 'INFO', service: 'gateway', message: 'Upstream routing health check: 100% healthy' },
    { id: 'log-3', timestamp: new Date().toLocaleTimeString(), level: 'INFO', service: 'checkout', message: 'Payment token session cache hit ratio: 98.4%' },
  ],
  syntheticChecks: SYNTHETIC_CHECKS.map((c) => ({
    ...c,
    status: 'PASSED',
    latencyMs: Math.floor(Math.random() * 40) + 15,
  })),
  rootCause: null,
  remediationPlan: null,
  postMortem: null,
  isAutonomousRunning: false,
  isPaused: false,
  humanOverridePending: false,
  novaCart: {
    items: [
      {
        id: INITIAL_PRODUCTS[0].id,
        name: INITIAL_PRODUCTS[0].name,
        price: INITIAL_PRODUCTS[0].price,
        quantity: 1,
        image: INITIAL_PRODUCTS[0].image,
      },
      {
        id: INITIAL_PRODUCTS[1].id,
        name: INITIAL_PRODUCTS[1].name,
        price: INITIAL_PRODUCTS[1].price,
        quantity: 2,
        image: INITIAL_PRODUCTS[1].image,
      },
    ],
    isCheckingOut: false,
    checkoutError: null,
    lastOrder: null,
    notification: null,
  },
};

// State store implementation
let state: State = initialState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function updateState(updater: (prev: State) => State) {
  state = updater(state);
  emit();
}

let pipelineAbortController: AbortController | null = null;

export const store = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  selectScenario: (scenarioId: string) => {
    updateState((prev) => ({
      ...prev,
      selectedScenarioId: scenarioId,
    }));
  },

  injectIncident: (scenarioId?: string) => {
    const idToUse = scenarioId || state.selectedScenarioId;
    const scenario = SCENARIOS.find((s) => s.id === idToUse) || SCENARIOS[0];

    const incidentId = `#INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString();

    // Abort any ongoing recovery pipeline
    if (pipelineAbortController) {
      pipelineAbortController.abort();
      pipelineAbortController = null;
    }

    updateState((prev) => {
      // Modify target service status
      const updatedServices = prev.services.map((svc) => {
        if (svc.id === scenario.targetService) {
          return {
            ...svc,
            status: 'CRITICAL' as const,
            errorRatePct: scenario.metricDeltas.errorRatePct,
            latencyMs: scenario.metricDeltas.latencyMs,
            healthyReplicas: 0,
            version: scenario.triggerDeployment?.version || svc.version,
          };
        }
        // Downstream gateway/web might be degraded
        if (svc.id === 'gateway' || svc.id === 'web') {
          return {
            ...svc,
            status: 'DEGRADED' as const,
            errorRatePct: Number((scenario.metricDeltas.errorRatePct * 0.4).toFixed(1)),
          };
        }
        return svc;
      });

      // Update deployments if this scenario has a trigger deployment
      let updatedDeployments = [...prev.deployments];
      if (scenario.triggerDeployment) {
        updatedDeployments = updatedDeployments.map((d) => {
          if (d.version === scenario.triggerDeployment?.version) {
            return { ...d, status: 'FAILED' as const };
          }
          return d;
        });
      }

      // Add system logs from scenario
      const newLogs: SystemLogEntry[] = scenario.logs.map((l, idx) => ({
        id: `inc-log-${Date.now()}-${idx}`,
        timestamp: new Date().toLocaleTimeString(),
        level: l.level,
        service: l.service,
        message: l.message,
      }));

      // Update synthetic checks for target service to FAILED
      const updatedChecks = prev.syntheticChecks.map((chk) => {
        if (chk.service === scenario.targetService || (scenario.targetService === 'checkout' && chk.service === 'web')) {
          return { ...chk, status: 'FAILED' as const, latencyMs: scenario.metricDeltas.latencyMs };
        }
        return chk;
      });

      // Update metric history with the spike
      const newHistory = [
        ...prev.metricsHistory.slice(1),
        {
          time: nowTime,
          errorRate: scenario.metricDeltas.errorRatePct,
          latency: scenario.metricDeltas.latencyMs,
          health: scenario.metricDeltas.healthScore,
        },
      ];

      return {
        ...prev,
        stage: 'DETECTED',
        systemHealth: scenario.metricDeltas.healthScore,
        telemetry: {
          errorRatePct: scenario.metricDeltas.errorRatePct,
          latencyMs: scenario.metricDeltas.latencyMs,
          reqPerMin: scenario.metricDeltas.reqPerMin,
          activeUsers: prev.telemetry.activeUsers,
        },
        metricsHistory: newHistory,
        services: updatedServices,
        deployments: updatedDeployments,
        syntheticChecks: updatedChecks,
        activeIncident: {
          id: incidentId,
          scenario,
          startedAt: nowTime,
          elapsedSec: 0,
        },
        systemLogs: [...newLogs, ...prev.systemLogs].slice(0, 100),
        activityFeed: [
          {
            id: `act-${Date.now()}`,
            timestamp: nowTime,
            agentId: 'sentinel',
            agentName: 'Sentinel',
            message: `🚨 ANOMALY DETECTED: ${scenario.name} on service [${scenario.targetService}]. Health dropped to ${scenario.metricDeltas.healthScore}%.`,
            type: 'ERROR',
          },
          ...prev.activityFeed,
        ],
        rootCause: null,
        remediationPlan: null,
        postMortem: null,
        isAutonomousRunning: false,
        isPaused: false,
        humanOverridePending: false,
        novaCart: {
          ...prev.novaCart,
          checkoutError: `500 Internal Server Error: POST /api/v1/checkout upstream error (${scenario.targetService} failed)`,
          notification: {
            message: `Production incident detected! NovaCart ${scenario.targetService} service is failing.`,
            type: 'error',
          },
        },
      };
    });
  },

  runAutonomousRecovery: async () => {
    // If healthy, automatically inject selected incident first so demo flow is seamless
    if (state.stage === 'HEALTHY' || !state.activeIncident) {
      store.injectIncident();
      await new Promise((r) => setTimeout(r, 800));
    }

    const currentScenario = state.activeIncident?.scenario || SCENARIOS[0];
    const incidentId = state.activeIncident?.id || '#INC-1042';

    if (pipelineAbortController) {
      pipelineAbortController.abort();
    }
    const abortController = new AbortController();
    pipelineAbortController = abortController;

    const isAborted = () => abortController.signal.aborted;

    updateState((prev) => ({
      ...prev,
      isAutonomousRunning: true,
      isPaused: false,
      humanOverridePending: false,
    }));

    const delay = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          if (isAborted()) reject(new Error('Aborted'));
          else resolve();
        }, ms);
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Aborted'));
        });
      });

    try {
      // Helper to push activity feed with agent reasoning
      const addAgentActivity = async (
        agentId: AgentId,
        message: string,
        type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'ACTION' = 'INFO'
      ) => {
        if (isAborted()) return;
        const agent = state.agents[agentId];
        const reasoning = await generateAgentReasoning(
          {
            agentName: agent.name,
            incidentTitle: currentScenario.name,
            service: currentScenario.targetService,
            evidence: currentScenario.rootCause.summary,
            stage: state.stage,
          },
          message
        );

        updateState((prev) => ({
          ...prev,
          activeAgentId: agentId,
          agents: {
            ...prev.agents,
            [agentId]: {
              ...prev.agents[agentId],
              status: 'THINKING',
              currentMessage: reasoning.text,
            },
          },
          activityFeed: [
            {
              id: `act-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toLocaleTimeString(),
              agentId,
              agentName: agent.name,
              message: reasoning.text,
              type,
              isLiveAi: reasoning.isLive,
            },
            ...prev.activityFeed,
          ],
        }));
      };

      // STAGE 1: DETECTED -> INVESTIGATING
      await delay(1200);
      updateState((prev) => ({
        ...prev,
        stage: 'INVESTIGATING',
        agents: {
          ...prev.agents,
          orchestrator: {
            ...prev.agents.orchestrator,
            status: 'THINKING',
            currentMessage: `Incident ${incidentId} activated. Coordinating multi-agent response team.`,
          },
        },
      }));
      await addAgentActivity(
        'orchestrator',
        `Incident ${incidentId} opened. Mobilizing Sentinel and Investigator to gather diagnostic traces.`
      );

      // Sentinel reports anomaly
      for (const line of currentScenario.agentReasoning.sentinel) {
        await delay(900);
        await addAgentActivity('sentinel', line, 'WARN');
      }

      // STAGE 2: INVESTIGATING
      for (const line of currentScenario.agentReasoning.investigator) {
        await delay(1100);
        await addAgentActivity('investigator', line, 'INFO');
      }

      // STAGE 3: DIAGNOSING (Root Cause)
      await delay(1000);
      updateState((prev) => ({
        ...prev,
        stage: 'DIAGNOSING',
        rootCause: currentScenario.rootCause,
      }));
      for (const line of currentScenario.agentReasoning.root_cause) {
        await delay(1000);
        await addAgentActivity('root_cause', line, 'ACTION');
      }

      // STAGE 4: PLANNING
      await delay(1000);
      updateState((prev) => ({
        ...prev,
        stage: 'PLANNING',
        remediationPlan: currentScenario.remediation,
      }));
      for (const line of currentScenario.agentReasoning.planner) {
        await delay(1000);
        await addAgentActivity('planner', line, 'INFO');
      }

      // STAGE 5: SAFETY CHECK
      await delay(1000);
      updateState((prev) => ({
        ...prev,
        stage: 'SAFETY_CHECK',
      }));
      for (const line of currentScenario.agentReasoning.safety) {
        await delay(1100);
        await addAgentActivity('safety', line, 'SUCCESS');
      }

      // STAGE 6: REMEDIATING (Execution of Safe Action Registry action)
      await delay(1000);
      updateState((prev) => ({
        ...prev,
        stage: 'REMEDIATING',
      }));

      // Validate Safe Action Registry constraint!
      const plan = currentScenario.remediation;
      await addAgentActivity(
        'remediation',
        `Validating action [${plan.action}] against Safe Action Registry... Action APPROVED.`
      );

      for (const line of currentScenario.agentReasoning.remediation) {
        await delay(1200);
        await addAgentActivity('remediation', line, 'ACTION');
      }

      // Apply remediation in simulated environment!
      updateState((prev) => {
        const targetSvc = currentScenario.targetService;
        const fixedServices = prev.services.map((svc) => {
          if (svc.id === targetSvc) {
            return {
              ...svc,
              status: 'HEALTHY' as const,
              errorRatePct: 0.2,
              latencyMs: 45,
              healthyReplicas: svc.replicas,
              version: plan.targetVersion,
            };
          }
          if (svc.id === 'gateway' || svc.id === 'web') {
            return {
              ...svc,
              status: 'HEALTHY' as const,
              errorRatePct: 0.1,
            };
          }
          return svc;
        });

        // Update deployment history to show rollback/switch
        const updatedDeployments = prev.deployments.map((d) => {
          if (d.version === plan.currentVersion) {
            return { ...d, status: 'ROLLED_BACK' as const };
          }
          if (d.version === plan.targetVersion) {
            return { ...d, status: 'ACTIVE' as const };
          }
          return d;
        });

        return {
          ...prev,
          services: fixedServices,
          deployments: updatedDeployments,
        };
      });

      // STAGE 7: VALIDATING (Synthetic Canary Test Suite)
      await delay(1000);
      updateState((prev) => ({
        ...prev,
        stage: 'VALIDATING',
      }));

      // Progressively pass the 24 synthetic checks
      for (let i = 0; i < prevChecksCount(); i += 6) {
        await delay(400);
        updateState((prev) => {
          const checks = prev.syntheticChecks.map((chk, idx) => {
            if (idx <= i + 5) {
              return {
                ...chk,
                status: 'PASSED' as const,
                latencyMs: Math.floor(Math.random() * 35) + 12,
              };
            }
            return chk;
          });
          return { ...prev, syntheticChecks: checks };
        });
      }

      for (const line of currentScenario.agentReasoning.validation) {
        await delay(900);
        await addAgentActivity('validation', line, 'SUCCESS');
      }

      // STAGE 8: RESOLVED
      await delay(1000);
      const resolveTime = new Date().toLocaleTimeString();

      const postMortem: PostMortemReport = {
        incidentId,
        title: currentScenario.name,
        severity: currentScenario.severity,
        startedAt: state.activeIncident?.startedAt || resolveTime,
        resolvedAt: resolveTime,
        mttrSeconds: 15.4,
        affectedServices: [currentScenario.targetService, 'gateway', 'web'],
        affectedUsersEstimate: currentScenario.affectedUsers,
        rootCause: currentScenario.rootCause.summary,
        remediationSteps: [
          `Sentinel triggered incident on SLO threshold breach`,
          `Investigator correlated failure with ${currentScenario.rootCause.triggerEvent}`,
          `Root Cause Analyst verified ${currentScenario.rootCause.confidencePct}% confidence hypothesis`,
          `Remediation Planner selected [${plan.action}] from Safe Action Registry`,
          `Safety Guardian verified blast radius (Risk: ${plan.riskScore}/100, Rollback: SAFE)`,
          `Remediation Agent executed ${plan.action} targeting ${plan.targetService}`,
          `Validation Agent verified 24/24 synthetic integration tests PASSED`,
        ],
        automatedChecksPassed: '24/24 synthetic tests PASSED (100% healthy)',
        preventiveMeasures: [
          'Add mandatory pre-deployment integration canary testing for secret validation',
          'Implement automated synthetic health probes prior to rolling full production traffic',
          'Enforce strict Helm linting on all environment variable bindings',
        ],
      };

      // Confetti celebration for verified recovery!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe if canvas is not ready
      }

      updateState((prev) => {
        const newHistory = [
          ...prev.metricsHistory.slice(1),
          {
            time: resolveTime,
            errorRate: 0.3,
            latency: 165,
            health: 99,
          },
        ];

        return {
          ...prev,
          stage: 'RESOLVED',
          systemHealth: 99,
          telemetry: {
            errorRatePct: 0.3,
            latencyMs: 165,
            reqPerMin: 4320,
            activeUsers: prev.telemetry.activeUsers,
          },
          metricsHistory: newHistory,
          postMortem,
          isAutonomousRunning: false,
          isPaused: false,
          humanOverridePending: false,
          activeAgentId: 'orchestrator',
          agents: {
            ...prev.agents,
            orchestrator: {
              ...prev.agents.orchestrator,
              status: 'SUCCESS',
              currentMessage: `Incident ${incidentId} successfully resolved and verified. System Health: 99%.`,
            },
            remediation: {
              ...prev.agents.remediation,
              status: 'SUCCESS',
              currentMessage: `Action [${plan.action}] executed cleanly. Pods 100% healthy.`,
            },
            validation: {
              ...prev.agents.validation,
              status: 'SUCCESS',
              currentMessage: `24/24 tests PASSED. Telemetry restored.`,
            },
          },
          activityFeed: [
            {
              id: `act-resolved-${Date.now()}`,
              timestamp: resolveTime,
              agentId: 'orchestrator',
              agentName: 'Incident Manager',
              message: `✅ INCIDENT ${incidentId} RESOLVED: System restored to 99% health. NovaCart checkout verified operational.`,
              type: 'SUCCESS',
            },
            ...prev.activityFeed,
          ],
          novaCart: {
            ...prev.novaCart,
            checkoutError: null,
            notification: {
              message: 'AutoOps has successfully restored the system! NovaCart is 100% operational.',
              type: 'success',
            },
          },
        };
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Aborted') {
        // Clean cancellation
        updateState((prev) => ({
          ...prev,
          isAutonomousRunning: false,
        }));
      }
    }
  },

  pauseAutonomy: () => {
    if (pipelineAbortController) {
      pipelineAbortController.abort();
      pipelineAbortController = null;
    }
    updateState((prev) => ({
      ...prev,
      isPaused: true,
      isAutonomousRunning: false,
      activityFeed: [
        {
          id: `act-pause-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agentId: 'orchestrator',
          agentName: 'Incident Manager',
          message: '⏸️ AUTONOMY PAUSED: Operator intervened. Awaiting manual confirmation.',
          type: 'WARN',
        },
        ...prev.activityFeed,
      ],
    }));
  },

  approveFix: () => {
    if (!state.remediationPlan && state.activeIncident) {
      updateState((prev) => ({
        ...prev,
        remediationPlan: prev.activeIncident!.scenario.remediation,
      }));
    }
    // Resume pipeline to execute remediation
    store.runAutonomousRecovery();
  },

  rejectFix: () => {
    if (pipelineAbortController) {
      pipelineAbortController.abort();
      pipelineAbortController = null;
    }
    updateState((prev) => ({
      ...prev,
      isPaused: true,
      isAutonomousRunning: false,
      activityFeed: [
        {
          id: `act-reject-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agentId: 'safety',
          agentName: 'Safety Guardian',
          message: '🛑 REMEDIATION REJECTED: Operator declined proposed action. Holding current state.',
          type: 'ERROR',
        },
        ...prev.activityFeed,
      ],
    }));
  },

  resetSystem: () => {
    if (pipelineAbortController) {
      pipelineAbortController.abort();
      pipelineAbortController = null;
    }
    updateState(() => ({
      ...initialState,
      services: JSON.parse(JSON.stringify(INITIAL_SERVICES)),
      deployments: JSON.parse(JSON.stringify(INITIAL_DEPLOYMENTS)),
      agents: JSON.parse(JSON.stringify(INITIAL_AGENTS)),
      metricsHistory: createInitialHistory(),
      activityFeed: [
        {
          id: `act-reset-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agentId: 'orchestrator',
          agentName: 'Incident Manager',
          message: '🔄 System baseline restored. All services verified HEALTHY.',
          type: 'SUCCESS',
        },
      ],
    }));
  },

  // NovaCart actions
  addCartItem: (product: Product) => {
    updateState((prev) => {
      const existing = prev.novaCart.items.find((item) => item.id === product.id);
      let items: CartItem[];
      if (existing) {
        items = prev.novaCart.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        items = [
          ...prev.novaCart.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          },
        ];
      }
      return {
        ...prev,
        novaCart: {
          ...prev.novaCart,
          items,
          notification: {
            message: `Added "${product.name}" to cart.`,
            type: 'info',
          },
        },
      };
    });
  },

  updateCartQuantity: (productId: string, delta: number) => {
    updateState((prev) => {
      const items = prev.novaCart.items
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      return {
        ...prev,
        novaCart: {
          ...prev.novaCart,
          items,
        },
      };
    });
  },

  checkoutNovaCart: async () => {
    updateState((prev) => ({
      ...prev,
      novaCart: {
        ...prev.novaCart,
        isCheckingOut: true,
        notification: null,
      },
    }));

    await new Promise((r) => setTimeout(r, 600));

    // Check if system is currently in incident state affecting checkout
    const isBroken =
      state.stage !== 'HEALTHY' &&
      state.stage !== 'RESOLVED' &&
      (state.activeIncident?.scenario.targetService === 'checkout' ||
        state.activeIncident?.scenario.targetService === 'database' ||
        state.activeIncident?.scenario.targetService === 'payment' ||
        state.activeIncident?.scenario.targetService === 'gateway');

    if (isBroken) {
      updateState((prev) => ({
        ...prev,
        novaCart: {
          ...prev.novaCart,
          isCheckingOut: false,
          checkoutError: `HTTP 500: POST /api/v1/checkout failed! Upstream [${prev.activeIncident?.scenario.targetService}] returned internal failure.`,
          notification: {
            message: 'Checkout Failed! Upstream service error. AutoOps incident response required.',
            type: 'error',
          },
        },
      }));
    } else {
      const total = state.novaCart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const orderId = `NC-${Math.floor(10000 + Math.random() * 90000)}`;

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe
      }

      updateState((prev) => ({
        ...prev,
        novaCart: {
          ...prev.novaCart,
          isCheckingOut: false,
          checkoutError: null,
          items: [],
          lastOrder: {
            orderId,
            total,
            timestamp: new Date().toLocaleTimeString(),
          },
          notification: {
            message: `Order #${orderId} confirmed! Total: $${total.toLocaleString()}`,
            type: 'success',
          },
        },
      }));
    }
  },

  dismissNotification: () => {
    updateState((prev) => ({
      ...prev,
      novaCart: {
        ...prev.novaCart,
        notification: null,
      },
    }));
  },
};

function prevChecksCount() {
  return SYNTHETIC_CHECKS.length;
}

export function useStore(): State {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
