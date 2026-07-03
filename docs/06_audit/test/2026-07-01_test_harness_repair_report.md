# 2026-07-01 Test Harness Repair Report

## Metadata

- Author: Codex
- Time: 2026-07-01 CST
- Scope: test harness and collaboration reliability
- Gameplay logic changed: no
- Related task: repair false-pass / no-claim risks before further Teacher Feedback work

## Changes

### Browser Smoke

File:

- `tools/browser-smoke.js`

Result:

- Replaced the stale full gameplay smoke with a current lightweight boot smoke.
- The smoke now verifies:
  - page loads
  - prologue can be dismissed
  - landing remains active
  - main landing buttons render
  - start button has stronger visual weight
  - level book can open or advance to inspect preview
  - level cards render
  - no browser `pageerror`
  - no console `error`

Verification:

- `npm run smoke:browser` passed with Chrome permission.

### Worker Router

File:

- `tools/playtest_worker.js`

Result:

- Added explicit task routing:
  - `teacher_feedback_ab`
  - `act2_l13_l16`
  - `protocol_ack`
  - `unsupported`
- Removed the dangerous default fallback to L13-L16 for unknown tasks.
- Added `claimed_by`, `claimed_at`, `heartbeat_at`, and `route` when claiming tasks.
- Added report metadata:
  - `git_commit_short`
  - `tested_url`
  - `tester_version`
  - screenshot paths for Teacher Feedback A/B
- Moved server startup so unsupported/protocol tasks do not needlessly start Chrome/server work.
- Removed a 100ms browser-side polling interval from the A/B test harness.

Verification:

- Unknown route test produced `FAILED` instead of running legacy tests.
- Teacher Feedback V1 Pass A/B produced `DONE` + `SUCCESS`.
- Final report: `test_runs/report_20260701_teacher_ab_worker.json`

### CLI Timeout

File:

- `/Users/qcmorning/Desktop/project/antigravity2/agents/tester/playtester_cli.py`

Result:

- Added a 90 second unclaimed timeout.
- If `.collaboration/pending_test.json` stays `PENDING`, the CLI writes a concrete failed report and updates the task state to `TIMEOUT`.
- CLI now prints the current pending status while waiting.

Verification:

- Task `20260701_114052` timed out after 90 seconds with:
  - `.collaboration/pending_test.json.status = TIMEOUT`
  - `final_status = FAILED`
  - report path written

## Current Reliable Test Result

Latest Teacher Feedback A/B worker run:

- Task: `20260701_teacher_ab_worker`
- Pending state: `DONE`
- Final status: `SUCCESS`
- Report: `test_runs/report_20260701_teacher_ab_worker.json`

Checks passed:

- landing tagline
- start button visual priority
- English subtitle no Chinese residue
- tool menu stays open when patch mode selected
- tool-mode indicator shows `补片模式`
- Esc returns to route mode and hides the menu
- browser error logs empty

## Remaining Caveats

- The worker still uses controlled JS setup for the tool-mode part so it can bypass unrelated tutorial overlays and force a stable test state. This is acceptable for harness validation, but a later true end-user test should walk through an actual level with tools unlocked naturally.
- Chrome launch still requires elevated local permission in Codex because Playwright controls the macOS Chrome process.
