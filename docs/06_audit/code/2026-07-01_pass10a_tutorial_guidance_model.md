# Pass 10A Tutorial Guidance Model

> Time: 2026-07-01 01:05 CST  
> Executor: Codex / GPT-5  
> Scope: planning only. No game logic changed.  
> Trigger: User clarified that the floating bubble should show a red-dot notification, while mandatory tutorials must pop up, highlight, and point to the related skill/map target.

## Requirement Restatement

The tutorial system should separate three ideas:

1. Speaker identity: System and Dawn are different speakers.
2. Message availability: the Dawn floating bubble can show a red badge when there is a new message.
3. Mandatory guidance: tutorials must pop up automatically, highlight the target, and point the player to the related control, skill, or map area.

This means the floating bubble should not become the place where the player has to discover mandatory tutorial instructions.

## Current Assets Already Present

The project already has many needed pieces:

- `#comms-float-badge` for the red notification badge.
- `#tutorial-dialogue-console` for popup tutorial text.
- `#tutorial-blackout` for spotlight/highlight focus.
- `#tutorial-look-gesture` for camera/zoom tutorial gestures.
- `.tutorial-target` styling for highlighted UI controls.
- `render.showTutorialPointer(...)` for map/cell pointing.
- Tutorial step data in `levels.js` already contains fields like `focus`, `focusCell`, `targetCell`, `openComms`, and `openTools`.

The safer path is to connect these pieces through a small routing layer instead of redesigning the UI.

## Recommended Model

### 1. Notification Layer

Use only for optional or background Dawn messages:

- Dawn floating bubble shows a red badge.
- The badge can display `1`, `2`, `9+`, or a dot depending on final UI preference.
- Clicking the bubble opens the Dawn chat window.
- Mandatory tutorial steps should not require clicking this bubble.

### 2. Mandatory Tutorial Popup Layer

Use for strong tutorial steps:

- Automatically show a tutorial popup.
- Pause realtime action if the current system already does so.
- Show the speaker as either System or Dawn.
- Keep System wording instructional.
- Keep Dawn wording emotional/human.
- The popup can coexist with a Dawn badge, but the instruction itself must be visible immediately.

### 3. Target Guidance Layer

Every strong tutorial step should declare what it points at:

- `cell`: map tile/cube cell; use the existing render pointer and spotlight.
- `control`: UI button such as rotate/twist, ESC/menu, tools, chat.
- `tool`: toolbox item or skill.
- `gesture`: camera rotate or zoom gesture.
- `none`: pure story line, no arrow needed.

Implementation should prefer reusing current fields first:

- `targetCell` / `focusCell` for map guidance.
- `openTools` / `type: 'tool' | 'twist'` for tools guidance.
- `openComms` / Dawn speaker for communication guidance.
- `type: 'look' | 'zoom'` for gesture guidance.

If a step cannot be inferred safely, add a small explicit field later, for example `target: 'map'`, `target: 'twist-button'`, or `target: 'toolbox'`.

## Most Likely Failure Points

1. Hiding the tutorial console may also hide the blackout/gesture, because `hideTutorialDialogue()` currently clears multiple tutorial visuals together.
2. Dawn routing could accidentally make mandatory tutorials optional if they only create a red badge.
3. Auto-opening the Dawn chat window could cover the map target if it is too large or placed over the focus area.
4. Existing tutorial advancement depends on `step.type`; changing message routing must not change step completion rules.
5. Map pointers and UI-control highlights are different systems; forcing one arrow implementation for both could break layout on mobile.

## Safe Fix Strategy

Use a narrow two-part patch:

1. Split message routing:
   - System steps: show the existing top/right tutorial popup.
   - Dawn mandatory steps: show a mandatory Dawn popup/chat panel while still marking the Dawn bubble with a red badge.
   - Optional Dawn messages: only red badge and chat log.

2. Add target guidance without changing gameplay:
   - Reuse `render.showTutorialPointer(...)` for cells.
   - Reuse `.tutorial-target` for float buttons and twist/tools controls.
   - Reuse `tutorial-blackout` focus variables for the visual spotlight.
   - Add a small DOM arrow only for UI controls if the existing highlight is not clear enough.

## Recommendation

For this project, the best default is:

- Dawn floating bubble: red badge notification.
- Mandatory tutorial: auto-popup, always visible.
- Dawn mandatory tutorial: Dawn-styled popup/chat panel plus badge, not hidden behind the bubble.
- System mandatory tutorial: top/right system popup.
- Target guidance: spotlight + pointer for map cells, glow + arrow for UI controls/tools.

This keeps the player from getting stuck while still making Dawn feel like a character instead of a system label.
