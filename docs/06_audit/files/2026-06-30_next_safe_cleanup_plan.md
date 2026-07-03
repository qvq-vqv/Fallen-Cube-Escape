# Next Safe Cleanup Plan

> Date: 2026-06-30 23:53 CST
> Phase: Post-organization risk sweep and next cleanup plan
> Authoring agent: Codex / GPT-5
> Safety status: no fatal issue found. `git diff --check` and `npm run check` pass.
> User goal: make the project clearer in Finder-style short categories, without losing evidence or breaking the game.

## Sweep Result

No fatal project-breaking issue was found.

The game runtime files are still in root:

- `index.html`
- `style.css`
- `main.js`
- `game.js`
- `render.js`
- `levels.js`
- `dialogue.js`
- `story.js`
- `locales.js`
- `audio.js`

The main issue found is not runtime breakage. It is **documentation references still pointing to old paths**.

Examples of old references still present:

- `docs/raw_chat_archives.md`
- `docs/session_transcripts/`
- `docs/architecture/`
- `docs/DESIGN_BRIEF.md`
- `docs/task.md`
- `docs/walkthrough.md`

These are mostly inside older audit/planning documents. They do not break the game, but they can confuse future reading.

## Risk Ranking

| Risk | Severity | Why it matters | Safe solution |
|---|---:|---|---|
| Old document paths | Medium | user/agents may open wrong path | update links or add a redirect index |
| Git shows many `D` and `??` | Medium | looks like files disappeared | create move log and later stage/commit cleanly |
| `.agents` vs `agents_hub` unclear | Medium | agents may read wrong memory source | compare and mark one active, one legacy |
| Root `task.md` and `walkthrough.md` differ from old docs copies | Medium | cannot merge blindly | compare and decide source-of-truth |
| `.DS_Store` noise | Low | visual/git noise | add `.gitignore`, then clean carefully |
| Moving runtime JS/CSS | High | can break script loading | do not do until browser smoke and path plan |

## Plan Overview

Do the cleanup in four small passes.

```text
Pass 1: Fix navigation and old paths
Pass 2: Resolve duplicate/legacy docs
Pass 3: Sort agent memory safely
Pass 4: Prepare code cleanup without moving runtime files
```

## Pass 1: Fix Navigation And Old Paths

Goal: make current docs easy to click and search.

Actions:

1. Create `docs/00_index/MOVE_LOG.md`.
2. Search old paths with `rg`.
3. Update current index files to new paths.
4. For old audit documents, either:
   - update references if they are meant to be current, or
   - add a note saying "path was old at time of writing; see current docs/README.md."
5. Re-run:
   - `git diff --check`
   - `npm run check`

Do not:

- move more files during this pass;
- rewrite old historical documents so much that they lose historical meaning.

## Pass 2: Resolve Duplicate And Legacy Docs

Goal: reduce duplicated document confusion.

Actions:

1. Compare `task.md` and old `docs/02_boards/tasks/task_m11_older.md`.
2. Compare root `walkthrough.md` and `docs/05_reports/playtest/walkthrough_m11_3.md`.
3. Decide:
   - root file is active/current;
   - docs file is old/historical;
   - or both should be preserved with clearer names.
4. Keep root active files if tools or agents may expect them.
5. Update docs index.

Do not:

- delete old versions;
- merge by filename alone.

## Pass 3: Sort Agent Memory Safely

Goal: clarify `.agents/` vs `agents_hub/`.

Actions:

1. Compare `.agents/PROJECT_CEO_INSTRUCTIONS.md` with `agents_hub/PROJECT_CEO_INSTRUCTIONS.md`.
2. Compare role folders:
   - `art_producer`
   - `product_manager`
   - `qa_tester`
   - `research_specialist`
   - `sfx_producer`
3. Decide which is active.
4. If `.agents/` is legacy, move it later to:

```text
docs/99_archive/legacy_agents/
```

5. Keep `agents_hub/` active unless user says otherwise.

Do not:

- delete `.agents/`;
- move `agents_hub/CODEX_BOARD.md`;
- move `agents_hub/FAIL_SAFE_RULES/`.

## Pass 4: Prepare Code Cleanup

Goal: make code clearer without breaking runtime.

Actions:

1. Keep runtime files in root.
2. Expand `docs/00_index/CODE_FILES.md`.
3. Add per-file section maps:
   - `main.js`: UI sections
   - `game.js`: engine sections
   - `render.js`: renderer sections
   - `levels.js`: data sections
4. Identify "safe extraction candidates" but do not extract yet.
5. Add browser smoke requirement before future code movement.

Do not:

- create `src/` and move JS yet;
- convert to Vite yet;
- split `main.js/game.js/render.js` without a separate migration plan.

## Proposed Immediate Next Task

Start with Pass 1.

Why:

- It is low risk.
- It fixes the main problem found by the sweep.
- It makes the new organization actually usable.
- It does not touch game runtime.

Pass 1 concrete checklist:

- [ ] Create `docs/00_index/MOVE_LOG.md`
- [ ] Update `docs/README.md` if needed
- [ ] Update old raw chat archive references
- [ ] Update global fail-safe link to raw archive
- [ ] Update `agents_hub/PROJECT_CEO_INSTRUCTIONS.md` raw archive link
- [ ] Mark old audit path references as historical if not updating them
- [ ] Run `git diff --check`
- [ ] Run `npm run check`

## Stop Conditions

Stop and ask user if:

1. A path reference belongs to a historical quote and changing it may distort history.
2. Any active agent rule file points to a moved path.
3. A move would affect runtime JS/CSS/HTML.
4. A duplicate file differs and source-of-truth is unclear.

