# Teacher Feedback V1 Test Standard

> Created: 2026-07-01 10:38 CST
> Sender: Codex
> Receiver: Gemini / Super Playtester
> Protocol: follow `.collaboration/CODEX_GEMINI_PROTOCOL_V2.md`

## Purpose

This is the pass/fail standard for the upcoming Teacher Feedback V1 polish version.

Do not judge it by general vibes. Judge it by the checklist below.

## Required Test Areas

### A. Landing Message And Menu Hierarchy

Pass if:

- The landing tagline no longer feels generic or unrelated to the product.
- Start Escape is clearly the primary action.
- Level Select and Archive Matrix remain visible as main actions.
- Settings and Credits are visually smaller secondary actions.
- Settings/Credits expand or become legible on hover/focus.
- No text overlaps on 1280x800 desktop and a narrow mobile-like viewport.

Fail if:

- The old generic tagline is still visible.
- All five buttons still compete equally.
- Any important menu text clips, overlaps, or becomes unreadable.

### B. Tool Mode Feedback

Pass if:

- Selecting route/move, rotate, patch, break, or beacon gives visible mode feedback.
- The cursor or cursor-adjacent indicator matches the active tool.
- Toolbox visibly remains active/open while a tool is selected.
- Closing/canceling the tool returns to normal movement.

Fail if:

- A selected tool is not visually obvious.
- Cursor feedback remains after the tool is canceled.
- The player can get stuck in an unintended tool mode.

### C. Rotation Gizmo MVP

Pass if:

- A compact rotation/orientation helper is visible when rotation is relevant.
- It helps identify cube orientation or available rotation axes/layers.
- It does not cover Dawn, the board, tutorial text, or the floating chat.
- It can be hidden/minimized or is small enough not to interfere.

Fail if:

- It becomes a confusing minimap.
- It shows keys/doors/Dawn/enemies in V1.
- It changes puzzle logic.
- It blocks clicks or overlaps key UI.

### D. Tutorial Highlight Model

Pass if:

- L01-L04 and L07 tutorial targets use reliable direct highlights.
- 3D map targets are highlighted on the actual object/cell.
- UI targets highlight the actual UI control.
- No circular spotlight appears obviously misaligned with the target.

Fail if:

- A tutorial halo points at the wrong place.
- A mandatory tutorial can be missed because it is not visually prominent.
- A highlight obscures the thing it is trying to teach.

### E. Visual Readability

Pass if:

- Dawn, enemies, key, exit, and important tools are distinguishable in screenshots.
- Enemies do not look like friendly partners.
- Objects do not blend into cube panels.

Fail if:

- A first-time viewer cannot identify player vs enemy quickly.
- Objects are only identifiable because of text labels.

### F. Translation Audit

Pass if:

- Chinese mode does not show accidental English UI strings, except brand/style tokens.
- English mode does not show accidental Chinese UI strings, except brand/title tokens.
- No `[object Object]` appears.
- Main menu, settings, credits, level select, inspect, pause, tutorial, and tool UI are covered.

Fail if:

- Any obvious untranslated UI string appears in the listed screens.
- Language switching creates duplicated or stale text.

## Evidence Required

The final Gemini report must include:

- `task_id`.
- `status`.
- `git_commit` or `git_commit_short`.
- `tested_url`.
- `tester_version`.
- Desktop screenshots.
- Narrow viewport screenshots for landing/menu checks.
- A checklist result for every section A-F.
- Explicit failures if any item is skipped.

Screenshots should be stored under `test_runs/<task_id>/` where possible.

## ACK Requirement

Before Codex starts implementing Teacher Feedback V1, Gemini should ACK this standard in:

`.collaboration/teacher_feedback_v1_ack.json`

with:

```json
{
  "status": "ACK",
  "agent": "Gemini / Super Playtester",
  "acknowledged_standard": "TEACHER_FEEDBACK_V1_TEST_STANDARD.md",
  "acknowledged_at": "<ISO timestamp>",
  "notes": "<concerns or suggested additions>"
}
```
