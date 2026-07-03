# 2026-07-01 Runtime Waste Audit

## Metadata

- Author: Codex
- Time: 2026-07-01 CST
- Scope: read-only runtime / CPU / GPU / development-tool waste audit
- Gameplay logic changed: no
- Test harness changed separately: yes, documented in `docs/06_audit/test/2026-07-01_test_harness_repair_report.md`

## Summary

The project does not look "small and idle" at runtime. Even at 112 MB on disk, it can keep several animation systems active:

- one WebGL render loop
- one phone waveform canvas loop
- one LED mascot canvas loop
- many CSS blur / glow / filter effects
- several short-lived Three.js animation loops

The most likely player-facing performance cost is GPU pressure from WebGL plus CSS blur/glow, especially during screen sharing. The most likely development-only performance cost was unreliable test tooling that could wait forever, run wrong tests, or launch Chrome unnecessarily. The development-tool side is now partially repaired.

## Findings

### P1: Phone Wave Canvas Runs Forever

Location:

- `main.js:823`
- `main.js:3180`

Type:

- CPU / canvas draw loop

Impact:

- Affects players.
- More visible on low-power machines or screen sharing.

Evidence:

- `startPhoneWaveLoop()` calls `drawVoiceWave(...)` and then immediately schedules another `requestAnimationFrame`.
- It starts unconditionally during boot.
- It does not check whether the phone UI is visible, minimized, hidden behind overlays, or relevant to the current screen.

Why this matters:

- The voice wave canvas can redraw every frame even when the player is on landing, setup, pause, or when the phone is not meaningful.

Recommendation:

- Add a visibility gate:
  - run at full rate only when the phone panel is visible or talking
  - otherwise update at a low interval or pause
- Store the animation frame id so it can be canceled if needed.

Risk to fix:

- Low to medium. It is UI-only, but should be tested for audio/phone feedback.

### P1: LED Tutorial Mascot Canvas Runs Forever

Location:

- `main.js:2852`
- `main.js:3181`

Type:

- CPU / canvas draw loop

Impact:

- Affects players.

Evidence:

- `startLedMascotLoop()` calls `renderLedMascotFrame(...)` every animation frame.
- It starts unconditionally during boot.
- The mascot is only needed when the system tutorial console exists and is visible.

Why this matters:

- It is probably cheap per frame, but it is pure waste when no tutorial dialogue is visible.

Recommendation:

- Gate the loop by tutorial visibility.
- Render a static frame when hidden.
- Resume only while `#tutorial-dialogue-console` is visible.

Risk to fix:

- Low. Visual-only if done carefully.

### P1: WebGL Main Render Loop Keeps Running In Menus

Location:

- `render.js:3738`

Type:

- GPU / CPU render loop

Impact:

- Affects players and demos.

Evidence:

- `animate()` always schedules the next animation frame.
- It throttles only when `document.hidden`, not when the game is on landing, setup, pause, archive, or static overlays.
- In presentation mode it also updates landing/presentation camera effects.

Why this matters:

- This keeps WebGL active even on non-game screens.
- During Tencent Meeting / screen sharing, WebGL plus capture can be much more expensive than local play.

Recommendation:

- Add a performance mode or dynamic throttle:
  - full rate during active gameplay, camera movement, animation, or tutorial highlight
  - lower rate on landing/setup/static overlays
  - optional "low power / screen-share mode" in settings

Risk to fix:

- Medium. It touches render cadence and needs visual QA.

### P2: Per-frame Cube Edge Updates Are Nontrivial

Location:

- `render.js:3891`

Type:

- GPU material updates / CPU per-cublet loop

Impact:

- Affects players.

Evidence:

- `updateCubeLaserEdges()` runs from the render loop.
- It skips every other frame, which is good.
- It still loops cublets and updates material uniforms/color/opacity.

Why this matters:

- This is part of the visual identity, but it contributes to constant GPU/CPU work.

Recommendation:

- In low-power mode, update every 4th or 6th frame.
- Consider disabling laser edge pulsing when the cube is not being inspected or played.

Risk to fix:

- Medium-low. Visual feel changes, but gameplay is unaffected.

