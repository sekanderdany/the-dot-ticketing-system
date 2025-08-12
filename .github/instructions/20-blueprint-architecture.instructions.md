---
applyTo: "**/*"
---
# Architecture Blueprint — Instruction File

**Purpose:** Create a clear, implementation-aligned architecture blueprint. Mirrors the *Comprehensive Project Architecture Blueprint Generator* in the awesome-copilot repo.

## Output sections (in order)
1. **Context & Goals:** What the system does and for whom; non-goals.
2. **Logical Components (C4-ish):** Services/modules, responsibilities, inbound/outbound deps.
3. **Data Flow & Contracts:** Key request/response shapes, DB schemas/tables, queues/topics, external APIs.
4. **Cross-Cutting Concerns:** AuthN/Z, caching, config, secrets, rate limits, idempotency, resiliency (retries/backoff/circuit breakers).
5. **Scalability & Reliability:** Bottlenecks, scaling points, SLO hints, failure domains, rollout/rollback.
6. **Operational Concerns:** Observability signals, dashboards/alerts, runbooks, backup/restore, migrations.
7. **Risks & TODOs:** Tech debt, hotspots, missing tests, security gaps.

**(Optional)** Provide simple ASCII diagrams for component and sequence flows.

## Method
- Derive from code layout and manifests; don’t invent services that don’t exist.
- Cite files inspected; list assumptions and unknowns.
- If multiple bounded contexts exist, create **a section per context**.

## Response format
- **Plan** → scope, artefacts to scan, diagram types (if any).
- **Architecture Blueprint** → sections above.
- **Notes** → validation steps, open questions, next docs to add (ADR, runbooks).

## Triggers
- “Blueprint: architecture”
- “Create an architecture blueprint for `<path>`”
