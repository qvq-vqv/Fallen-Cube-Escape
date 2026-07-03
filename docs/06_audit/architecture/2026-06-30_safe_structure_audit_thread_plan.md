# Safe Structure Audit Thread Plan

> Date: 2026-06-30 22:31 CST
> Phase: Safe Structure Audit
> Authoring agent: Codex / GPT-5
> Scope: clarify project structure and prepare cleanup without breaking the game.

> Historical path note: this document was written before the numbered docs layout was applied. For current paths, see `docs/00_index/CURRENT_PATHS.md` and `docs/00_index/MOVE_LOG.md`.

## Goal

Produce a clear, reviewable map of the project before any physical reorganization.

This pass should answer:

1. What does each major file do?
2. Which files are runtime-critical?
3. Which files are docs, coordination, generated reports, or OS noise?
4. Which files should never be touched by Gemini without Codex review?
5. What can be safely moved later, and what must stay until script paths are updated?

## Thread Rules

1. Update `CODEX_LIVE_STATUS.md` before each major subtask.
2. Archive important user instructions in `docs/04_chats/raw/`.
3. Prefer reports over physical movement.
4. Keep each step under 10-15 minutes.
5. Run `git diff --check` and `npm run check` before ending.

## Step Plan

### Step 1: Governance Setup

Status: in progress

Actions:

1. Write this plan.
2. Write local safety rules.
3. Archive the user's current instruction.

Deliverables:

1. `docs/06_audit/architecture/2026-06-30_safe_structure_audit_rules.md`
2. `docs/06_audit/architecture/2026-06-30_safe_structure_audit_thread_plan.md`
3. transcript update in `docs/04_chats/raw/2026-06-30_structure_clarity_raw.md`

### Step 2: Read-Only Source Responsibility Scan

Status: pending

Actions:

1. Inspect headings/functions in `main.js`, `game.js`, `render.js`, `levels.js`.
2. Do not rewrite code.
3. Mark sections by responsibility.

Deliverable:

1. `docs/architecture/2026-06-30_code_responsibility_audit.md`

### Step 3: Asset And Document Partition Plan

Status: pending

Actions:

1. Categorize root files, `docs/`, `agents_hub/`, `.agents/`, `tools/`, and OS noise.
2. Mark which files should eventually move, stay, or be ignored.
3. Do not move them yet.

Deliverable:

1. `docs/architecture/2026-06-30_physical_partition_plan.md`

### Step 4: Risk Register

Status: pending

Actions:

1. Record structure risks found during the scan.
2. Separate clarity risks from performance risks.
3. Save performance details for the next round unless trivial and documentation-only.

Deliverable:

1. Risk section inside the responsibility audit.

### Step 5: Verification And Pause

Status: pending

Actions:

1. Run `git diff --check`.
2. Run `npm run check`.
3. Update heartbeat.
4. Stop and wait for user approval before any physical file moves.
