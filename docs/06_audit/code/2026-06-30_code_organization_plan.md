# Code Organization Plan

> Date: 2026-06-30 23:35 CST
> Phase: Pass 3 code organization planning
> Authoring agent: Codex / GPT-5
> Scope: plan code cleanup without moving runtime files yet.

## One-Screen Summary

The game currently runs as a classic browser script stack, not as a module app.

`index.html` loads files in this exact order:

```text
locales.js -> audio.js -> levels.js -> game.js -> render.js -> dialogue.js -> story.js -> main.js
```

That order matters because files share globals through `window.*`.

So the safest next move is **not** to drag JS files into folders immediately. The safest next move is to split responsibilities inside the current files first, then move files only after browser smoke tests are ready.

## Current Code Map

| File | Lines | Current role | Risk |
|---|---:|---|---|
| `index.html` | 644 | DOM structure, script order, CDN Three.js, inline UI markup | high if script paths or ids change |
| `style.css` | 5092 | all visual systems in one stylesheet | medium-high because selectors span many screens |
| `main.js` | 3163 | app boot, DOM binding, menus, settings, tutorials, comms, Gemini chat, UI glue | high because it touches nearly every DOM id |
| `game.js` | 3820 | cube topology, rules, movement, AI, realtime mode, victory/failure UI, minimap | highest because core rules and UI are mixed |
| `render.js` | 3998 | Three.js scene, fallback canvas, camera, board picking, 3D assets, tutorial visuals | highest because rendering and input are mixed |
| `levels.js` | 1831 | level data, tutorial step config, normalization helpers | medium because data edits can break levels |
| `dialogue.js` | 907 | dialogue and kaomoji scripts | low-medium |
| `story.js` | 502 | story state, reactions, ambient bubbles | low-medium |
| `locales.js` | 226 | language dictionary and helpers | low |
| `audio.js` | 312 | audio feedback and screen feel | low-medium |
| `tools/*.js` | 2594 total | validation, playtest, browser smoke, reports | medium because paths assume root JS files |

## Important Dependency Facts

Current globals exported by files:

| File | Exposes |
|---|---|
| `locales.js` | `window.I18N`, `window.currentLang`, `window.t`, `window.getText`, `window.setLanguage` |
| `audio.js` | `window.AudioFeedback`, `window.GameFeel` |
| `levels.js` | `window.createLevelBook` |
| `game.js` | `window.GameEngine` |
| `dialogue.js` | `window.KAOMOJI_LIB`, `window.DIALOGUE_SCRIPT` |
| `story.js` | `window.STORY_MODULE`, and it also mutates `window.DIALOGUE_SCRIPT.scenes` |

Current heavy cross-dependencies:

- `game.js` calls `window.renderEngine`, `window.audioFeedback`, `window.gameFeel`, `window.updateTutorialUI`, `window.commsController`, `window.t`, and `window.getText`.
- `render.js` directly calls game methods such as `game.rotateLayer()` and `game.handleBoardCellClick()`.
- `main.js` owns many DOM ids and creates the app wiring.
- `story.js` must load after `dialogue.js` because it merges extra story scenes into `DIALOGUE_SCRIPT`.
- `package.json` check script hardcodes root file paths.
- `tools/*.js` likely assume root JS files and CommonJS execution.

## Most Likely Failure Points

| Risk | Why it can break | Safe answer |
|---|---|---|
| Moving JS files now | `index.html` and `package.json` paths are hardcoded | do not move runtime JS until a path migration pass |
| Converting to Vite now | code is global-script based, not import/export based | postpone; first define module boundaries |
| Splitting `game.js` too early | rules, UI, minimap, realtime, and rendering calls are interwoven | first extract pure helpers or data-only pieces |
| Splitting `render.js` too early | Three.js lifecycle, input picking, animation, fallback, tutorial visuals are interwoven | first isolate comments/sections and add smoke tests |
| Editing `style.css` broadly | 5000+ lines, many overlays and duplicated concepts | first create section index, then move CSS by screen |
| Moving `levels.js` data | tests and playtest scripts rely on level loading | only after all tools are path-aware |
| `.DS_Store` noise | creates confusing git status | add cleanup plan later, not during code organization |

## Vite Decision

Vite can be lighter and nicer for a future public web release because it gives:

- local dev server;
- module imports;
- asset hashing;
- cleaner deployment build;
- easier folder structure like `src/`, `assets/`, `public/`.

But Vite should **not** be the first cleanup step here.

Reason: this project currently depends on global script order and CDN-loaded Three.js. A Vite conversion would require rewriting script boundaries and imports, which is a real architecture migration, not a light folder cleanup.

Recommended timing:

```text
Now: clarify and stabilize current files
Next: split obvious non-logic modules
Later: path-safe folder move
Last: consider Vite if browser smoke and tests are stable
```

## Recommended Folder Target

Do not create this structure yet for runtime files. This is the target shape after safe migration:

```text
src/
  core/
    game-engine.js
    topology.js
    ai.js
    realtime.js
  render/
    render-engine.js
    camera.js
    picking.js
    effects.js
  ui/
    app.js
    screens.js
    settings.js
    tutorial-ui.js
    comms-ui.js
  data/
    levels.js
    dialogue.js
    story.js
    locales.js
  audio/
    audio-feedback.js
public/
  assets/
tools/
docs/
```

## Safe Step Plan

### Step A: Make A Code Section Index

No runtime behavior changes.

Actions:

1. Create an index for major sections inside `main.js`, `game.js`, `render.js`, and `style.css`.
2. Add no logic, or only comments if the user approves.
3. Keep all files in root.

Why: this gives a map before touching tangled code.

### Step B: Extract Low-Risk Data First

Potential low-risk targets:

- move dialogue/story/locale data into clearer sections or later `src/data/`;
- keep global exports exactly the same;
- update `index.html` and `package.json` together only in a dedicated path pass.

Do not start with `game.js` or `render.js`.

### Step C: Create Thin UI Helpers

Potential medium-risk targets:

- settings UI from `main.js`;
- archive/credits screens from `main.js`;
- tutorial UI helpers from `main.js`;
- DOM lookup registry from `main.js`.

Rule: each extraction must keep the same global API or be fully tested in browser.

### Step D: Split Core Only After Tests Are Strong

Potential high-risk targets:

- cube topology from `game.js`;
- AI movement from `game.js`;
- realtime mode from `game.js`;
- minimap drawing from `game.js`;
- picking/camera/tutorial effects from `render.js`.

Do this only after:

- `npm run check` passes;
- level audits pass;
- `npm run playtest` passes;
- browser smoke works on this machine or a manual smoke checklist is run.

## Proposed Next Pass

Pass 4 should be small:

1. Create `docs/00_index/CODE_SECTIONS.md`.
2. Build a section table for `main.js`, `game.js`, `render.js`, and `style.css`.
3. Do not edit code yet.
4. Run `git diff --check` and `npm run check`.

This gives you a readable map before any risky extraction.

## Recommendation To User

For your university application, the best story is not "I asked AI to rewrite everything." The stronger story is:

1. You identified that the project was growing risky.
2. You froze gameplay changes.
3. You created documentation, source-of-truth maps, and risk boundaries.
4. You planned refactoring in audited passes.
5. You preserved raw collaboration evidence.

That is a real engineering process.
