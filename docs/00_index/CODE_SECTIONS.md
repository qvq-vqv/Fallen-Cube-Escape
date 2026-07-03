# Code Sections

> Updated: 2026-06-30 23:43 CST
> Pass: 4 - code section index
> Scope: map large runtime files before full audit. No runtime code moved in this pass.

## Read This First

The runtime files still live in the project root.

Do not move `main.js`, `game.js`, `render.js`, or `style.css` until a dedicated path migration pass updates:

- `index.html`
- `package.json`
- `tools/*.js`
- browser smoke checks

This file is a map for the next full code audit.

## Load Order

`index.html` loads scripts in this order:

```text
locales.js -> audio.js -> levels.js -> game.js -> render.js -> dialogue.js -> story.js -> main.js
```

That order is part of the architecture because files share globals through `window.*`.

## Highest-Risk Areas

| Area | File/lines | Why risky |
|---|---|---|
| Core rules + UI mixed together | `game.js` 1-3820 | movement, AI, realtime, victory/failure UI, tutorial UI, and minimap live in one class |
| Rendering + input mixed together | `render.js` 1-3998 | Three.js scene, picking, camera, fallback canvas, tutorial arrows, and animations share state |
| App boot + all UI screens mixed together | `main.js` 1-3163 | DOM registry, settings, level select, tutorials, comms, and Gemini chat are in one DOMContentLoaded closure |
| Global stylesheet | `style.css` 1-5092 | landing, settings, game HUD, phone UI, tutorial UI, overlays, mobile rules, and chat skin all share one file |
| Script-order globals | all runtime JS | moving files or converting modules can break hidden `window.*` assumptions |

## `main.js` Sections

| Lines | Section | What it does | Audit focus |
|---:|---|---|---|
| 1-24 | Boot and monkey patch | creates `GameEngine`, `RenderEngine`, audio, feel; wraps `game.updateUI` | check global initialization order |
| 32-145 | DOM registry | caches nearly every DOM id/query | check missing ids, duplicate lookups, null safety |
| 147-227 | Local state and persistence setup | safe parse helpers, keybind defaults, settings, selected level, story/comms/archive state | check localStorage keys and reset behavior |
| 229-365 | Progression and archive definitions | act unlocks, level visibility, archive entries, achievements | check source of truth for unlocks |
| 366-516 | Prologue flow | CRT opening sequence, reply choices, language rerender | check timers, skip behavior, language swaps |
| 516-680 | Tabs, text, language, companion basics | terminal tabs, escaping, stats, scanner chips, companion bubble, `applyLanguage` | check duplicated language updates |
| 680-856 | Archive, credits, phone clock/wave | archive persistence/rendering, credits overlay, phone voice wave | check DOM updates and loop lifecycle |
| 857-1010 | Comms/story controller | story scene rendering, replies, event reactions, `window.commsController` | check story state consistency |
| 1011-1134 | Level metadata and hover card | enemy/tool tags, level hover tooltip | check level metadata assumptions |
| 1148-1336 | Level book and inspect preview | act tabs, level cards, briefing panel, inspect mode | check selected level state and preplay render state |
| 1337-1450 | Game start, scene init, Twist, Esc console | layer dropdown, render init, landing/level book transitions, twist toggle, pause console | check state transitions |
| 1462-1649 | Settings and keybinds | key labels, persistence, dev tuning, bullet time, gameplay key handling | check keyboard conflicts and dev mode persistence |
| 1651-1798 | Phone/floating bubbles/tools | phone collapse, draggable bubbles, toolbox menu, command bubbles | check drag bounds and mobile behavior |
| 1799-1937 | Start/reset/return/highlight | starts selected level, L03 special setup, reset, return to level book, rotation highlight | check level lifecycle cleanup |
| 1949-2240 | Initial render and event listeners | initial UI render, language/prologue boot, tab events, game event handling, menu/buttons | check duplicate listeners and event order |
| 2241-2503 | Floating bubble bindings and tutorial dialogue | draggable comms/tools bubbles, tutorial notices, dialogue console | check tutorial deadlocks and skipped states |
| 2504-2910 | LED mascot and tutorial UI helpers | LED face animation, tutorial card/gesture/progress helpers | check timers and animation cleanup |
| 2911-3163 | Dawn chat / Gemini integration | free chat UI, API key storage, Gemini fetch, message append | check offline behavior, API-key safety, error handling |

