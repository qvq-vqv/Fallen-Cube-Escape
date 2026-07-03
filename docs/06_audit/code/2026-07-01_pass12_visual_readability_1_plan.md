# Pass 12 Visual Readability 1 Plan

> Time: 2026-07-01 02:47 CST  
> Executor: Codex / GPT-5  
> Goal: complete the first low-risk readability pass while the user sleeps.  
> Scope: no Blender assets, no large palette/material rewrite, no gameplay rule changes.

## Objective

Make the player, enemies, and player-side information hierarchy clearer without breaking the existing neon cube atmosphere.

The first pass focuses on head-space clutter:

- Remove enemy head CD labels.
- Keep player cooldown, but move it away from the player's head.
- Make player speech bubble avoid colliding with player cooldown and body.
- Preserve the current gameplay logic.

## Why This First

The user's family observed that player and enemies can look like partners. The user also noted that no more head labels should be added because existing CD labels already occupy that space.

Current issue:

- Player has a head CD label.
- Enemy also has a head CD label.
- Player can also have speech bubble above the same axis.
- These stacked elements make every character look like a similar "status-bearing unit".

## Time Estimate

| Step | Work | Estimated Time |
|---|---|---:|
| 1 | Write plan, lock safety boundary, update status | 10 min |
| 2 | Remove enemy head CD labels while preserving threat preview | 10-15 min |
| 3 | Convert player cooldown to foot/ring-only visual | 15-25 min |
| 4 | Reposition/resize player speech bubble to avoid overlap | 10-15 min |
| 5 | Self-QA L01/L03/L07 in browser | 20-30 min |
| 6 | Run checks and write report | 10-15 min |

Estimated total: 75-110 minutes.

## Implementation Plan

### Step 1: Enemy CD Removal

Keep enemy realtime movement logic and threat preview. Remove only the enemy label sprite/CD button above the monster.

Expected effect:

- Enemies no longer look like UI-controlled partners.
- Enemy danger is communicated by shape, color, and threat preview instead of friendly status buttons.

### Step 2: Player Cooldown Lowering

Keep player cooldown as a foot/ground ring around Dawn, not a head label.

Expected effect:

- Player still understands cooldown/action pacing.
- Head space is freed for speech bubble only.

### Step 3: Speech Bubble Offset

Move speech bubble slightly to the side and reduce vertical dominance.

Expected effect:

- Dawn body remains visible.
- Cooldown ring and speech bubble no longer stack in one column.

### Step 4: Self-QA

Test:

- L01: player only, first tutorial.
- L03: chaser present.
- L07: guardian present.

Check:

- no enemy head CD,
- player cooldown still visible,
- speech bubble does not cover cooldown/body,
- no console errors,
- `git diff --check`,
- `npm run check`.

## Deferred To Later

Not in this pass:

- Full object redesign.
- Blender asset import.
- Gizmo.
- Full start screen redesign.
- Full translation audit.
- Large material palette changes.

These should be separate passes after this low-risk cleanup.
