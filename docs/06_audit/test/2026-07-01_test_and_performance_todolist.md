# 2026-07-01 Test Harness + Runtime Waste Todo

## Context

- Time: 2026-07-01 CST
- Author: Codex
- Reason: Teacher Feedback V1 Pass A/B code passed Codex self-test, but Gemini / Super Playtester did not claim task `20260701_110251`.
- Goal: repair the testing ruler first, then run a read-only performance audit. Do not change level rules or core gameplay logic in this pass.

## Safety Rules

- Do not delete project files.
- Do not change level design, tutorial story content, combat rules, pathfinding rules, or win/lose logic.
- Do not accept a `SUCCESS` report unless the task state, report file, screenshots, and requested checks match.
- If a test tool cannot perform the requested test, it must produce `FAILED`, not silently fall back to an unrelated old test.
- Prefer small, reviewable script changes and document every known limitation.

## Phase 1: Test Harness Repair

### 1.1 Browser Smoke Rewrite

Target file:

- `tools/browser-smoke.js`

Todo:

- Replace stale prologue-to-setup assumption.
- Verify the current real boot path:
  - page loads
  - prologue overlay can be dismissed
  - landing overlay is visible
  - landing start, levels, archive, settings, and credits buttons exist
  - level book can be opened from landing
  - first level card list renders
  - no browser `pageerror`
  - no console `error`
- Keep smoke lightweight. It is a "page is alive" test, not a full gameplay test.

Acceptance:

- `npm run smoke:browser` exits with code 0 when local page works.
- Failure output includes concrete failed checks.

### 1.2 Worker Task Router

Target file:

- `tools/playtest_worker.js`

Todo:

- Ensure the worker routes by task text / URL instead of defaulting to L13-L16.
- Supported routes:
  - Teacher Feedback V1 Pass A+B
  - Act2 L13-L16 vine tests
  - protocol / ACK tasks only if explicitly requested
- Unknown tasks must write a `FAILED` report.
- On claim, immediately write `RUNNING`, `claimed_by`, `claimed_at`, and `heartbeat_at`.
- On completion, write `DONE` or `FAILED`, `completed_at`, `report_path`, and `final_status`.

Acceptance:

- A Teacher Feedback task cannot accidentally run L13-L16.
- A vague or unsupported task cannot return fake success.

### 1.3 CLI Unclaimed Timeout

Target file outside escape workspace:

- `/Users/qcmorning/Desktop/project/antigravity2/agents/tester/playtester_cli.py`

Todo:

- Add an unclaimed timeout:
  - if status remains `PENDING` for 90 seconds, generate `FAILED` report and stop waiting.
- Distinguish:
  - unclaimed timeout
  - running timeout
  - completed report
- Print pending status transitions clearly.

Permission note:

- This file is outside the current writable workspace root. Codex needs approval before editing it.

Acceptance:

- A silent Gemini no longer causes a 10-minute fake wait.

### 1.4 Re-run Teacher Feedback Pass A+B

Todo:

- Start local server.
- Dispatch Teacher Feedback V1 Pass A+B.
- Confirm `.collaboration/pending_test.json` transitions through a valid lifecycle.
- Read report and inspect evidence paths.

Acceptance:

- `PENDING -> RUNNING -> DONE` with `final_status: SUCCESS`, or a concrete `FAILED` report.
- No stale `PENDING`.
- No mismatch between report task ID and pending task ID.

## Phase 2: Read-only Runtime Waste Audit

Target report:

- `docs/06_audit/performance/2026-07-01_runtime_waste_audit.md`

Todo:

- Search JavaScript runtime loops:
  - `requestAnimationFrame`
  - `setInterval`
  - `setTimeout`
  - global event listeners
  - animation mixers / timers
- Search Three.js allocation risks:
  - per-frame `new THREE.*`
  - geometry/material creation
  - texture or canvas creation
  - missing dispose patterns
- Search CSS/GPU-heavy effects:
  - `backdrop-filter`
  - large blur/filter
  - large box-shadow/glow
  - infinite animations
  - animated layout properties
- Search development/test resource risks:
  - Chrome processes
  - local HTTP servers
  - polling loops
  - reports/screenshots/videos
- Separate findings into:
  - affects players
  - affects development only
  - uncertain / needs profiling

Acceptance:

- Report lists findings with file references, severity, impact type, and recommended next fix.
- No runtime optimization code is changed during the audit phase unless it belongs to the test harness.

## Final Deliverables

- Updated test harness scripts.
- Passing `git diff --check`.
- Passing `npm run check`.
- Passing or concretely failing `npm run smoke:browser`.
- A reliable Teacher Feedback Pass A+B handoff result.
- A runtime waste audit report.
