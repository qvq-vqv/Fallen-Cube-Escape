# Pass 9A Tutorial Copy Optimization

> Started: 2026-07-01 00:43 CST
> Completed: 2026-07-01 00:52 CST
> Executor: Codex / GPT-5
> Scope: low-risk tutorial copy and documentation sync only.

## Source Records Confirmed

The previous tutorial direction is preserved in the project. The most relevant records are:

- `task.md`: M11.3/M11.4 requires decoupled onboarding, less academic wording, no visible AP/CD/axis jargon, and friend-playtest readability repairs.
- `docs/03_design/core/DESIGN_BRIEF.md`: "visual first, text only the last 10%", short tutorial phrases, first appearance only, no long HUD explanations.
- `docs/03_design/levels/levels_and_tutorials_table.md`: current tutorial table, now updated for L01-L08.
- `docs/06_audit/code/2026-07-01_pass7_tutorial_block_fix_report.md`: L03 tutorial timing fix.
- `docs/06_audit/code/2026-07-01_pass8_remove_duplicate_l03_tutorial_move.md`: L03 duplicate tutorial move removal.
- `docs/04_chats/raw/2026-06-30_structure_clarity_raw.md`: raw user conversation archive.

## Changes

Only tutorial-facing copy and documentation were edited.

### `levels.js`

- L01: shortened Look/Dialog/Zoom/Move copy.
- L02: compressed key-door and pause-menu teaching from 5 gated steps to 4 gated steps.
- L03: kept only two post-rollback explanations, now shorter.
- L04: shortened rotation teaching and removed verbose "90 degree" style wording from player-facing copy.
- L07: shortened Break tool teaching and converted tool instruction steps to system tone.

No `player`, `key`, `exit`, `ais`, `voids`, `validation`, or engine rules were changed in this pass.

### Tutorial Table

Updated `docs/03_design/levels/levels_and_tutorials_table.md` for L01-L08 so it no longer describes removed/old strong tutorial steps.

## Current Strong Tutorial Step Counts

| Level | Strong tutorial steps |
|---|---:|
| L01 | 4 |
| L02 | 4 |
| L03 | 2 |
| L04 | 4 |
| L05 | 0 |
| L06 | 0 |
| L07 | 5 |
| L08 | 0 |

## Verification

| Check | Result | Notes |
|---|---|---|
| `git diff --check` | PASS | No whitespace errors. |
| `npm run check` | PASS | Syntax/import sanity check passed. |
| `npm run audit:levels` | PASS | All listed levels remain solvable; L01-L12 still validate. |
| `npm run audit:quality` | PASS | 0 issues, 0 warnings, 2 existing info notes for L32/L33 shortness. |
| `npm run playtest` | PASS | All 40 levels solved by bot. Existing notes remain: L10 `break-present-unused`, L32/L33 short. |

## Manual QA Needed

Please retest as a player:

1. L01: tutorial should feel shorter and still teach look, zoom, and first click.
2. L02: key-door lesson should be clear, and ESC open/close should still progress.
3. L03: after auto rollback, two messages only; no repeated walking lesson.
4. L04: rotation instruction should still make the intended layer obvious.
5. L07: Break tool steps should feel less like a manual and still point to the right cells.

