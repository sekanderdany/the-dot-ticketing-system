---
applyTo: "**/*"
---
# Copilot Instructions Blueprint — Instruction File

**Purpose:** Generate a tailored `.github/copilot-instructions.md` (or additional scoped `.instructions.md` files) for this repository by analyzing actual patterns—versions, frameworks, testing, security—while avoiding guesses.

## Required analysis
- **Languages & frameworks** per folder (detect monorepo contexts).
- **Formatting & linting** tools and config.
- **Test frameworks & coverage** approach.
- **Security posture:** SAST/DAST/dep scans, secret detection, minimal-perms patterns.
- **CI/CD structure** (workflows, triggers, caches, artifacts, gates).
- **Deployment & runtime** (Docker/K8s/Compose; base images, envs).
- **Constraints** (engine versions, OS, resource limits).

## Output
1. **Repo Operating Rules** (compact): ground rules, response format, quality gates.
2. **Secure-by-default checklist** (practical items for this repo).
3. **Language-specific rules** discovered (TS/Python/Go/etc.).
4. **Scoped instruction suggestions** with proposed `applyTo` globs (e.g., `web/**`, `api/**`, `.github/workflows/**`), explaining why.
5. **Migration notes** to adopt the new instructions safely.

## Response format
- **Plan** → what will be scanned and how the output will be structured.
- **Draft Instructions** → the four parts above.
- **Notes** → open questions; list of globs the maintainer should confirm.

## Triggers
- “Blueprint: instructions for `<path or repo>`”
- “Generate copilot-instructions for this repository”
