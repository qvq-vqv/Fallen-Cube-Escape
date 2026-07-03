# Pass 10 Tutorial Routing Gap Audit

> Time: 2026-07-01 01:00 CST  
> Executor: Codex / GPT-5  
> Scope: read-only investigation of the latest tutorial requirement trace. No game logic changed in this pass.  
> Trigger: User reported that the latest tutorial requirement may be missing: story/tutorial messages should split between System and Dawn, with different UI positions.

## Summary

The user is correct: the project contains evidence that System AI and Dawn should be separated, and the current code only finished the classification part. It did not finish the physical UI routing.

Current state:

- System and Dawn tutorial steps are detected differently in `main.js`.
- `index.html` already contains separate UI surfaces: the top tutorial console and the Dawn chat window/floating chat entry.
- But tutorial messages still render through the same top tutorial console.
- Dawn tutorial messages are not routed into the Dawn chat window as first-class chat messages.

This is an unfinished task, not a new feature request.

## Evidence Found

### Task Trace

`task.md` contains a completed-looking item:

- `M11.5.2.1 JS: Restructure System AI vs. Dawn message routing check (isSystemStep) in main.js`

This matches the current code: `isSystemStep` exists, but it only controls some side effects. It does not fully split display routing.

### Design Trace

`docs/03_design/core/DESIGN_BRIEF.md` contains multiple requirements that support the user's memory:

- The protagonist communication should split into persistent small-window communication and a detail/chat layer.
- The protagonist should have a persistent communication slot that does not block the map.
- Movement, key pickup, rotation, portal, enemy-near, victory, and failure can trigger short protagonist reactions.
- Protagonist lines should sound like a person, not like system status.

`agents_hub/PROJECT_CEO_INSTRUCTIONS.md` also separates Dawn from the "customer service AI" style tutorial/system explanation.

### Code Trace

Current runtime surfaces:

- `index.html` has `#tutorial-dialogue-console`, currently used as the top tutorial message console.
- `index.html` has `#dawn-chat-window` and `#comms-float-bubble`, which are the Dawn chat surface/entry.
- `style.css` has `.tutorial-dialogue-console.is-system` and `.tutorial-dialogue-console.is-dawn`, but both are still variants of the same panel.
- `main.js` has `isSystemStep`, and it changes some behavior for system vs. non-system tutorial steps.
- `main.js` still calls the same tutorial dialogue renderer for both System and Dawn tutorial steps.
- `appendDawnMessage(...)` exists, but tutorial Dawn steps are not currently routed through it.

## Unfinished Items

1. System tutorial messages and Dawn tutorial messages are not physically separated.
2. Dawn tutorial messages do not become Dawn chat messages.
3. The top tutorial console still acts as a shared surface for both System and Dawn.
4. The task checkbox overstates completion: the routing check exists, but the routing destination is incomplete.
5. I did not find a complete earlier raw conversation that states this latest requirement verbatim. I did find enough design/task evidence to confirm the intended split.

## Safest Next Fix Boundary

Recommended next pass: `PASS_10A_TUTORIAL_ROUTING_FIX`.

Keep the patch narrow:

- Do not rewrite tutorial text.
- Do not change level data.
- Do not change movement, enemy, rotation, portal, or A* logic.
- Keep strong tutorial gating exactly as it is.
- Route System steps to the top tutorial console.
- Route Dawn steps to the Dawn chat surface and protagonist short bubble.

Open choice before implementation:

- Option A: During mandatory tutorial steps, auto-open the Dawn chat window when Dawn speaks.
- Option B: Do not auto-open; only highlight the chat floating bubble and show a short Dawn bubble.

My recommendation is Option A for mandatory tutorial steps, because the user needs to read the instruction without hunting for the chat entry. For optional/reactive Dawn comments later, use Option B to avoid interrupting gameplay.
