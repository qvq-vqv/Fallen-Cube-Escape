# Code Responsibility Audit

> Date: 2026-06-30 22:37 CST
> Phase: Safe Structure Audit
> Authoring agent: Codex / GPT-5
> Scope: read-only responsibility scan of runtime source files.
> Safety note: no runtime files were moved or split in this pass.

## Simple Map

| File | Current role | Health | Main issue |
|---|---|---|---|
| `index.html` | Browser entry, all DOM shells, external scripts | playable but crowded | runtime UI structure and experimental chat UI are in one file |
| `style.css` | Global styling for every screen | too large | multiple milestone-specific styles appended at bottom |
| `main.js` | UI lifecycle controller | overloaded | menus, settings, tutorial, story events, draggable bubbles, Gemini chat all mixed |
| `game.js` | game engine | overloaded | rules, realtime mode, AI, UI updates, minimap drawing all mixed |
| `render.js` | Three.js renderer | overloaded | scene creation, materials, entities, effects, tutorial visuals, animation loop all mixed |
| `levels.js` | level data and tutorial step data | acceptable but dense | level data and tutorial scripts share one file |
| `dialogue.js` | narrative scenes | acceptable | large but mostly data |
| `story.js` | story state/reactions | acceptable | mostly data and lightweight logic |
| `locales.js` | localization strings | acceptable | needs later terminology cleanup |
| `audio.js` | audio/game-feel helpers | acceptable | not audited deeply in this pass |
| `tools/*.js` | validation/playtest/audit scripts | useful | `npm run check` only syntax-checks them; browser smoke is not run by check |

## Runtime Dependency Order

`index.html` loads scripts in this order:

1. `locales.js`
2. `audio.js`
3. `levels.js`
4. `game.js`
5. `render.js`
6. `dialogue.js`
7. `story.js`
8. `main.js`

This order matters. Do not move files into `src/` or rename them until `index.html` script paths are intentionally updated and browser-tested.

## `main.js` Responsibility Map

`main.js` is the largest clarity problem because it owns nearly every UI workflow.

Observed sections:

| Lines approx | Responsibility |
|---:|---|
| 7-145 | creates `GameEngine`, `RenderEngine`, `AudioFeedback`, `GameFeel`; collects many DOM nodes |
| 147-227 | localStorage helpers, settings state, unlock/completion state |
| 229-356 | act/level unlock, archive entries, achievement data |
| 366-516 | prologue sequence and prologue replies |
| 516-648 | terminal tabs, unread badges, text helpers, companion bubble |
| 648-813 | localization, archive rendering, credits, phone clock/wave |
| 813-1010 | loading sequence, archive unlocks, comms scene/reply rendering |
| 1011-1337 | level card metadata, hover cards, inspect preview |
| 1337-1438 | render init, landing/setup transitions, twist mode |
| 1438-1651 | ESC console, keybinds, bullet time, gameplay shortcuts |
| 1651-1751 | phone collapse, floating bubbles, draggable bubble logic |
| 1751-1906 | floating tool counts, route bubbles, level start/reset/return |
| 1933-2241 | rotation controls, story events, settings/event listeners |
| 2241-2504 | draggable bubble setup and large listener binding area |
| 2504-2811 | tutorial LED mascot, tutorial dialogue UI, tutorial advancement |
| 2894-3161 | Gemini/Dawn free chat initialization |

Risk:

- Too many unrelated features share local variables inside one `DOMContentLoaded` closure.
- A small UI change can accidentally affect startup, tutorial, chat, settings, or level loading.
- Gemini chat is not core gameplay and should eventually be isolated from the main UI lifecycle.

Future split candidates:

1. `ui/prologue.js`
2. `ui/levelBook.js`
3. `ui/settings.js`
4. `ui/phonePanel.js`
5. `ui/tutorialUi.js`
6. `ui/geminiChat.js`
7. `ui/keybinds.js`

Do not split yet. First add browser smoke coverage that proves startup, level select, L01 start, and settings still work after extraction.

## `game.js` Responsibility Map

`game.js` is the core rules file, but it also draws minimap UI and writes some DOM.

Observed sections:

| Lines approx | Responsibility |
|---:|---|
| 7-83 | constructor and global runtime state |
| 85-197 | init, level init, story reset, runtime reset |
| 208-256 | realtime tuning and trust |
| 256-390 | level book access, coord resolution, topology build |
| 390-471 | rotation permutation precompute |
| 471-671 | entity spawn, walkability, legal tool targets, neighbor/pathfinding |
| 702-881 | path clearing, feel hooks, event log, history snapshots, undo |
| 881-979 | L03 intercept, skip, tracker |
| 979-1151 | tool mode, patch, beacon, break |
| 1151-1683 | board clicks, realtime mode, realtime AI/player ticks, collisions |
| 1683-1916 | turn-based route planning and trust refusal |
| 1916-2157 | layer rotation, permutation, AI turn trigger |
| 2157-2334 | AI target/movement, threat preview, key/victory/collision |
| 2334-2563 | failure review, game over, victory overlay content |
| 2563-2951 | companion terminal, tutorial helper, UI text |
| 2951-3811 | action buttons and minimap drawing/input |

Risk:

- Core game rules and DOM/UI concerns are mixed.
- Minimap drawing is inside `GameEngine`; this makes the engine harder to test headlessly.
- Victory/gameover overlay text is set from the engine, increasing UI coupling.

Future split candidates:

