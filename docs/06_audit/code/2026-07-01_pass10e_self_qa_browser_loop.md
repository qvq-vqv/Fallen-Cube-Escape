# Pass 10E Self-QA Browser Loop

> Time: 2026-07-01 01:43-01:50 CST  
> Executor: Codex / GPT-5  
> Scope: self-QA only. No runtime code changed in this pass.  
> Trigger: User asked Codex to complete the refresh/test loop first because repeated manual page refreshes are inconvenient.

## What Was Tested

Started a temporary local static server:

- `python3 -m http.server 4173`
- Opened `http://127.0.0.1:4173/index.html` in the in-app browser.
- Closed the local server after testing.

Browser flow:

1. Loaded the page.
2. Confirmed the prologue overlay was active.
3. Clicked `SKIP` to close prologue.
4. Clicked `开始逃亡`.
5. Entered L01.
6. Confirmed the first Dawn tutorial step appeared in the Dawn chat window.
7. Confirmed the system tutorial console stayed hidden for the Dawn step.
8. Confirmed tutorial blackout/highlight was active.
9. Confirmed the Dawn floating bubble red badge was visible.
10. Dragged the Dawn floating bubble once and confirmed the Dawn chat window repositioned with it.
11. Captured a screenshot through the in-app browser.
12. Checked browser console warnings/errors.

## Observed State

Runtime state after entering L01:

- Dawn tutorial visible: yes.
- System console hidden for Dawn step: yes.
- Tutorial blackout active: yes.
- Red badge visible: yes.
- Chat window stayed onscreen: yes.
- Chat anchor tracked bubble center: yes.
- Browser console warnings/errors: none.

Measured viewport during QA:

- Viewport: `1280 x 720`
- Dawn chat window: onscreen.
- Dawn bubble: onscreen.
- Chat anchor variable aligned with bubble center.

## Notes

The first automated drag attempt did not move the bubble, likely because the drag path was too short/fast for the page pointer handler. A second, more granular drag succeeded and changed both the floating bubble position and the attached chat window position.

I attempted an additional top-edge drag, but that path did not trigger movement, likely because the current chat window overlapped part of the path. The core attachment logic was still verified by successful drag and bounding-rect measurement.

## Follow-up Recommendation

The current result is good enough to hand back for one human visual pass, not repeated trial refreshes. If the user wants this to become even smoother later, the next improvement should be:

- make the chat window temporarily ignore pointer events while dragging the Dawn bubble, or
- move the chat window a little farther from the bubble during drag,

so extreme drags near the top edge are easier to perform manually.
