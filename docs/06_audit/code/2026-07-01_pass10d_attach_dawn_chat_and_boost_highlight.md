# Pass 10D Attach Dawn Chat And Boost Tutorial Highlight

> Time: 2026-07-01 01:36-01:43 CST  
> Executor: Codex / GPT-5  
> Scope: narrow visual/UI patch. No level data, movement rules, enemy logic, rotation logic, or tutorial copy changed.  
> Trigger: User QA: the Dawn chat window should move with the floating bubble, and mandatory tutorials are still not highlighted enough.

## Changed Files

- `main.js`
- `style.css`
- `render.js`
- `CODEX_LIVE_STATUS.md`
- `agents_hub/CODEX_BOARD.md`
- `docs/00_index/CURRENT_PATHS.md`
- `docs/README.md`
- `docs/04_chats/raw/2026-06-30_structure_clarity_raw.md`

## Runtime Changes

### Dawn Chat Follows Floating Bubble

- Added `positionDawnChatWindow()` in `main.js`.
- The Dawn chat window is now positioned from `#comms-float-bubble.getBoundingClientRect()`.
- It defaults above the bubble and flips below when there is not enough top space.
- It clamps to the viewport so it should not run offscreen.
- It repositions when:
  - the chat opens,
  - the Dawn floating bubble is dragged,
  - the window resizes.

### Attached Chat Styling

- `#dawn-chat-window` is now a fixed-position floating panel.
- Added a small paper-style pointer tail aimed at the bubble.
- The pointer tail flips when the chat window is below the bubble.

### Stronger Tutorial Highlight

- Increased tutorial blackout contrast.
- Added a brighter spotlight ring around the focus area.
- Added subtle spotlight breathing.
- Strengthened `.tutorial-target` outlines, glow, and pulse for UI targets.
- Increased the UI arrow glow and visibility.
- Increased 3D tutorial pointer size and opacity in `render.js`.
- Increased 3D tutorial cell ring and tile highlight opacity.

## Verification

Passed:

- `git diff --check`
- `npm run check`
- `npm run playtest`

Known existing playtest warnings:

- L32 and L33 still report `too-short-for-act-2`, which existed before this pass and is unrelated to the visual tutorial patch.

## Manual QA Focus

1. Drag the Dawn floating bubble while the Dawn chat window is open.
2. Confirm the chat window follows the bubble and stays onscreen.
3. Move the bubble near top/bottom edges and confirm the chat flips position sensibly.
4. Start L01 tutorial and confirm the spotlight is visibly stronger.
5. Confirm map/cell pointer is brighter and easier to see.
6. Confirm UI-target arrows and outlines are obvious but not permanently stuck after advancing/skipping.