## `game.js` Sections

| Lines | Section | What it does | Audit focus |
|---:|---|---|---|
| 1-84 | Constructor and state fields | initializes core game state, topology arrays, realtime fields, tutorial state | check state reset completeness |
| 85-159 | Level initialization | `init`, `initLevel`, L03 story reset | check level reset and inspect-mode behavior |
| 160-255 | Runtime reset, realtime tuning, trust | clears transient state, applies realtime tuning, loads/saves trust | check persistent trust and settings boundaries |
| 256-469 | Level book, coordinates, topology, rotations | loads levels, maps cube cells, builds neighbors, precomputes layer permutations | high-risk math/geometry audit |
| 471-644 | Entity spawn and cell legality | player/key/exit/AI placement, voids, tools, bridges | check invalid level data handling |
| 650-748 | Pathfinding and event helpers | neighbors, BFS path, adjacency, feel/event dispatch | check route validity and bridge behavior |
| 749-919 | Snapshots, undo, L03 interception, skip | history stack, rollback, story cutscene interception, skip turn | high-risk undo/story audit |
| 938-1149 | Tracker and tools | tracker target, patch, beacon, break, board click dispatcher | check tool targeting and charges |
| 1183-1668 | Realtime mode | realtime timers, player/AI movement, snapshots, rollback, collisions, visual state | high-risk performance and logic audit |
| 1683-1900 | Route planning and execution | planned route editing, skipped cells, refusal, route execution | check Dawn refusal and illegal path cases |
| 1916-2074 | Rotation | layer rotation, permutation application, AI turn trigger | high-risk cube-state audit |
| 2069-2286 | AI turns and threat previews | AI movement, targets, forbidden cells, preview paths, next-step candidates | check guardian/chaser rules |
| 2294-2562 | Win/lose flow | key collection, collisions, failure review, game over, victory billing | check overlay state and act finale |
| 2563-2876 | Gameplay UI updates | companion terminal, tutorial helper, HUD/buttons/status labels | UI mixed into engine; extraction candidate |
| 2877-3811 | Minimap drawing and pointer handling | goal/tip text, AI names, minimap cells/tools/routes/tutorial cues/clicks | strong extraction candidate, but behavior-sensitive |
| 3820 | Global export | `window.GameEngine = GameEngine` | keep until module migration |

## `render.js` Sections

| Lines | Section | What it does | Audit focus |
|---:|---|---|---|
| 1-99 | Constructor state | Three.js state, pointer state, camera state, materials/cache fields | check cleanup and state reset |
| 100-233 | Init and renderer scene | container setup, WebGL/fallback choice, scene/camera/controls | check resize and fallback behavior |
| 234-633 | Board input and picking | pointer handlers, twist ring picking, cell picking, cublet-to-cell mapping | high-risk input audit |
| 634-891 | Fallback canvas renderer | creates and draws fallback scene when WebGL unavailable | check non-WebGL support |
| 913-1169 | Disposal and camera modes | cleanup, reset camera, viewport bias, presentation camera, camera flight | check memory leaks and mode transitions |
| 1171-1479 | Cube build and materials | creates cube geometry, void-face logic, face textures, materials | high-risk rendering performance audit |
| 1484-1914 | Token and prop factories | player/chaser/guardian bodies, badges, key, exit textures | visual asset extraction candidate |
| 1915-2499 | Scene art and board props | scene art, entities, tools/void markers, door/portal/bridge props | check repeated object creation |
| 2506-2607 | Planned path and collection effects | path lines/arrows, key/chip effects | check stale mesh cleanup |
| 2608-2916 | Cell coordinates, movement, realtime visuals, threat previews | world positions, entity movement, bridge transit, timer rings, threat markers | high-risk sync with `game.js` |
| 2923-3351 | Speech and tutorial visuals | player speech bubble, tutorial arrow, focus camera, warnings, look/zoom gates | check tutorial deadlocks and timers |
| 3352-3635 | Text wrapping, pulses, interpolation, rotation animation | canvas text, cell pulses, mesh interpolation, layer rotation animation | high-risk animation lifecycle |
| 3636-3810 | Resize and animation loop | window resize, render loop | check stop/dispose behavior |
| 3811-3998 | Laser edges and layer highlight | cube edge effects, layer highlight/clear | check highlight cleanup |

## `style.css` Sections

