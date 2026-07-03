# Pass 10B Tutorial Guidance Routing Fix

> Time: 2026-07-01 01:20-01:32 CST  
> Executor: Codex / GPT-5  
> Scope: narrow UI routing fix. No level data, movement logic, enemy logic, rotation rules, or tutorial copy rewritten.  
> Trigger: User approved implementing the Pass 10A model: floating bubble red-dot notification, mandatory tutorial popup, highlight, and arrow/pointer guidance.

## Changed Files

- `main.js`
- `style.css`
- `CODEX_LIVE_STATUS.md`
- `agents_hub/CODEX_BOARD.md`
- `docs/00_index/CURRENT_PATHS.md`
- `docs/README.md`
- `docs/04_chats/raw/2026-06-30_structure_clarity_raw.md`

## Runtime Changes

### Dawn Floating Bubble

- The Dawn floating bubble now opens/closes `#dawn-chat-window`.
- It no longer toggles the old shared tutorial dialogue console.
- A separate `tutorialCommsNotice` flag keeps the red notification badge visible for active Dawn tutorial attention.
- Clicking the Dawn floating bubble clears its notice/unread state.

### System vs. Dawn Tutorial Routing

- System tutorial steps continue to render in the top/right `#tutorial-dialogue-console`.
- Dawn tutorial steps render through the Dawn chat window as visible mandatory tutorial messages.
- Dawn mandatory tutorial steps still show a red badge on the floating bubble.
- Dawn dialog steps use the existing `#dawn-chat-next-btn` to advance the tutorial.

### Mandatory Tutorial Target Guidance

- Map/cell guidance now uses `targetCellId` first, falling back to `focusCellId`.
- UI-control guidance uses `.tutorial-target` plus a new small floating arrow.
- The arrow points at controls such as the Dawn bubble, tool bubble, twist button, and ESC menu button when relevant.
- Existing 3D map pointer/highlight remains responsible for cube-cell guidance.

### Cleanup Paths

- Skipping or ending a tutorial clears:
  - System tutorial console
  - Dawn tutorial next button state
  - Dawn tutorial active styling
  - Floating tutorial red badge
  - UI target highlights
  - UI arrow
  - 3D tutorial pointer

## Verification

Passed:

- `git diff --check`
- `npm run check`
- `npm run audit:levels`
- `npm run playtest`

Browser smoke:

- `npm run smoke:browser` skipped because Playwright is not installed in this workspace.
- Used a temporary local static server on port `4173` and opened `http://127.0.0.1:4173/index.html` in the in-app browser.
- Page loaded key runtime scripts and core DOM nodes without console errors.
- The in-app browser could not open `file://` directly due browser security policy, so localhost was used instead.
- Limitation: the landing/start buttons did not advance the browser session into the game state during this quick smoke. This appears to be a current landing overlay interaction/state issue, not a syntax/runtime crash from this patch. Full visual QA should still be done manually from the normal working browser path.

## Follow-up QA Checklist

1. Reset tutorial visibility if needed through settings.
2. Start L01.
3. Confirm Dawn tutorial lines appear in the Dawn chat window with a red badge on the floating bubble.
4. Confirm System tutorial lines appear in the right/top system console.
5. Confirm map-related tutorial steps show the 3D cell pointer/highlight.
6. Confirm UI-control tutorial steps show button highlight plus the small arrow.
7. Confirm advancing/skipping clears arrows, badges, and highlights.
