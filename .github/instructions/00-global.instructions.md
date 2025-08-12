---
applyTo: "**/*"
---
# Global Copilot Instructions — Repository Operating Rules

These instructions tell GitHub Copilot how to work in this repository: how to read it, propose changes, generate docs/diagrams, and keep everything consistent and secure. Keep this file short and authoritative; put task-specific rules into additional `.instructions.md` files in this same folder.

## 0) Ground rules
- **Read first, then act.** Identify primary languages, frameworks, entry points, tooling and CI by scanning manifests and workflows (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle*`, `requirements*.txt`, `Gemfile`, `composer.json`, `Dockerfile*`, `.tool-versions`, `.nvmrc`, `.python-version`, `Makefile`, `Taskfile*`, `.github/workflows/*.yml`, top-level `src/**` and `app/**`). If multiple stacks exist, detect each one.
- **Conform to the repo.** Reuse existing patterns (directory layout, error handling, logging, tests) instead of inventing new ones. Avoid new dependencies unless benefit is clear and risk low; justify any new dep.
- **Minimal, safe diffs.** Prefer the smallest change that solves the problem. Provide unified diffs with correct relative paths.
- **Be explicit.** If something is ambiguous, state assumptions. Ask up to **3** precise questions only when blocked.
- **Deterministic & testable.** Prefer pure functions, clear inputs/outputs, and idempotent scripts/migrations.
- **Security-first.** Never commit secrets. Validate external inputs, parameterize queries, apply least privilege in CI/infra, and pin versions when feasible.

## 1) Default response format
When proposing work, structure the answer exactly like this:
1. **Plan** — 3–7 bullets (what & why).
2. **Patch** — Unified diff(s) with minimal context.
3. **Notes** — Tests/docs to update, risks, rollout/rollback, follow-ups.

If a diff is long, include the critical hunks and list the rest by file/function.

## 2) Quality gates & style
- **Formatting:** Use repo’s formatter/linters. If none, default to Prettier (JS/TS), Black (Python), gofmt/goimports (Go), rustfmt (Rust).
- **Types:** Prefer explicit types (TS/Go/Rust) and Python type hints for new/edited code.
- **Testing:** Add/update tests for non-trivial changes. Keep tests fast and deterministic. Use the dominant framework already present (Jest/Vitest, pytest, Go test, JUnit, etc.). Include negative cases and edge conditions.
- **Errors & logging:** Follow project logging pattern; never swallow errors. Return actionable messages without leaking secrets.
- **Docs:** New public APIs need docstrings + a short example. If behavior/setup changes, update README and add MIGRATION/UPGRADE notes.

## 3) Secure-by-default checklist (always apply)
- Validate inputs at boundaries; avoid string-concatenated queries—use parameterized APIs/ORMs.
- Sanitize/encode data; protect against XSS/CSRF/SSRF. Set secure headers and CSP where applicable.
- Store secrets outside source; use env/secret managers. Rotate tokens.
- Minimize permissions in CI, containers, and cloud roles; prefer read-only tokens.
- Pin/verify dependencies; surface known vulns (e.g., `npm audit`, `pip-audit`, `osv-scanner`).
- Log security-relevant events without sensitive payloads.

## 4) Language defaults (quick)
- **JS/TS:** Modern modules, async/await, strict TS where present, DI for testability.
- **Python:** Type hints, `dataclasses` where apt, context managers for resources.
- **Go:** Small packages, no global state, return `(val, err)`, table-driven tests.
- **Java/Kotlin:** Immutability, constructor injection, clear DTO/domain boundaries.
- **Rust:** `Result<>` with anyhow/thiserror; document any `unsafe` (avoid if possible).

## 5) What to avoid
- Pseudo-code/TODOs in place of real implementations.
- Large rewrites without incremental steps and clear upside.
- Breaking public APIs without a migration path.
- Tools that contradict repo standards.

## 6) Response templates (copy-ready)
**Bug fix** → Plan (root cause, minimal fix, tests) → Patch → Notes (risks, verification, rollback)

**Small feature** → Plan (story, acceptance, files) → Patch → Notes (config/env/infra, tests, docs)

**Refactor** → Plan (goals, non-goals) → Patch (mechanical + risky spots) → Notes (parity, tests)

## 7) Blueprint shortcuts (see separate files)
Ask for: “**Blueprint: stack**”, “**Blueprint: architecture**”, “**Blueprint: exemplars**”, or “**Blueprint: instructions for <path>**”.
