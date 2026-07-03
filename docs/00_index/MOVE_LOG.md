# Move Log

> Created: 2026-07-01 00:04 CST
> Organizer: Codex / GPT-5
> Purpose: record document moves so organization work is reversible and auditable.
> Safety: runtime files were not moved.

## Rule

Files listed here were moved for clarity, not deleted.

Root runtime files stay in root:

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

## Docs Reorganization

| Old path | New path | Reason |
|---|---|---|
| `docs/CLAUDE.md` | `docs/01_rules/global/CLAUDE.md` | rules/guidelines |
| `docs/COMMUNICATION_BOARD.md` | `docs/02_boards/old/COMMUNICATION_BOARD.md` | old board copy |
| `docs/task.md` | `docs/02_boards/tasks/task_m11_older.md` | older task copy, not identical to root `task.md` |
| `docs/DESIGN_BRIEF.md` | `docs/03_design/core/DESIGN_BRIEF.md` | core design |
| `docs/game_design_audit.md` | `docs/03_design/ui/game_design_audit.md` | UI/UX design audit |
| `docs/levels_and_tutorials_table.md` | `docs/03_design/levels/levels_and_tutorials_table.md` | level/tutorial design reference |
| `docs/playtest_issue_tracker.md` | `docs/03_design/levels/playtest_issue_tracker.md` | playtest feedback |
| `docs/raw_chat_archives.md` | `docs/04_chats/raw/raw_chat_archives.md` | raw conversation archive |
| `docs/session_transcripts/README.md` | `docs/04_chats/raw/README.md` | raw transcript rules |
| `docs/session_transcripts/2026-06-30_structure_clarity_raw.md` | `docs/04_chats/raw/2026-06-30_structure_clarity_raw.md` | raw transcript |
| `docs/gpt5_implementation_instructions.md` | `docs/04_chats/prompts/gpt5_implementation_instructions.md` | implementation prompt |
| `docs/gpt5_system_prompt.txt` | `docs/04_chats/prompts/gpt5_system_prompt.txt` | prompt/reference text |
| `docs/handover_report.md` | `docs/04_chats/handoff/handover_report.md` | handoff |
| `docs/implementation_plan.md` | `docs/04_chats/handoff/implementation_plan.md` | implementation plan |
| `docs/difficulty_report.md` | `docs/05_reports/difficulty/difficulty_report.md` | difficulty report |
| `docs/level_quality_report.md` | `docs/05_reports/quality/level_quality_report.md` | quality report |
| `docs/walkthrough.md` | `docs/05_reports/playtest/walkthrough_m11_3.md` | older milestone walkthrough |
| `docs/project_pitch_report.md` | `docs/07_portfolio/ai_statement/project_pitch_report.md` | portfolio / AI statement |
| `docs/project_docs_portal.md` | `docs/00_index/project_docs_portal_old.md` | old docs portal |

## Architecture/Audit Docs Reorganization

| Old path | New path | Reason |
|---|---|---|
| `docs/architecture/2026-06-30_code_responsibility_audit.md` | `docs/06_audit/code/2026-06-30_code_responsibility_audit.md` | code audit |
| `docs/architecture/2026-06-30_physical_partition_plan.md` | `docs/06_audit/files/2026-06-30_physical_partition_plan.md` | file organization plan |
| `docs/architecture/2026-06-30_non_code_file_inventory.md` | `docs/06_audit/files/2026-06-30_non_code_file_inventory.md` | non-code file classification |
| `docs/architecture/2026-06-30_folder_taxonomy_options.md` | `docs/06_audit/files/2026-06-30_folder_taxonomy_options.md` | taxonomy options |
| `docs/architecture/2026-06-30_safe_structure_audit_rules.md` | `docs/06_audit/architecture/2026-06-30_safe_structure_audit_rules.md` | audit rules |
| `docs/architecture/2026-06-30_safe_structure_audit_thread_plan.md` | `docs/06_audit/architecture/2026-06-30_safe_structure_audit_thread_plan.md` | audit thread plan |
| `docs/architecture/2026-06-30_structure_clarity_report.md` | `docs/06_audit/architecture/2026-06-30_structure_clarity_report.md` | structure report |

Created directly in the new layout:

- `docs/06_audit/code/2026-06-30_runtime_code_map.md`
- `docs/06_audit/files/2026-06-30_next_safe_cleanup_plan.md`

## Archived Duplicate Root Copies

These root files were byte-for-byte identical to categorized docs copies and were moved to `docs/99_archive/duplicates/root_copies/`:

| Old root path | Archived path | Current categorized copy |
|---|---|---|
| `DESIGN_BRIEF.md` | `docs/99_archive/duplicates/root_copies/DESIGN_BRIEF.md` | `docs/03_design/core/DESIGN_BRIEF.md` |
| `difficulty_report.md` | `docs/99_archive/duplicates/root_copies/difficulty_report.md` | `docs/05_reports/difficulty/difficulty_report.md` |
| `game_design_audit.md` | `docs/99_archive/duplicates/root_copies/game_design_audit.md` | `docs/03_design/ui/game_design_audit.md` |
| `handover_report.md` | `docs/99_archive/duplicates/root_copies/handover_report.md` | `docs/04_chats/handoff/handover_report.md` |
| `implementation_plan.md` | `docs/99_archive/duplicates/root_copies/implementation_plan.md` | `docs/04_chats/handoff/implementation_plan.md` |
| `level_quality_report.md` | `docs/99_archive/duplicates/root_copies/level_quality_report.md` | `docs/05_reports/quality/level_quality_report.md` |
| `project_pitch_report.md` | `docs/99_archive/duplicates/root_copies/project_pitch_report.md` | `docs/07_portfolio/ai_statement/project_pitch_report.md` |

## Intentionally Left In Root

| Root file | Why it stayed |
|---|---|
| `CLAUDE.md` | likely read by tooling/agents as root guidance |
| `COMMUNICATION_BOARD.md` | referenced by existing guidance; old but left as compatibility entry |
| `CODEX_LIVE_STATUS.md` | active heartbeat contract requires root path |
| `task.md` | differs from old docs copy and appears current |
| `walkthrough.md` | differs from old docs copy and appears current generated L01-L40 walkthrough |
| `failure_log.json` | generated/runtime log; not classified yet |
