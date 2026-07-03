# Code Files Quick Index

> Last organized: 2026-06-30 23:31 CST
> Safety: runtime code files are still in root and were not moved.

## Open These First

| File | Simple meaning | Touch carefully? |
|---|---|---|
| `index.html` | screen structure and script loading | yes |
| `style.css` | all visual styling | yes |
| `main.js` | UI controller and event binding | very yes |
| `game.js` | core game rules and state | extremely yes |
| `render.js` | Three.js rendering and animation | extremely yes |
| `levels.js` | level data and tutorial data | yes |

## Support Code

| File | Simple meaning |
|---|---|
| `dialogue.js` | story dialogue data |
| `story.js` | story reactions/state |
| `locales.js` | language strings |
| `audio.js` | sound and feedback |
| `tools/*.js` | checks, playtest, reports |

## Current Rule

Do not move runtime code files yet.

Reason: `index.html` loads them directly from root paths. Moving them should be a separate migration with browser testing.

## Future Split Direction

Detailed map:

`../06_audit/code/2026-06-30_runtime_code_map.md`

Current rough future groups:

```text
core     -> game rules, AI, rotation, pathfinding
render   -> Three.js scene, meshes, effects
ui       -> menus, settings, phone, tutorial UI
data     -> levels, tutorial data, locales
story    -> dialogue and story reactions
tools    -> validation and playtest scripts
```

