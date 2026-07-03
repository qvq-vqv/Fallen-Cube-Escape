# Pass 7 Tutorial Block Fix Report

> Started: 2026-07-01 00:12 CST
> Completed: 2026-07-01 00:25 CST
> Executor: Codex / GPT-5
> Trigger: user QA feedback: no console error, but normal movement appeared blocked by the beginner tutorial.

## Problem

After Pass 6, the L03 browser crash path no longer threw an error. User QA then found a follow-up behavior problem: the game appeared unable to move normally and seemed blocked by the beginner tutorial.

The likely conflict was in L03 timing:

- L03 has an automated opening cutscene where Dawn walks into the chaser and triggers the first story rollback.
- L03 tutorial copy starts with "what was that time rollback?", so it is meant to appear after that cutscene.
- `startSelectedLevel()` was showing tutorial UI immediately after `game.initLevel(...)`, before the automated L03 cutscene completed.
- Because the tutorial system is gated, it can block normal movement until the current tutorial step is advanced.

## Fix

Only `main.js` was changed.

For L03 only:

1. Delay showing the L03 tutorial UI until the automated rollback has happened.
2. Hide any tutorial overlay/pointer during the automatic cutscene.
3. Set `game.l03CutsceneActive = true` before the delayed cutscene starts, so the player cannot accidentally input during the 1 second lead-in.
4. After rollback, call `updateTutorialUI()` and pause realtime again so the post-rollback tutorial appears at the correct story moment.

This does not change level data, enemy rules, pathfinding rules, AI movement rules, or L03 solution geometry.

## Verification

| Check | Result | Notes |
|---|---|---|
| `git diff --check` | PASS | No whitespace errors. |
| `npm run check` | PASS | Syntax/import sanity check passed. |
| `npm run audit:quality` | PASS | 0 issues, 0 warnings, 2 existing info notes for L32/L33 being below target turns. |
| `npm run playtest` | PASS | All 40 levels solved by bot. Existing notes remain: L10 `break-present-unused`, L32/L33 short. |
| `npm run smoke:browser` | SKIPPED | Playwright is not installed in this workspace. |

## Manual QA Needed

Please retest L03 in browser:

1. Start L03.
2. Confirm the L03 tutorial dialogue does not appear before Dawn's automatic walk/rollback sequence.
3. Wait for the rollback effect.
4. Confirm the tutorial appears after rollback.
5. Click/advance the two tutorial dialogue steps, then click the indicated target cell.
6. Confirm Dawn moves normally after the tutorial move step.

