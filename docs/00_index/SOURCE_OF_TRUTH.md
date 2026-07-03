# Source Of Truth

> Updated: 2026-06-30 23:27 CST
> Authoring agent: Codex / GPT-5
> Purpose: resolve duplicate and legacy document confusion after the Finder-style organization pass.

## Rule

When two files describe the same area, use the file listed as **current** below.

Historical files are preserved for evidence and context. They should not override current files.

## Active Project Coordination

| Area | Current source | Historical / legacy source | Reason |
|---|---|---|---|
| live status | `CODEX_LIVE_STATUS.md` | none | root heartbeat is part of the active workflow |
| Codex/Gemini board | `agents_hub/CODEX_BOARD.md` | `docs/99_archive/duplicates/docs_agents_hub/CODEX_BOARD.md` | active board was compacted and continues in `agents_hub` |
| fail-safe rules | `agents_hub/FAIL_SAFE_RULES/GLOBAL_FAIL_SAFE_RULES.md` | none | current global project safety contract |
| CEO instructions | `agents_hub/PROJECT_CEO_INSTRUCTIONS.md` | `.agents/PROJECT_CEO_INSTRUCTIONS.md` | `agents_hub` version has newer Dawn-era design memory; `.agents` still has older E-7-era assumptions |
| raw user/assistant transcripts | `docs/04_chats/raw/` | old references to `docs/session_transcripts/` | current folder was created during docs organization |

## Active Work Records

| Area | Current source | Historical / legacy source | Reason |
|---|---|---|---|
| task timeline | `task.md` | `docs/02_boards/tasks/task_m11_older.md` | root file includes the newer M11.4 friend-playtest repair pass |
| generated L01-L40 walkthrough | `walkthrough.md` | `docs/05_reports/playtest/walkthrough_m11_3.md` | root file is a generated 40-level solution table; legacy file is a Milestone 11.3 UI walkthrough report |
| old communication board | `COMMUNICATION_BOARD.md` | `docs/02_boards/old/COMMUNICATION_BOARD.md` | root file is referenced by `CLAUDE.md`; old docs copy is retained as a snapshot |

## Agent Memory Split

| Folder | Status | Notes |
|---|---|---|
| `agents_hub/` | current active coordination folder | contains live board, fail-safe rules, watcher, history, and non-empty subagent todo lists |
| `.agents/` | legacy/mirror folder | memories match `agents_hub`, but todo lists are empty and CEO instructions are older |

## Safety Notes

- Do not merge `.agents` into `agents_hub` automatically.
- Do not delete historical copies; they matter for process evidence.
- Do not move runtime code files during this cleanup phase.
- If future agents disagree, prefer `agents_hub/` plus this file, then ask the user.