| Lines | Section | What it styles | Audit focus |
|---:|---|---|---|
| 1-197 | Variables, loading/archive/credits, bullet time, capture glitch | shared colors and global overlays | check palette consistency and overlay stacking |
| 198-326 | Base, background, screen flash, feel toast | reset, body, cyber background, toast feedback | check mobile/viewport assumptions |
| 327-657 | Glass panels, overlays, landing page | shared panel look, main menu title creatures, landing buttons | check first-screen layout |
| 659-930 | Settings panel | settings modal, segmented controls, keybinds, dev tuning | check small-screen fit |
| 931-1376 | Setup, inspect, scanner, hover card | setup panel, level cards, inspect overlay, scanner card | check level-card readability |
| 1378-1825 | Glitch title, act tabs, level list, AI/rules previews | level-book visuals and metadata chips | check duplicated level card rules |
| 1826-2093 | Comic/prologue/finale | story panels, CRT prologue, wire cube | check overlay timing and responsive fit |
| 2094-2227 | Game container and HUD shell | game stage, preplay/inspect stage, meta toolbar, HUD panel | high-risk layout audit |
| 2228-2724 | Phone terminal, floating bubbles, comms, archive cards | phone panel, tabs, companion, comms, achievements | check phone collapse and mobile overlap |
| 2725-3288 | Canvas, route tips, task card, phone actions, tools, AP/status | 3D container, phone actions, tool buttons, fold controls, status | high-risk gameplay UI audit |
| 3289-3470 | Controls, minimap, objectives, AI panel | selects/buttons around map and objectives | check minimap sizing |
| 3471-3828 | Buttons, neon text, end panels, failure analysis | button system, gameover/victory/failure review | check overlay accessibility |
| 3829-4623 | Responsive and tutorial UI | media queries, top HUD, phone responsive, tutorial helper/dialogue, ESC console | high-risk mobile and tutorial audit |
| 4624-4758 | Skip tutorial, inspect isolation, floating toolbox, trust pulse | milestone patches and toolbox menu | check patch accumulation and selector drift |
| 4759-5092 | Scheme G Dawn chat window | avatar bubble, hand-drawn chat panel, free input/Gemini chat | check overlap with phone comms and mobile |

## Other Runtime Files

| File | Lines | Section summary | Audit focus |
|---|---:|---|---|
| `levels.js` | 1831 | level metadata, tutorial config, normalization, `createLevelBook` | level validity, tutorial locks, escape routes |
| `dialogue.js` | 907 | kaomoji library and dialogue scenes | tone consistency, old E-7/Dawn conflicts |
| `story.js` | 502 | story state, reactions, event scene keys | repeated event suppression and state persistence |
| `locales.js` | 226 | dictionaries and language helpers | missing keys and visible mixed-language text |
| `audio.js` | 312 | WebAudio effects and screen feel | muted state, audio unlock, performance |
| `tools/*.js` | 2594 | syntax, level audits, playtest, browser smoke, reports | test coverage and root path assumptions |

## Recommended Full Code Audit Order

1. `levels.js` plus `tools/*.js`: verify data and tests before touching behavior.
2. `game.js` core rules: topology, movement, tools, rotation, AI, realtime.
3. `render.js`: picking, camera, animation cleanup, rendering performance.
4. `main.js`: DOM/state/event listeners, settings, tutorial flow, Gemini/offline behavior.
5. `style.css`: layout collisions, mobile, duplicated milestone patches.

## Audit Checklist For Next Pass

Use this checklist when starting full code review:

- P0 syntax/runtime crashes.
- P1 impossible levels, tutorial deadlocks, undo/rotation corruption, win/lose state bugs.
- P1 persistence bugs: progress, trust, tutorial dismissed flags, dev mode, API key.
- P2 performance: repeated mesh/material creation, unbounded timers/listeners, heavy animations.
- P2 UI overlap: phone/chat/tutorial/ESC/inspect overlays.
- P2 mobile: small viewport text overflow and unreachable controls.
- P2 accessibility: buttons without useful labels, keyboard conflicts.
- P3 architecture: mixed UI/core logic, duplicated DOM lookups, repeated CSS patches.

## Next Safe Step

Pass 5 can now start as a **read-only full code audit**.

Do not fix issues during Pass 5 unless the user explicitly asks. The output should be a ranked issue report with file/line references and a proposed repair order.
