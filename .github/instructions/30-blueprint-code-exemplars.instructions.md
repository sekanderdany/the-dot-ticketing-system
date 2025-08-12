---
applyTo: "**/*"
---
# Code Exemplars Blueprint — Instruction File

**Purpose:** Curate existing repository code as canonical examples to guide future generation. Mirrors the *Code Exemplars Blueprint Generator* in the awesome-copilot repo.

## Selection criteria (ranked)
- **Recency & usage:** Newer code depended on by current modules.
- **Idiomatic patterns:** Matches project conventions for structure, testing, errors, logging.
- **Security posture:** Input validation, secrets handling, safe queries.
- **Test coverage:** Has meaningful unit/integration tests.
- **Performance clarity:** Avoids obvious N+1 or quadratic traps at scale.

## Output (per exemplar)
- **Where & What:** `path/to/file` and the concern it exemplifies.
- **Why It’s Good:** 2–4 bullets.
- **How to Reuse:** Short snippet or checklist to replicate the pattern.
- **Caveats:** Context limits, known trade-offs.

Provide **3–7 exemplars** across common tasks (HTTP handler, validation, DB access, background job, CLI/worker, test style).

## Method
- Scan for recently modified, widely referenced modules.
- Include references to tests when available.
- Cite inspected files; list assumptions/unknowns.

## Response format
- **Plan** → search strategy and ranking.
- **Exemplars** → list as specified.
- **Notes** → gaps and suggested new exemplars to add later.

## Triggers
- “Blueprint: exemplars”
- “Identify code exemplars for `<path>`”
