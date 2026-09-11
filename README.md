# AUTOOPS

### Autonomous Multi-Agent DevOps Incident Response Platform
> *"From Production Failure to Verified Recovery — Autonomously."*

---

## 🌟 Philosophy

> *"AutoOps doesn't just detect failures. It understands the incident, evaluates the safest response, takes controlled action, and proves that the system recovered."*

Modern cloud systems fail due to bad deployments, connection pool exhaustion, latency spikes, configuration mistakes, and crash loops. AutoOps automates the entire incident lifecycle using specialized, cooperating AI agents with strict safety guarantees:

```
🚨 INCIDENT → 🔭 DETECT → 🔍 INVESTIGATE → 🧠 ROOT CAUSE → 📋 PLAN → 🛡️ SAFETY → 🔧 REMEDIATE → 🧪 TEST → ✅ RECOVER
```

---

## ⚡ The Hero Feature: One-Click Autonomous Recovery

Click **`⚡ RUN AUTONOMOUS RECOVERY`** on the top command bar:
1. **Failure Simulation**: The target service (e.g. `checkout`) fails, dropping cluster health to **41%**, error rate spikes to **48.3%**, and NovaCart checkout visibly errors out with `500 Internal Server Error`.
2. **Detection**: **Sentinel** flags the SLO breach and opens incident `#INC-1042`.
3. **Investigation**: **Investigator** interrogates log streams and correlates failures with deployment commit `f94a12c` (`v2.4.1`).
4. **Root Cause Analysis**: **Root Cause Analyst** synthesizes diagnostic evidence with **94% confidence**.
5. **Remediation Planning**: **Planner** selects `rollback_deployment` from the **Safe Action Registry**.
6. **Safety Auditing**: **Safety Guardian** verifies zero database schema migration risk, confirms cached rollback image `v2.4.0`, and clears the plan (Risk: 12/100).
7. **Remediation**: **Remediation Agent** rolls back pods to `v2.4.0`.
8. **Automated Verification**: **Validation Agent** executes **24 automated synthetic canary tests** across all microservices.
9. **Verified Recovery**: System health restores to **99%**, NovaCart checkout instantly succeeds with confirmed orders, and a comprehensive Post-Mortem Report is generated.

---

## 🛒 Simulated Demo Application: "NovaCart"

AutoOps includes a fully functional simulated e-commerce application (**NovaCart**):
- **Catalog & Search**: Real hardware and peripheral product catalog.
- **Cart**: Add items, update quantities, dynamic tax and subtotal calculations.
- **Checkout Flow**: 
  - **Healthy State**: Instant order confirmation (`#NC-XXXXX`) with confetti celebration.
  - **Degraded State**: Visibly fails with a 500 error toast and modal explaining the upstream service failure.
  - **Recovered State**: Restores instantly as soon as AutoOps validates remediation.

---

## 🤖 The 8 Specialized AI Agents

AutoOps uses an orchestrated multi-agent network coordinated by a central Incident Manager:

| Agent | Callsign | Role |
|---|---|---|
| 🧠 **Incident Manager** | `COORDINATOR` | Central orchestrator sequencing the 8-stage incident pipeline |
| 🔭 **Sentinel** | `OBSERVER` | Continuous SLO monitoring, error budget surveillance, anomaly detection |
| 🔍 **Investigator** | `DETECTOR` | Log correlation, deployment audit diffs, dependency health analysis |
| 🧬 **Root Cause Analyst** | `DIAGNOSTICIAN` | Hypothesis generation, evidence synthesis, confidence calculation |
| 📋 **Remediation Planner** | `ARCHITECT` | Evaluates strategies against Safe Action Registry, safety ranking |
| 🛡️ **Safety Guardian** | `GUARDIAN` | Blast radius, DB migration risk, rollback availability scoring |
| 🔧 **Remediation Agent** | `EXECUTOR` | Executes strictly vetted actions from Safe Action Registry |
| 🧪 **Validation Agent** | `INSPECTOR` | Runs 24 automated synthetic canary tests against all API endpoints |

---

## 🛡️ Safe Action Registry (Hard Constraint)

AutoOps agents **never execute free-form arbitrary shell or LLM code**. The platform enforces execution against a strict, validated whitelist:

```
1. restart_service      - Graceful rolling restart of service pods
2. rollback_deployment  - Revert deployment to previous verified stable SHA/image
3. restore_config       - Restore last known valid configuration file from backup
4. switch_version       - Flip traffic split routing to stable blue/green target
5. disable_feature      - Disable degraded feature flag via dynamic configuration
6. restart_dependency   - Recycle dependent pool or gateway connection proxy
7. run_health_checks    - Execute comprehensive synthetic canary test suite
```

---

## 🚨 8 Pre-configured Realistic Incident Scenarios

1. **Checkout API Failure**: `NullPointerException` in `PaymentOrchestrator.kt:142` after deploy `v2.4.1` → Rollback to `v2.4.0`.
2. **Database Connection Failure**: Connection pool exhaustion (500/500 active) due to sync worker leak → `restart_dependency`.
3. **Payment API Timeout**: External gateway latency spike (>5000ms) → `disable_feature` (circuit breaker fallback).
4. **Inventory Service Failure**: Pod `OOMKilled` (ExitCode 137) during traffic burst → `restart_service`.
5. **High API Latency**: Redis cache TTL set to 0s causing cache stampede → `restore_config`.
6. **High Error Rate**: Envoy route table desynchronization returning 502/503 → `restart_service`.
7. **Bad Deployment**: Cart session serialization breaking schema change in `v3.1.2` → `rollback_deployment`.
8. **Service Unavailable**: Catalog parser unhandled panic on empty query tags → `restart_service`.

---

## 🎨 Enterprise Light Theme Design

- **Background**: `#F7F8FA`
- **Surface**: `#FFFFFF` with `1px #E4E7EC` border and crisp elevation shadow (`0 1px 2px rgba(16,24,40,.04), 0 4px 12px rgba(16,24,40,.05)`)
- **Primary Ink**: `#101828`
- **Secondary Ink**: `#667085`
- **Brand Accent**: `#2E5FF2`
- **Success State**: `#12B76A`
- **Degraded Warning**: `#F79009`
- **Critical Error**: `#F04438`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Launch development server
npm run dev
```

Open your browser to `http://127.0.0.1:5176/` (or the port displayed in your terminal).

### Optional: Live AI Mode with Groq
To enable real-time dynamic LLM reasoning for the Live Agent Feed:
1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Add your Groq API key:
   ```
   VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
   ```
3. Restart the dev server. The badge will switch from `🟡 DEMO MODE` to `🟢 LIVE AI (Groq Llama-3.3)`. If no key is provided or if network fails, AutoOps seamlessly operates in deterministic Demo Mode with zero delay.
