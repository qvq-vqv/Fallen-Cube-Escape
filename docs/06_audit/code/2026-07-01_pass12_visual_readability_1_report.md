# Pass 12 Visual Readability 1 Report

> Time: 2026-07-01 02:47-03:01 CST  
> Executor: Codex / GPT-5  
> Status: complete, waiting for user visual QA  
> Scope: low-risk visual readability only

## User Request

The user asked for a complete plan with estimated time, then asked Codex to set a goal and finish the first safe pass while the user sleeps.

The latest clarified requirement was:

- Do not put labels above heads.
- Remove the old cooldown button/text above chasers/enemies because that mechanic is temporarily disabled.
- Keep the player cooldown signal, but solve the overlap between player body, player cooldown, and player speech.
- Prefer recognition by modeling/shape instead of labels.

## Planned Time

Estimated total: 75-110 minutes.

| Step | Estimate | Result |
|---|---:|---|
| Record plan/status | 10 min | Done |
| Remove enemy head cooldown text | 10-15 min | Done |
| Move player cooldown away from head | 15-25 min | Done |
| Reposition/scale player speech bubble | 10-15 min | Done |
| Browser self-QA on L01/L03/L07 | 20-30 min | Done |
| Final checks/report | 10-15 min | Done |

Actual focused time for this pass was shorter than the estimate because the affected code path was already isolated in `render.js`.

## Code Changes

Only `render.js` was changed for runtime behavior in this pass.

1. `attachRealtimeTimerVisual(...)` now supports `{ showLabel: false }`.
2. Player and AI realtime timer visuals now hide the text label sprite.
3. Player cooldown remains visible as a low foot ring instead of a head label.
4. AI/enemy cooldown text above the head is removed.
5. Player speech bubble moved slightly to the side/top and scaled down to reduce overlap with the player body and cooldown ring.
6. Speech bubble tail was moved to match the new offset bubble placement.

No level data, movement logic, enemy logic, rotation logic, tool logic, or tutorial copy was changed.

## Self-QA

Browser QA was run with a local server at `http://127.0.0.1:4173`.

Checked screens:

- L01: player cooldown is no longer a head label; speech bubble is offset instead of sitting directly on top of the player.
- L03: chaser/enemy no longer has the old `...` cooldown label above its head.
- L07: enemy head cooldown remains removed; player uses the foot cooldown ring; game screen renders normally.

Observed remaining issue:

- The tutorial spotlight/highlight system still has the previously reported 2D/3D alignment problem. This pass did not attempt to solve it. It should be the next visual/tutorial pass.

## Verification

Passed:

- `git diff --check`
- `npm run check`
- `npm run playtest`

`npm run playtest` completed L01-L40. Existing quality warnings remain for L32/L33 as `too-short-for-act-2`; those are not introduced by this pass.

## Next Recommended Pass

Pass 13 should handle the tutorial highlight model:

1. Reduce or remove 2D percentage-based map spotlight circles.
2. Use direct 3D object/cell highlighting for map targets.
3. Keep the rest of the scene dimmed without relying on a misaligned circular cutout.
4. Keep UI-element tutorials separate from 3D map tutorials.
