# Pass 8 Remove Duplicate L03 Tutorial Move

> Started: 2026-07-01 00:29 CST
> Completed: 2026-07-01 00:33 CST
> Executor: Codex / GPT-5
> Trigger: user QA feedback that L03 still required walking the same opening route again before normal play.

## Problem

User QA found that after the L03 automatic walk and rollback, the player still had to manually walk the same first step again before the level felt like it had formally started.

This was a duplicated onboarding sequence:

- The new L03 automatic cutscene already moves Dawn into danger and triggers the rollback lesson.
- The old L03 tutorial still contained a gated `move` step targeting `{ face: 0, row: 1, col: 0 }`.
- Because the tutorial system is strongly gated, that old step forced the user to repeat the opening movement.

## Fix

Only `levels.js` was changed.

Removed the final L03 tutorial `move` step. L03 now keeps only the two post-rollback explanation dialogue steps:

1. Dawn reacts to the time rollback and the chaser.
2. System explains red preview threat tiles.

After those are advanced, the tutorial ends and normal play resumes.

## Verification

| Check | Result | Notes |
|---|---|---|
| `git diff --check` | PASS | No whitespace errors. |
| `npm run check` | PASS | Syntax/import sanity check passed. |
| `npm run audit:levels` | PASS | L03 remains solvable. |
| `npm run playtest` | PASS | All 40 levels solved by bot. Existing notes remain: L10 `break-present-unused`, L32/L33 short. |

## Manual QA Needed

Retest L03:

1. Start L03.
2. Wait for the automatic walk/rollback sequence.
3. Click through the two post-rollback tutorial messages.
4. Confirm normal movement is available immediately after the messages, without being forced to repeat the first walk target.

