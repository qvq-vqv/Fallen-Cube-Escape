# Teacher Feedback V1 Design Flow

> Created: 2026-07-01 10:38 CST
> Owner: Codex / GPT-5
> Source: user + teacher notes from 2026-07-01
> Current git commit: e2fcf10
> Purpose: define the version scope before coding, so the playtester has real pass/fail standards.

## Version Goal

Teacher Feedback V1 is a polish-and-clarity version. Its job is not to add a new act or a large new mechanic. Its job is to make the current game feel easier to understand, more intentional, and less like an unfinished AI-generated prototype.

The version must answer six user-visible problems:

1. The landing tagline currently feels generic and product-mismatched.
2. Rotation needs a clearer low-friction helper, especially for laggy screen-share situations.
3. Tool use needs stronger mode feedback: cursor, toolbox state, selected tool identity.
4. The start screen has too many equal-weight buttons; primary and secondary actions need hierarchy.
5. Chinese/English text has inconsistent leftovers.
6. Character/object readability still has gaps, especially player vs enemy and object vs board.

## Non-Goals

This version will not:

- Import Blender models unless the user explicitly provides assets.
- Rewrite core puzzle rules.
- Redesign all levels.
- Add new story chapters.
- Build the Designer Journey journal; the user said this is their own work.
- Implement a full accessibility settings panel beyond what this version needs.

## Pass Order

### Pass A: Landing Message And Menu Hierarchy

Objective:

- Replace the generic one-sentence tagline with a product-fitting sentence.
- Keep the first three main choices visible: Start Escape, Level Select, Archive Matrix.
- Demote Settings and Credits into smaller icon actions that expand on hover/focus.
- Make Start Escape feel like the primary dramatic action, not just another rectangular button.

Acceptance:

- The first viewport clearly communicates the brand/game identity without a generic AI tagline.
- Start Escape is visually primary.
- Level Select and Archive Matrix remain easy to find.
- Settings and Credits are visible but not equal priority.
- Hover/focus expansion works with mouse and keyboard.
- No text overlap on desktop or mobile widths.

### Pass B: Tool Mode Feedback

Objective:

- When a tool is selected, the game should clearly show the active mode.
- Cursor or cursor-adjacent hint changes for move, rotate, patch, break, beacon.
- Toolbox remains visibly open/active while using a tool.
- Closing the toolbox returns to normal movement mode.

Acceptance:

- User can tell the current mode without reading a long instruction.
- Selected tool has a persistent visual active state.
- Cursor feedback never blocks clicking the board.
- Escape/cancel/close returns to normal move mode.
- No stale cursor after switching levels or returning to menu.

### Pass C: Rotation Gizmo MVP

Objective:

- Add a lightweight helper for rotation orientation and control.
- It should help players know which face/axis they are manipulating.
- It must be useful when drag rotation feels bad or screen-sharing is laggy.

Recommended MVP:

- A compact 2D corner orientation widget, not a fully loaded 3D gizmo.
- Show current cube orientation with labeled faces or axis colors.
- Provide small rotate buttons for X/Y/Z or current selected layer if feasible.
- Do not place keys, doors, enemies, or Dawn on the gizmo in V1. That would turn it into a minimap and make the scope explode.

Acceptance:

- Gizmo does not cover the game board or Dawn chat.
- Gizmo explains orientation better than the current UI alone.
- It can be hidden or minimized.
- It does not change puzzle logic or rotation mapping.
- It works on a laggy screen share as a click-based alternative or orientation aid.

### Pass D: Tutorial Highlight Model

Objective:

- Replace fragile 2D spotlight holes with direct target highlighting.
- Keep other areas dimmed if useful, but do not rely on a circular hole that drifts away from 3D targets.

Acceptance:

- Map/cell tutorials highlight actual 3D targets.
- UI tutorials highlight DOM controls.
- No tutorial step shows a halo that points at the wrong cube area.
- L01-L04 and L07 tutorial steps are checked.
- Strong tutorial popups remain mandatory where the tutorial requires them.

### Pass E: Visual Readability 2

Objective:

- Improve player/enemy/object distinguishability without destroying the neon cube atmosphere.

Scope:

- Player vs enemy silhouette/material contrast.
- Enemy danger read through shape/color/motion, not head labels.
- Key/door/tool objects should stand out from the board.
- Avoid large hue/material rewrites until the user approves.

Acceptance:

- A first-time viewer can identify Dawn, an enemy, a key, and an exit within a few seconds in L01/L03/L14/L16.
- Enemies no longer look like collaborators.
- Objects do not blend into board panels in screenshots.

### Pass F: Translation Audit

Objective:

- Find and fix obvious mixed-language or untranslated UI strings.
- Focus on visible UI and tutorial text first.

Acceptance:

- Main menu, settings, credits, level select, inspect screen, tutorial UI, pause UI, tool UI, and common system messages respect the selected language.
- No obvious English-only string appears in Chinese mode unless it is a brand/style token.
- No obvious Chinese-only string appears in English mode except the Chinese title/brand.
- `[object Object]` never appears.

## Suggested Build Sequence

1. Write this design flow and tester standard.
2. Ask Gemini / Super Playtester to ACK the standard.
3. Implement Pass A and Pass B together if small; otherwise split them.
4. Run command checks.
5. Run Gemini visual test using the standard.
6. Implement Pass C only after A/B are stable.
7. Implement Pass D, then have Gemini do a tutorial-specific visual pass.
8. Implement Pass E/F as separate safe passes.

## Definition Of Done For This Version

Teacher Feedback V1 is done only when:

- Pass A-F each has a report.
- `git diff --check` passes.
- `npm run check` passes.
- `npm run playtest` passes, or any warning is explicitly documented as pre-existing/non-blocking.
- Gemini test report is `SUCCESS`.
- Codex manually audits the Gemini report, screenshots, task id, and status lifecycle.
- `CODEX_LIVE_STATUS.md` and `agents_hub/CODEX_BOARD.md` are updated.
