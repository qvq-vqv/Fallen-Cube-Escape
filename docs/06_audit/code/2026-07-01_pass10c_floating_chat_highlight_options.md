# Pass 10C Floating Chat And Tutorial Highlight Options

> Time: 2026-07-01 01:34 CST  
> Executor: Codex / GPT-5  
> Scope: research and planning only. No runtime code changed in this pass.  
> Trigger: User QA: Dawn chat window should move with the floating bubble, and mandatory tutorials are still not highlighted enough.

## User Feedback

- The Dawn chat window should be attached to the draggable Dawn floating bubble.
- Mandatory tutorials need stronger highlight.
- The user asked for online research before choosing a fix.

## Research Notes

- Floating UI documents the standard anchored tooltip pattern: compute position from a reference element, then use `flip`, `shift`, `offset`, and `arrow` middleware to keep the floating element attached and inside the viewport.
- MDN documents CSS Anchor Positioning, which can tether elements to anchor elements, but it should be treated as progressive enhancement for now because this project needs broad browser safety.
- Shepherd.js documents product-tour patterns that match this need: modal overlay, `attachTo`, arrows, highlight classes, extra highlighted elements, and optional disabling of target interaction.
- Intro.js exposes similar knobs: `highlightClass` and `disableInteraction`.
- Nielsen Norman Group recommends coach marks that are short, focused, visual, one-at-a-time, and clearly distinct from normal UI.

## Options

### Option A: Custom Small Patch

Recommended for the next implementation pass.

- Keep the current project architecture.
- Position `#dawn-chat-window` from `#comms-float-bubble.getBoundingClientRect()`.
- Reposition chat during bubble drag, window resize, and chat open.
- Add viewport clamping so the chat window never falls offscreen.
- Strengthen tutorial highlight with a real spotlight layer, thicker target ring, stronger arrow, and pulsing outline.

Pros: lowest risk, no new dependency, fits current non-bundled script setup.  
Cons: still custom code, less flexible than a full tour library.

### Option B: Floating UI Style Helper

- Add a small positioning helper modeled after Floating UI behavior.
- Use placement rules like `top-start`, `top-end`, `left`, `right`.
- Add automatic flip/shift behavior when the chat window would overflow.

Pros: robust positioning model.  
Cons: adding the real dependency is awkward without a bundler; reimplementing only a subset is safer for now.

### Option C: Shepherd/Intro-Style Tour Layer

- Build or import a formal tour system.
- Each tutorial step gets `attachTo`, `highlightClass`, `modalOverlayOpeningPadding`, arrow, and interaction rules.

Pros: strongest long-term tutorial architecture.  
Cons: bigger change; risky while the project still has a traditional multi-script setup.

### Option D: CSS Anchor Positioning Progressive Enhancement

- Use CSS `anchor-name` / `position-anchor` where supported.
- Keep JS positioning fallback for unsupported browsers.

Pros: clean future-facing CSS.  
Cons: not enough as the only solution for a public playable game.

## Recommendation

Do Option A next.

Implementation boundary:

- No level data changes.
- No movement/rotation/enemy logic changes.
- No tutorial copy rewrite.
- Fix only chat-window attachment and tutorial visual strength.

Suggested next pass name: `PASS_10D_ATTACH_DAWN_CHAT_AND_BOOST_TUTORIAL_HIGHLIGHT`.
