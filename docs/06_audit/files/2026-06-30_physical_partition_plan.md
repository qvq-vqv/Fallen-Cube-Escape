# Physical Partition Plan

> Date: 2026-06-30 22:38 CST
> Phase: Safe Structure Audit
> Authoring agent: Codex / GPT-5
> Scope: proposed organization only. No files are moved by this document.

> Historical path note: this document was written before the numbered docs layout was applied. For current paths, see `docs/00_index/CURRENT_PATHS.md` and `docs/00_index/MOVE_LOG.md`.

## Safety Position

Do not physically move runtime files in this pass.

Reason:

`index.html` loads runtime scripts directly from root paths. Moving `game.js`, `main.js`, `render.js`, `levels.js`, `style.css`, or related files without updating and browser-testing paths can break the game instantly.

## Current Buckets

| Bucket | Files/folders | Status |
|---|---|---|
| Runtime root | `index.html`, `style.css`, `audio.js`, `dialogue.js`, `game.js`, `levels.js`, `locales.js`, `main.js`, `render.js`, `story.js` | Keep in root for now |
| Validation tools | `tools/*.js` | Keep in `tools/` |
| Active coordination | `agents_hub/`, `CODEX_LIVE_STATUS.md` | Keep active |
| Architecture docs | `docs/architecture/` | New source-of-truth for structure work |
| Raw transcripts | `docs/session_transcripts/`, `docs/raw_chat_archives.md` | Keep and expand |
| Existing docs mirror | `docs/*.md` and root `*.md` duplicates | Needs source-of-truth decision |
| Legacy/parallel agent folder | `.agents/` | Review later; do not delete |
| OS noise | `.DS_Store`, `.agents/.DS_Store`, `agents_hub/.DS_Store`, `.git/.DS_Store` | Should be ignored later, not deleted in this pass |
| Git history | `.git/` | Do not touch |

## Proposed Future Layout

This is a future target, not a current action:

```text
escape/
  index.html
  package.json
  src/                  # only after a migration/split is approved
  styles/               # only after stylesheet load order is approved
  tools/
  docs/
    architecture/
    session_transcripts/
    reports/
    design/
    handoff/
  agents_hub/
    FAIL_SAFE_RULES/
    history/
  archive/
    legacy_agents/
    old_root_docs/
```

## Stepwise Move Plan For Later

### Stage A: No Runtime Risk Cleanup

Can be done after user approval:

1. Add `.gitignore` entries for `.DS_Store`.
2. Create `docs/reports/`, `docs/design/`, and `docs/handoff/`.
3. Move duplicate root markdown reports into docs folders only after confirming `docs/` has the latest copy.
4. Keep a move log.

Runtime risk: low.

### Stage B: Coordination Cleanup

Can be done after reviewing `.agents/` vs `agents_hub/`:

1. Decide whether `.agents/` is legacy.
2. Move legacy notes into `archive/legacy_agents/` if approved.
3. Keep `agents_hub/` as active coordination source.

Runtime risk: low, but project-memory risk exists.

### Stage C: Runtime Code Split

Do not start until:

1. Browser smoke is reliable.
2. `main.js`, `game.js`, and `render.js` section maps are accepted.
3. A rollback plan exists.

Runtime risk: high.

## Proposed `.gitignore` Entries Later

Do not apply yet without approval:

```gitignore
.DS_Store
**/.DS_Store
/difficulty_report.md
/walkthrough.md
/failure_log.json
/docs/gpt5_system_prompt.txt
```

Note:

Generated reports may or may not be intentionally tracked for the college portfolio. Confirm before ignoring them.

## Files That Should Stay Put For Now

Do not move in this phase:

- `index.html`
- `style.css`
- `audio.js`
- `dialogue.js`
- `game.js`
- `levels.js`
- `locales.js`
- `main.js`
- `render.js`
- `story.js`
- `package.json`
- `tools/*.js`

## Files To Review Later

Potential duplicate or archival candidates:

- root `DESIGN_BRIEF.md` vs `docs/DESIGN_BRIEF.md`
- root `COMMUNICATION_BOARD.md` vs `docs/COMMUNICATION_BOARD.md`
- root `task.md` vs `docs/task.md`
- root `walkthrough.md` vs `docs/walkthrough.md`
- root `difficulty_report.md` vs `docs/difficulty_report.md`
- root `game_design_audit.md` vs `docs/game_design_audit.md`
- root `handover_report.md` vs `docs/handover_report.md`
- root `implementation_plan.md` vs `docs/implementation_plan.md`
- root `level_quality_report.md` vs `docs/level_quality_report.md`
- `.agents/` vs `agents_hub/`

Do not delete any of these. Compare timestamps/content first in a later pass.
