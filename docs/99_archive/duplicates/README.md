# Duplicate Archive

> Last organized: 2026-06-30 23:28 CST
> Organizer: Codex / GPT-5
> Rule: files here were moved, not deleted.

## Why This Exists

The project had duplicate Markdown files in both the root folder and `docs/`.

Before moving root copies here, Codex compared them with `cmp -s` and only moved files that were byte-for-byte identical to a categorized docs copy.

For non-identical duplicates and current-vs-legacy decisions, see `../../00_index/SOURCE_OF_TRUTH.md`.

## Root Copies Archived In This Pass

These root files were archived because they were identical to categorized docs copies:

| Archived file | Active/categorized copy |
|---|---|
| `root_copies/DESIGN_BRIEF.md` | `../../03_design/core/DESIGN_BRIEF.md` |
| `root_copies/difficulty_report.md` | `../../05_reports/difficulty/difficulty_report.md` |
| `root_copies/game_design_audit.md` | `../../03_design/ui/game_design_audit.md` |
| `root_copies/handover_report.md` | `../../04_chats/handoff/handover_report.md` |
| `root_copies/implementation_plan.md` | `../../04_chats/handoff/implementation_plan.md` |
| `root_copies/level_quality_report.md` | `../../05_reports/quality/level_quality_report.md` |
| `root_copies/project_pitch_report.md` | `../../07_portfolio/ai_statement/project_pitch_report.md` |

## Root Files Intentionally Not Moved

These were left in root:

- `CLAUDE.md`: likely read by agent tooling and useful as root project guidance.
- `COMMUNICATION_BOARD.md`: referenced by `CLAUDE.md`; kept to avoid breaking expectations.
- `task.md`: differs from `docs/task.md`; appears newer/current.
- `walkthrough.md`: differs from `docs/walkthrough.md`; appears current generated L01-L40 walkthrough.
- `CODEX_LIVE_STATUS.md`: active heartbeat contract requires root location.
