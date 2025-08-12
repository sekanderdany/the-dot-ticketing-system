---
applyTo: "**/*"
---
# Technology Stack Blueprint — Instruction File

**Purpose:** Generate a comprehensive technology stack blueprint for the current repository or a specified sub-folder. This mirrors the intent of the *Comprehensive Technology Stack Blueprint Generator* in the awesome-copilot repo.

## Output sections (in order)
1. **Stack Overview:** Languages, frameworks, key libs, runtimes (versions if found).
2. **Build & Tooling:** Build systems, package managers, linters/formatters, codegen tools.
3. **Test Strategy:** Frameworks, coverage tools, notable helpers/fixtures.
4. **Local Dev:** Scripts/targets, env setup, `.env.example`, dev containers/services.
5. **CI/CD:** Workflows, triggers, caches, artifacts, gates (lint/test/scan).
6. **Security & Compliance:** SAST/DAST/dep scanning, secret detection, license checks.
7. **Deployment & Ops:** Base images, orchestration (K8s/Compose), envs, flags, observability.
8. **Constraints:** Engine versions, resource limits, OS assumptions.

## Method
- Derive facts from manifests, lockfiles, scripts, and workflows.
- Cite the files inspected (relative paths) and list assumptions + unknowns.
- If multiple stacks exist, produce **one section per stack**.

## Response format
- **Plan** → what you’ll scan and how you’ll structure the report.
- **Stack Blueprint** → the eight sections above.
- **Notes** → gaps, verification steps, suggested follow-ups (e.g., add `.env.example`, pin versions).

## Triggers
- “Blueprint: stack”
- “Create technology stack blueprint for `<path>`”
