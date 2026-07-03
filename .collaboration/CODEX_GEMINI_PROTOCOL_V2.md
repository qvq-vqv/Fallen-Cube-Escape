# Codex-Gemini Collaboration Protocol v2

> Created: 2026-07-01 10:00 CST
> Sender: Codex
> Project: escape
> Purpose: make the handoff reliable without the user acting as messenger.

## Roles

- Codex writes game code, runs command-line checks, dispatches test tasks, and audits reports before delivery.
- Gemini / Super Playtester claims test tasks, performs visual/gameplay QA, writes reports, and closes task state.
- The user should not need to manually pass messages between the two agents after this protocol is accepted.

## Shared Files

- Task handoff file: `.collaboration/pending_test.json`
- Report files: `test_runs/report_<task_id>.json`
- Evidence files: `test_runs/<task_id>/...` preferred; legacy flat screenshots are allowed only for old runs.
- This protocol: `.collaboration/CODEX_GEMINI_PROTOCOL_V2.md`

## Task Lifecycle

Every task must move through exactly one of these valid paths:

```text
PENDING -> RUNNING -> DONE
PENDING -> RUNNING -> FAILED
PENDING -> TIMEOUT
```

Rules:

- Codex may create a new task only when the previous task is not `PENDING` or `RUNNING`.
- Gemini must set `status: RUNNING` immediately after claiming a `PENDING` task.
- Gemini must write `claimed_by`, `claimed_at`, and `heartbeat_at` when setting `RUNNING`.
- Gemini must refresh `heartbeat_at` at least once every 60 seconds while running.
- Gemini must set `DONE` or `FAILED` when finished.
- A completed task must include `completed_at`, `report_path`, and `final_status`.
- If Gemini cannot complete a task, it must write a `FAILED` report instead of staying silent.

## Report Requirements

Each report must include:

- `task_id`, exactly matching `.collaboration/pending_test.json`.
- `status`: `SUCCESS` or `FAILED`.
- `summary`.
- `error_logs`.
- `git_commit` or `git_commit_short`.
- `tested_url`.
- `tester_version`.
- `level_results` or an equivalent checklist.
- Per-test screenshot paths.

For visual game tests, screenshots must show the actual game state being claimed. A menu, landing page, or wrong level screenshot is a failed test.

## Anti-False-Pass Rules

Gemini must fail the task if any of these happen:

- The selected level title does not match the requested level.
- A required enemy/object/mechanic is missing.
- A required action says "not executed", "unsupported", or "skipped".
- A screenshot is from the wrong screen.
- A console error or meaningful warning appears.
- The task text requests a check that was not performed.

Codex must not accept `SUCCESS` blindly. Codex must verify:

- `pending_test.json.status` is `DONE`.
- `pending_test.json.final_status` matches the report status.
- The report `task_id` matches the current task.
- Screenshots correspond to the claimed levels/states.
- Any "passed" check has a concrete detail, not a skipped detail.

## Timeout And Recovery

- CLI wait timeout should be at least 10 minutes for visual tests.
- If the CLI times out, Codex must check for late reports before concluding the run failed.
- A `RUNNING` task with stale `heartbeat_at` older than 10 minutes is considered abandoned and should be marked `FAILED` by the next active agent, with a short explanation.

## Version 2 Acceptance Handshake

Gemini should acknowledge this protocol by creating:

```text
.collaboration/protocol_v2_ack.json
```

with:

```json
{
  "status": "ACK",
  "agent": "Gemini / Super Playtester",
  "acknowledged_protocol": "CODEX_GEMINI_PROTOCOL_V2.md",
  "acknowledged_at": "<ISO timestamp>",
  "notes": "<any concerns or requested edits>"
}
```

After this ACK exists, Codex may use the protocol as the default handoff contract.
