# Pass 11 Tutorial Highlight And Teacher Notes Triage

> Time: 2026-07-01 02:26 CST  
> Executor: Codex / GPT-5  
> Scope: requirement triage only. No runtime logic changed.  
> Trigger: User reported that some tutorial halos are misaligned and asked whether the curtain/spotlight should be removed in favor of direct object highlighting. User also provided teacher class notes and asked Codex to understand them and ask clarifying questions.

## Tutorial Highlight Finding

The user is right: the current 2D curtain/spotlight system is fragile in a 3D cube scene.

Current systems:

- `#tutorial-blackout` / `.tutorial-blackout`: a 2D radial mask controlled by percentage values such as `focus: { x, y }`.
- `render.showTutorialPointer(...)`: a real 3D pointer/ring tied to a cube cell.
- `.tutorial-target`: UI button highlight for DOM controls.

The risky part is the 2D percentage mask. It does not know the current 3D camera angle, cube orientation, or projected target position, so it can drift away from the actual target. This matches the user's screenshot.

## Remaining Risky Tutorial Steps

Steps still using manual `focus` values:

- L01 step 1: look tutorial, `focus: 50,46`, `focusCell: 1,1,1`.
- L01 step 2: exit/door dialogue, `focus: 52,42`, `focusCell: 0,2,1`.
- L01 step 3: zoom tutorial, `focus: 50,46`, `focusCell: 1,1,1`.
- L01 step 4: first move, `focus: 50,43`, `focusCell/targetCell: 1,0,1`.
- L02 step 1: key/door dialogue, `focus: 48,42`, `focusCell: 4,1,0`.
- L03 step 1: enemy warning, `focus: 52,40`, `focusCell: 0,0,1`.
- L04 step 4: twist tutorial, `focus: 50,40`, `focusCell: 4,1,1`.
- L07 step 1: guardian warning, `focus: 50,40`, `focusCell: 4,1,2`.

Safer tool tutorials:

- L07 tool steps use `targetCell`.
- L13 patch tutorial uses `targetCell`.
- L23 beacon tutorial uses `targetCell`.

## Recommended Direction

Replace the "curtain spotlight" mental model with:

1. Uniform dimming of non-target areas, not a circular 2D hole.
2. Direct 3D highlight on the target tile/object/tool.
3. UI button highlights for UI controls.
4. Optional text/card arrow, but avoid pretending a 2D circle can accurately point at 3D geometry.

Practical implementation:

- Remove or heavily reduce the `tutorial-blackout` radial spotlight for map/cell tutorials.
- Keep a subtle full-screen dim if needed.
- Make target cells/objects brighter through the existing 3D ring, arrow, fill plane, token glow, or object outline.
- For camera look/zoom tutorial, use center-screen gesture only, not target-cell spotlight.

## Teacher Notes: Interpreted Requirements

### Title One-Sentence Intro

Likely means the project needs a concise one-line title/tagline explaining the game immediately.

### Gizmo Assisted Rotation

Likely means adding a visible rotation helper/control for players whose device cannot render well, whose computer lags, or who dislike drag rotation.

### Tool Cursor Changes

When a tool is selected, the mouse cursor should visually match the tool: route, patch, beacon, break, rotate, etc.

### Toolbox Open State

When using a tool, the toolbox should remain open/active. When closed, interaction returns to normal route/move mode.

### Start Screen Too Many Buttons

The landing screen has too many visible choices. "Start Escape" also feels too plain and should be redesigned to feel more like the game's first meaningful action.

### Translation Issues

There are likely inconsistent English/Chinese strings, awkward translations, or mixed speaker identity issues.

### Designer Journey

For college application material, create a weekly design journal: half page to one page per week, recording what changed, what was discovered, what prompts mattered, and what was learned.

## Open Questions

1. Should Pass 11 first remove the 2D curtain/spotlight from all map/cell tutorials, or only from the steps where QA sees obvious misalignment?
2. For target highlighting, should the visual style be "bright neon game object" or "clean academic/portfolio clarity"?
3. Should the new one-sentence title be player-facing on the start screen, or portfolio-facing for the university application write-up?
4. Should the Gizmo be a visible on-cube 3D rotation control, a 2D corner compass, or simple buttons/sliders for low-performance mode?
5. Should tool cursors be custom CSS cursors, small cursor-following labels, or both?
6. Should the landing screen be simplified now, or after tutorial/highlight work is stable?
7. Should Designer Journey entries start retroactively from existing docs/chats, or only from this week forward?
