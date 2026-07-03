# Escape Structure Clarity Report

> Date: 2026-06-30 22:20 CST
> Pass: Structure Clarity Pass 1
> Project version marker: package.json version 0.0.0; current milestone context M11.4/M11.5 cleanup
> Authoring agent: Codex / GPT-5
> Reason: the project has been edited by multiple assistants and now needs a clear file map before deeper bug and performance work. This report is intentionally written for future review, college application evidence, and safer handoff between Codex/Gemini/other agents.

> Historical path note: this document was written before the numbered docs layout was applied. For current paths, see `docs/00_index/CURRENT_PATHS.md` and `docs/00_index/MOVE_LOG.md`.

## Executive Summary

This pass should prioritize clarity, not migration.

Recommended decision for this round:

1. Keep the current vanilla HTML/CSS/JS runtime in place.
2. Do not move core runtime files yet, because `index.html` currently loads scripts directly from root paths.
3. Create clear governance and audit documents first.
4. Treat Vite/module migration as a later optional phase, after the current responsibilities are mapped and tests are stronger.

## Vite Decision

Vite is not mainly a runtime performance tool.

What Vite helps with:

- cleaner module imports;
- easier `src/` folder structure;
- dev server with fast refresh;
- production build output;
- easier future TypeScript/testing setup.

What Vite does not automatically fix:

- Three.js resource leaks;
- duplicated event listeners;
- AI/pathfinding loops;
- CSS layout bugs;
- gameplay logic confusion.

Current recommendation: do not migrate to Vite in this pass. First make the current project understandable, then decide whether migration is worth the risk.

## Current Physical Shape

Measured on 2026-06-30:

- Full folder: about 36 MB.
- `.git`: about 34 MB.
- Runtime source files are small; the perceived heaviness is likely runtime behavior, not project size.

Top-level categories:

| Area | Current files/folders | Meaning |
|---|---|---|
| Runtime entry | `index.html`, `style.css` | Browser entry and global UI styling |
| Core game code | `game.js`, `levels.js` | Rules, topology, levels, AI, tools, victory/failure |
| Rendering | `render.js`, `audio.js` | Three.js scene, effects, audio feedback |
| UI/lifecycle | `main.js`, `locales.js` | DOM binding, menus, tutorial flow, i18n |
| Story/data | `dialogue.js`, `story.js` | Dawn dialogue, story scenes, reactions |
| Tools | `tools/*.js` | Validation, playtest, audits, smoke script |
| Active coordination | `agents_hub/`, `CODEX_LIVE_STATUS.md` | Agent board, heartbeat, rules |
| Older/duplicate agent notes | `.agents/` | Appears similar to `agents_hub`; should be reviewed later, not deleted now |
| Documentation | `docs/`, root `*.md` reports | Many root docs duplicate files under `docs/` |
| OS/editor noise | `.DS_Store`, `.agents/.DS_Store`, `agents_hub/.DS_Store` | Not gameplay assets; should be ignored/segregated later |

## Current Code Size Hotspots

Line counts from this pass:

| File | Lines | Risk |
|---|---:|---|
| `style.css` | 5092 | Very large global stylesheet; CSS regressions easy |
| `render.js` | 3998 | Large Three.js responsibility surface |
| `game.js` | 3820 | Large core rules/state machine surface |
| `main.js` | 3163 | UI lifecycle, settings, tutorial, Gemini chat, DOM bindings mixed together |
| `levels.js` | 1831 | Level data and tutorial scripts in one file |
| `dialogue.js` | 907 | Narrative data |

The biggest clarity risk is not file size alone. It is that `main.js`, `game.js`, and `render.js` each contain several different responsibilities.

## Proposed Source Boundaries

For now, treat these as ownership rules even before moving files:

| Boundary | Owner file now | Allowed responsibility |
|---|---|---|
| Game rules | `game.js` | movement, AI, state transitions, collisions, win/loss, tools |
| Level data | `levels.js` | level definitions, tutorial metadata, validation hints |
| Renderer | `render.js` | Three.js scene, mesh/effect lifecycle, camera, pointer raycast |
| UI shell | `main.js` | DOM lifecycle, menus, settings, panels, event wiring |
| Text/story | `dialogue.js`, `story.js`, `locales.js` | text, choices, localization, reactions |
| Validation | `tools/*.js` | non-runtime checks and reports |

Rule of thumb:

- Gemini may propose UI and copy changes.
- Codex should own core logic, performance, validation, and file moves.
- No assistant should change `game.js`, `render.js`, or `main.js` without naming the exact sub-area being touched.

## Physical Folder Strategy

Safe now:

- `docs/architecture/`: architecture and structure reports.
- `docs/04_chats/raw/`: raw conversation archives per phase.
- `agents_hub/FAIL_SAFE_RULES/`: short permanent rules only.

Do later, after a passing checkpoint:

- Move root documentation duplicates into a stable archive folder.
- Add/update `.gitignore` for `.DS_Store` and generated reports.
- Consider `src/` split only after each runtime file has a responsibility map.

Do not do yet:

- Do not move `index.html`, `style.css`, or root `.js` runtime files until script paths and browser checks are ready.
- Do not delete duplicates or `.DS_Store` in this pass.

## First-Stage Task List

Status legend: TODO means planned but not done in this pass.

| Task | Status | Notes |
|---|---|---|
| Add raw conversation preservation rule | DONE | Added as Global Fail-Safe Rule 6 |
| Create architecture report folder | DONE | `docs/architecture/` |
| Create transcript folder | DONE | now organized at `docs/04_chats/raw/` |
| Map current file responsibilities | DONE | This report |
| Mark Vite as later optional migration | DONE | Not recommended this round |
| Audit `main.js` responsibility sections | TODO | Needed before splitting |
| Audit `game.js` state machine sections | TODO | Needed before logic cleanup |
| Audit `render.js` resource lifecycle | TODO | Save for performance pass |
| Create `.gitignore` cleanup plan | TODO | Do not delete files yet |
| Decide duplicate docs source-of-truth | TODO | Root docs vs `docs/` duplicates |

## Next Recommended Phase

Phase 2 should be a code responsibility audit, not a rewrite:

1. Read and outline `main.js` into sections.
2. Read and outline `game.js` into sections.
3. Read and outline `render.js` into sections.
4. Mark "safe to split later" chunks.
5. Only after that, consider physical module extraction.
