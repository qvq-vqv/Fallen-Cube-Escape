# Runtime Code Map

> Date: 2026-06-30 23:24 CST
> Phase: Runtime Code Organization Map
> Authoring agent: Codex / GPT-5
> Safety note: runtime code files were not moved in this pass.

## Why Code Was Not Physically Moved Yet

`index.html` currently loads root scripts directly:

```html
locales.js -> audio.js -> levels.js -> game.js -> render.js -> dialogue.js -> story.js -> main.js
```

Moving these files now would require changing script paths and re-testing browser startup. This should be done later as a dedicated migration step.

## Current Runtime Files

| File | Category | Current responsibility |
|---|---|---|
| `index.html` | shell | all DOM screens and script loading |
| `style.css` | style | global styles for every screen |
| `main.js` | UI controller | lifecycle, menus, settings, tutorial UI, phone UI, chat |
| `game.js` | core engine | rules, state, AI, tools, rotation, win/loss, minimap |
| `render.js` | renderer | Three.js scene, meshes, effects, camera, animation |
| `levels.js` | data | level definitions and tutorial steps |
| `dialogue.js` | story data | dialogue scenes and responses |
| `story.js` | story logic | story state and reactions |
| `locales.js` | i18n | language strings |
| `audio.js` | feedback | audio and game-feel sounds |
| `tools/*.js` | checks | validation, playtest, reports |

## Future Code Folder Target

Do not apply yet. This is the future direction.

```text
src
  core
    GameEngine.js
    topology.js
    rotation.js
    ai.js
    tools.js
    realtime.js
  render
    RenderEngine.js
    scene.js
    entities.js
    effects.js
    tutorialVisuals.js
  ui
    main.js
    levelBook.js
    phone.js
    settings.js
    tutorial.js
    geminiChat.js
  data
    levels.js
    tutorialSteps.js
    locales.js
  story
    dialogue.js
    story.js
```

## Safe Order For Future Code Cleanup

1. Add reliable browser smoke coverage.
2. Extract pure helpers first, not UI-heavy code.
3. Split `levels.js` data before splitting `game.js`.
4. Split `main.js` UI panels one at a time.
5. Split `render.js` only after visual screenshot checks.
6. Consider Vite/ES modules only after the above map is stable.

## Who Should Edit What

| Area | Best owner |
|---|---|
| Core rules / AI / rotation | Codex |
| Three.js renderer / performance | Codex |
| UI visual proposal / CSS sketches | Gemini can propose, Codex should integrate |
| Dialogue tone / copy | Gemini can propose, user decides |
| Raw docs / portfolio writing | Codex or Gemini, with user review |

