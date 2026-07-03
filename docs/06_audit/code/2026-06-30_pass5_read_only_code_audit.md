# Pass 5 Read-Only Code Audit

> Date: 2026-06-30 23:48 CST
> Authoring agent: Codex / GPT-5
> Scope: read-only full code audit. No runtime logic was modified.
> Safety boundary: identify and rank issues first; repair work requires a later approved pass.

## Executive Summary

No P0 syntax crash was found by automated checks.

Two P1 browser-path runtime crashes were found by static audit:

1. L03 browser cutscene calls missing `game.encodeCell(...)`.
2. "Reset tutorials" settings action calls missing `render.initLevelVisuals()`.

These are exactly the kind of issues that can survive `npm run check` and solver playtests because they require specific browser UI paths.

## Automated Checks

| Check | Result | Notes |
|---|---|---|
| `npm run check` | PASS | syntax checks passed |
| `npm run audit:design` | PASS | 40 levels, metadata OK |
| `npm run audit:levels` | PASS | all levels reported solvable; output is very large |
| `npm run audit:quality` | PASS with info | 0 issues, 0 warnings, 2 info notes |
| `npm run playtest` | PASS | all L01-L40 solved |
| `npm run smoke:browser` | SKIPPED | Playwright is not installed |

Quality info notes:

- L32: bot turns 3, below suggested target 5.
- L33: bot turns 3, below suggested target 5.

Playtest design note:

- L10 reports `break-present-unused`; the break tool exists but a route solution also works.

## P0 Findings

No P0 issue found in this read-only pass.

## P1 Findings

### P1-1 L03 Browser Cutscene Calls Missing `game.encodeCell`

Evidence:

- `main.js:1861` calls `game.encodeCell({ face: 0, row: 1, col: 0 })`.
- `main.js:1873` calls `game.encodeCell({ face: 0, row: 0, col: 0 })`.
- Static method cross-check found no `encodeCell` method on `GameEngine`.

Risk:

- Starting L03 in the browser can throw a TypeError when the delayed cutscene reaches that line.
- Solver tools do not catch this because they do not execute the browser cutscene path.

Suggested repair:

- Replace with the existing coordinate path, likely `game.resolveCoord({ face, row, col })` or `game.cellId(face, row, col)`, after confirming face/row/col semantics.
- Add a browser smoke step that starts L03 and waits long enough for the cutscene.

### P1-2 Reset Tutorials Calls Missing `render.initLevelVisuals`

Evidence:

- `main.js:2192-2197` reinitializes the current tutorial level and then calls `render.initLevelVisuals()`.
- Static method cross-check found no `initLevelVisuals` method on `RenderEngine`.

Risk:

- In Settings, clicking "reset tutorials" while a tutorial level is active can throw a TypeError.
- This is a player-facing settings path, not covered by current solver tests.

Suggested repair:

- Either add a real `RenderEngine.initLevelVisuals()` wrapper, or replace the call with the correct existing sequence such as `render.buildCube3D()`, `render.spawnEntities3D()`, and tutorial focus refresh.
- Add smoke coverage for Settings -> reset tutorials during L01/L02.

## P2 Findings

### P2-1 Act 1 Runtime Mode Conflicts With Task Spec

Evidence:

- `main.js:1818` unconditionally calls `game.setRealtimeMode?.(true)`.
- `main.js:1826` then calls `game.startRealtime?.()`.
- `task.md:91-100` says Act 1 should be pure turn-based and Act 2 should be realtime CD.

Risk:

- Even though `game.js:1537-1543` prevents timer-based enemy movement before L13, `realtimeMode` still changes player movement, wait behavior, cooldowns, and undo/realtime snapshot semantics.
- This can blur the core identity if the intended game is a tactical puzzle/chess-like experience.

Suggested decision:

- Decide whether current root `task.md` is still binding.
- If yes, start realtime only for `level.act >= 2` or `currentLevelIndex >= 12`.
- If no, update the task/design docs so future agents do not "fix" this back and forth.

### P2-2 Browser Smoke Test Exists But Is Not Actually Active

Evidence:

- `npm run smoke:browser` returned `skipped: true`.
- Reason: Playwright is not installed in this workspace.
- `tools/browser-smoke.js:36-43` intentionally skips when Playwright cannot be required.

Risk:

- Browser-only regressions can pass all current automated checks.
- The two P1 issues above are both browser-path issues.

Suggested repair:

- Add Playwright as a dev dependency, or create a lighter browser smoke path that works in this environment.
- Minimum smoke should cover: start L01, start L03 and wait for cutscene, open settings, reset tutorials, toggle language, return to level book.

### P2-3 Explicit Style Rule Violation: `transition: all`

Evidence:

- `style.css:4705` has `transition: all var(--motion-fast) var(--ease-decisive);`.
- Project CEO instructions explicitly forbid `transition: all`.

Risk:

- Unintended properties can animate, causing visual jank and harder-to-debug UI behavior.
- This also violates the project's own UI review contract.

Suggested repair:

- Replace with specific properties, likely `border-color`, `background-color`, `box-shadow`, and `transform`.

### P2-4 Dawn/E-7 Naming Still Conflicts In Player-Facing Places

Evidence:

- `index.html:34` title still says `E-7: Cube Pursuit`.
- `index.html:324-326` comment/ARIA label still says E-7 phone.
- `main.js:306-308` archive entry title is `E-7`.
- `main.js:816` loading text says `ESTABLISHING D-LINK TO E-7`.
- `story.js:21-24` defines Dawn as current name but also says E-7 is a machine label.

Risk:

- If E-7 is now intentionally only an in-world machine label, it needs to be framed consistently.
- If Dawn is supposed to fully replace E-7, these are stale player-facing remnants.

Suggested decision:

- Choose one of two policies:
  - Dawn-only public identity; move E-7 to historical docs.
  - Dawn is her name, E-7 is an in-world label; update all UI copy to explain that consistently.

### P2-5 Gemini API Key Is Stored Client-Side And Sent In Query String

Evidence:

- `main.js:2938` reads `GEMINI_API_KEY` from `localStorage`.
- `main.js:2957` stores the key in `localStorage`.
- `main.js:3074` sends the key in the request URL query string.

Risk:

- This is acceptable only for a local prototype where the player knowingly enters their own key.
- It is not safe for a public release or school demo without very clear boundaries.

Suggested repair:

- For public release, remove direct key entry or route AI chat through a controlled backend/proxy.
- If kept as a prototype-only dev feature, hide it behind dev mode and label it clearly.

## P3 Findings

### P3-1 Report Scripts Can Recreate Root-Level Docs

Evidence:

- `package.json:13` writes difficulty report to root `difficulty_report.md`.
- `package.json:14` writes walkthrough to root `walkthrough.md`.
- Docs organization moved most generated reports under `docs/05_reports/`.

Risk:

- Running report scripts can recreate the clutter that the docs organization pass just cleaned.
- `walkthrough.md` is currently a root source-of-truth, but `difficulty_report.md` is not.

Suggested repair:

- Either intentionally keep root `walkthrough.md` as current and document it, or redirect generated outputs into `docs/05_reports/`.

### P3-2 Long-Running UI Animation Loops Are Not Cancellable

Evidence:

- `main.js:2612-2615` continuously schedules the LED mascot loop.
- `main.js:2894-2897` starts phone wave, LED mascot, and phone clock interval.

Risk:

- In the current single-page app this is probably acceptable.
- If the app later gains route-level remounting, preview tabs, or multiple boot cycles, these loops can duplicate.

Suggested repair:

- Keep as low priority.
- If refactoring `main.js`, wrap UI loops in a small lifecycle manager.

### P3-3 Design Balance Notes From Tools

Evidence:

- `npm run audit:quality` info: L32 and L33 are below target turns.
- `npm run playtest` risk: L10 has `break-present-unused`.

Risk:

- Not a technical failure.
- Could matter for puzzle clarity if a "new tool exam" level can be solved without that tool.

Suggested repair:

- Review during level-design pass, not during engine cleanup.

## Recommended Repair Order

1. Fix P1-1 `game.encodeCell` in L03 cutscene.
2. Fix P1-2 `render.initLevelVisuals` reset-tutorial crash.
3. Activate browser smoke coverage so future browser-only regressions are caught.
4. Decide Act 1 realtime vs turn-based source of truth.
5. Fix `transition: all`.
6. Decide Dawn/E-7 naming policy.
7. Move/report script outputs intentionally.
8. Revisit Gemini API key handling before any public release.

## Files Not Modified

This pass did not modify runtime code.

Runtime files were read and audited only:

- `index.html`
- `main.js`
- `game.js`
- `render.js`
- `levels.js`
- `dialogue.js`
- `story.js`
- `locales.js`
- `audio.js`
- `style.css`
- `tools/*.js`