1. `core/topology.js`
2. `core/rotation.js`
3. `core/pathfinding.js`
4. `core/ai.js`
5. `core/tools.js`
6. `core/realtime.js`
7. `ui/minimap.js`
8. `ui/gameSummary.js`

Highest priority boundary:

Move minimap rendering out of `GameEngine` later. This is a clarity win and should not change gameplay rules if done carefully.

## `render.js` Responsibility Map

`render.js` owns almost everything Three.js-related.

Observed sections:

| Lines approx | Responsibility |
|---:|---|
| 7-100 | constructor state |
| 100-234 | renderer/camera/controls setup |
| 234-634 | pointer input, twist rings, raycasting, fallback scene |
| 674-967 | fallback/cleanup/dispose/camera reset |
| 1171-1417 | cube creation, textures, face identity |
| 1417-1727 | materials, token bases, badges, exit/key textures |
| 1727-1982 | key/player/chaser/guardian mesh creation |
| 1982-2506 | spawn entities, tools, voids, doors, portals, bridge portals |
| 2506-2870 | route arrows, collection effects, positions, movement, realtime timers |
| 2870-3314 | threat previews, speech bubbles, tutorial pointer/focus/warnings |
| 3314-3470 | canvas text wrapping, pulses, mesh interpolation |
| 3470-3654 | layer rotation animation |
| 3654-3953 | animation loop, laser edges, layer highlight |

Risk:

- Resource lifecycle and visual feature code are intertwined.
- Tutorial visuals live inside renderer, which is okay short-term but makes renderer large.
- `disposeObject`/texture caching exist, which is good; later performance pass should test whether all generated sprites/materials are actually disposed.

Future split candidates:

1. `render/sceneSetup.js`
2. `render/cubeMesh.js`
3. `render/entities.js`
4. `render/effects.js`
5. `render/tutorialVisuals.js`
6. `render/realtimeVisuals.js`
7. `render/resourceDisposal.js`

Do not split renderer before browser smoke and visual screenshot checks exist.

## `levels.js` Responsibility Map

`levels.js` is dense but conceptually cleaner than the runtime controllers.

Observed sections:

| Lines approx | Responsibility |
|---:|---|
| 7-68 | helper functions for act, mechanic tags, difficulty, fingerprints |
| 75-350 | tutorial step scripts for selected levels |
| 381-399 | normalization |
| 399-1814 | level data L01-L40 |

Risk:

- Tutorial scripts and level data are coupled, but this is acceptable for now.
- Because level data is hand-authored, design debts like L05 no-rotation escape can appear and must be caught by playtest/audit scripts.

Future split candidates:

1. `data/tutorialSteps.js`
2. `data/levelsAct1.js`
3. `data/levelsAct2.js`
4. `data/levelHelpers.js`

This split is safer than splitting `game.js` or `render.js`, but still requires updating script loading or module format.

## `index.html` Responsibility Map

Current areas:

1. Main menu / landing.
2. Prologue overlay.
3. Setup/level book.
4. Game HUD and canvas container.
5. Tutorial overlays.
6. Floating comms/tools bubbles.
7. Dawn sketchpad chat.
8. Right phone panel.
9. ESC console.
10. Settings.
11. Gameover/victory overlays.
12. Archive room / credits.
13. Script loading.

Risk:

- Experimental Gemini/Dawn chat markup lives inside core game shell.
- Inline styles exist in several places, especially chat/settings additions.
- Script loading is root-relative and non-module.

Future cleanup:

- Do not move markup into components until a build system exists.
- First remove inline styles into `style.css` after visual QA.

## `style.css` Responsibility Map

Current shape:

1. Global variables and base setup.
2. Overlay/menu/settings.
3. Level book and inspect styles.
4. Game container and HUD.
5. Phone panel and floating bubbles.
6. Canvas/tutorial overlays.
7. Gameover/victory/archive/credits.
8. Late milestone patches and Dawn/Gemini chat styles appended near bottom.

Risk:

- Later milestone CSS is appended rather than integrated.
- Global selectors and ID selectors make accidental regressions easy.
- CSS is now the largest file by lines.

Future cleanup:

Split by screen after the project has either:

1. a build step, or
2. multiple `<link>` stylesheets with verified load order.

Until then, do not split physically.

## Tooling Notes

Useful scripts:

| Script | What it does |
|---|---|
| `npm run check` | syntax-checks JS files only |
| `npm run audit:levels` | validates level data |
| `npm run audit:design` | checks design repetition/basic level patterns |
| `npm run audit:quality` | quality audit |
| `npm run playtest` | solver summary |
| `npm run smoke:browser` | real browser smoke if Playwright/Chrome/dev server are available |

Important limitation:

`npm run check` does not execute browser smoke and does not validate CSS.

## Ownership Recommendations

Codex should own:

- `game.js`
- `render.js`
- `tools/*.js`
- future module extraction
- performance/resource audits
- validation scripts

Gemini can safely propose:

- visual direction;
- CSS snippets;
- UI copy;
- layout sketches;
- dialogue tone;
- screen mockups.

Gemini should not directly edit without Codex review:

- movement rules;
- AI logic;
- rotation topology;
- Three.js resource lifecycle;
- `index.html` script loading;
- validation tools.

## Immediate Next Safe Tasks

1. Create a physical partition plan without moving files.
2. Later, create `.gitignore` recommendations.
3. Later, audit `main.js` for extraction boundaries.
4. Later, add a real browser smoke workflow.