### P2: CSS Blur, Backdrop Filter, Glow, and Drop Shadow Are Heavy

Location examples:

- `style.css:384`
- `style.css:628`
- `style.css:775`
- `style.css:1075`
- `style.css:4358`
- `style.css:4537`
- `style.css:4974`
- `style.css:5067`

Type:

- GPU compositing / paint

Impact:

- Affects players, especially screen sharing.

Evidence:

- Many major overlays and floating UI elements use `backdrop-filter`, large `box-shadow`, `filter: drop-shadow`, and glow effects.
- Several full-screen or large panels blur content behind them.

Why this matters:

- These effects are expensive on integrated GPUs and can become much worse when screen capture is active.

Recommendation:

- Add a `.low-power` or `.screen-share-mode` class.
- In that mode:
  - reduce or remove `backdrop-filter`
  - replace large glows with borders or flat shadows
  - reduce animated filter effects
  - keep identity colors but lower compositing cost

Risk to fix:

- Low to medium. It is styling only, but visual QA matters.

### P2: Several Short-lived Three.js Animations Allocate Objects

Location examples:

- `render.js:3464`
- `render.js:3504`
- `render.js:3515`
- `render.js:3533`

Type:

- CPU / GC churn

Impact:

- Affects players during movement, pulse effects, or repeated interactions.

Evidence:

- `spawnCellPulse()` creates new ring geometry/material/mesh for each pulse and disposes them at the end.
- `interpolateMeshPosition()` creates `Vector3` objects inside animation flow, including per-frame `new THREE.Vector3().lerpVectors(...)`.

Why this matters:

- These are short-lived and usually fine, but repeated fast interactions can increase garbage collection.

Recommendation:

- Reuse scratch vectors in movement interpolation.
- Pool pulse meshes if pulse effects become frequent.

Risk to fix:

- Medium. Rendering code is delicate; do after tests are reliable.

### P2: Test Worker Previously Had a 100ms Browser-side Polling Loop

Location:

- `tools/playtest_worker.js`

Type:

- Development-only CPU waste

Impact:

- Affects development/testing only.

Status:

- Fixed in this pass.

What changed:

- Removed the 100ms interval used to repeatedly force tool buttons visible.
- Replaced it with deterministic setup immediately before the tested interaction.

### P3: Test Artifacts Are Growing But Not Yet Huge

Location:

- `test_runs/`

Type:

- Disk / project clutter

Impact:

- Development only.

Evidence:

- Current `test_runs/` is about 4.8 MB with 18 files.
- Whole project is about 112 MB.
- `node_modules/` is about 18 MB.

Why this matters:

- Not the main source of CPU lag.
- Could become a clutter problem if screenshots keep accumulating.

Recommendation:

- Later add `test_runs/archive/` or per-task subfolders.
- Keep latest evidence for active work, archive older reports.

Risk to fix:

- Low, but avoid deleting files because the project uses history for portfolio evidence.

## Recommended Next Fixes

1. Add a low-power / screen-share mode.
   - First target CSS blur/glow reductions.
   - Lowest risk, likely high benefit during Tencent Meeting.

2. Gate the two UI canvas loops.
   - Pause phone waveform when hidden and not talking.
   - Pause LED mascot when tutorial dialogue is hidden.

3. Add render loop throttling for non-game screens.
   - Keep landing animated, but lower frame rate when no interaction is happening.

4. Optimize obvious per-frame allocations in movement interpolation.
   - Use scratch vectors after test coverage is stable.

5. Continue replacing test hacks with deterministic setup.
   - The testing side is now safer, but still uses controlled JS setup for A/B tool mode.

## What I Would Not Do First

- Do not rewrite the whole renderer yet.
- Do not replace Three.js.
- Do not remove the visual identity wholesale.
- Do not optimize level logic before profiling the render/UI layer.

## Bottom Line

The likely "computer gets hot / meeting demo gets laggy" source is not one single huge file. It is the combined cost of:

- always-on WebGL rendering
- always-on UI canvas loops
- heavy CSS blur/glow compositing
- screen sharing overhead

The safest next implementation pass is a low-power mode plus pausing hidden UI loops.
