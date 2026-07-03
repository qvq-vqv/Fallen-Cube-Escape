# Pass 6 P1 Browser Crash Fix Report

> Started: 2026-06-30 23:57 CST
> Completed: 2026-07-01 00:05 CST
> Executor: Codex / GPT-5
> Scope: fix only the two P1 browser-path crash risks found in Pass 5.

## Boundary

This pass did not refactor architecture, did not move runtime code files, and did not address P2/P3 findings. The goal was deliberately narrow: remove two calls to missing browser-path APIs that could crash during normal UI flows.

## Fixed

| Finding | File | Resolution |
|---|---|---|
| P1-1: L03 cutscene called missing `game.encodeCell` | `main.js` | Replaced both calls with existing engine API `game.resolveCoord(...)`. |
| P1-2: restore tutorials flow called missing `render.initLevelVisuals` | `main.js` | Replaced with existing renderer calls `render.buildCube3D()` and `render.spawnEntities3D()`. |

## Verification

| Check | Result | Notes |
|---|---|---|
| Static missing method check for `game.*` and `render.*` used by `main.js` | PASS | Missing game methods: `[]`; missing render methods: `[]`. |
| `rg "encodeCell|initLevelVisuals" main.js game.js render.js` | PASS | No remaining references found. |
| `git diff --check` | PASS | No whitespace errors. |
| `npm run check` | PASS | Syntax/import sanity check passed. |
| `npm run audit:quality` | PASS | 0 issues, 0 warnings, 2 info notes for L32/L33 being below suggested target turns. |
| `npm run playtest` | PASS | All 40 levels solved by bot. L10 still notes `break-present-unused`; L32/L33 still short. |
| `npm run smoke:browser` | SKIPPED | Playwright is not installed in this workspace. This is an environment/tooling gap, not a new Pass 6 code error. |

## Remaining Known Items

The following were intentionally not fixed in this pass:

- P2 Act 1 realtime-mode semantics mismatch against parts of `task.md`.
- P2 `transition: all` still present in `style.css`.
- P2 Dawn/E-7 naming consistency issue.
- P2 Gemini key is still client-side and sent through a request URL.
- P3 generated report scripts can recreate root docs.
- P3 long-running UI animation loops are not all cancellable.

## Next Suggested Step

Manual browser QA should verify:

1. Enter L03 and trigger the pursuit/cutscene path that previously referenced `game.encodeCell`.
2. Use the settings/tutorial restore flow that previously referenced `render.initLevelVisuals`.
3. Confirm no console error appears and the cube/entities are visible after restore.
