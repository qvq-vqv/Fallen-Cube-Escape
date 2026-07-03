# Pass 10F Drag Handoff Polish

> Time: 2026-07-01 01:51-01:59 CST  
> Executor: Codex / GPT-5  
> Scope: narrow UI drag polish. No gameplay logic, level data, tutorial text, enemy logic, or rotation logic changed.  
> Trigger: continue self-completion after Pass 10E; polish a self-QA finding where an extreme drag path could leave the Dawn chat window in a temporary following state.

## Runtime Changes

### Drag Handoff Cleanup

- Added `setDawnChatFollowingBubble(active)`.
- Added `cleanupDawnBubbleDragState()`.
- Dawn chat now receives `.is-following-bubble` while the Dawn floating bubble is being dragged.
- The following state is cleared on:
  - the bubble's own `pointerup`,
  - `pointercancel`,
  - global `window.pointerup`,
  - global `window.pointercancel`,
  - `window.blur`,
  - closing the Dawn chat window.

### Pointer Interception Fix

- `.dawn-chat-window.is-following-bubble` now uses `pointer-events: none`.
- This prevents the attached chat panel from intercepting pointer movement while the user is dragging the Dawn floating bubble behind/near it.
- Opacity is slightly reduced while following so the player gets a subtle visual cue that the panel is temporarily attached to the drag.

## Self-QA

Started a temporary local static server on port `4173`, then closed it after testing.

Browser flow:

1. Opened localhost page.
2. Skipped prologue.
3. Started L01.
4. Confirmed tutorial state:
   - tutorial blackout active,
   - Dawn chat visible,
   - System console hidden for Dawn step,
   - Dawn red badge visible.
5. Dragged the Dawn floating bubble.
6. Confirmed:
   - a short drag path did not move the bubble but also did not leave stale state,
   - a longer granular drag path moved the bubble,
   - Dawn chat followed the bubble,
   - Dawn chat stayed onscreen,
   - the chat anchor still tracked the bubble center,
   - `.is-following-bubble` was cleared after drag.
7. Checked browser console warnings/errors: none.

## Verification

Passed:

- `git diff --check`
- `npm run check`

Manual/browser self-QA: passed for the drag handoff case described above.
