# Non-Code File Inventory

> Date: 2026-06-30 23:00 CST
> Phase: Non-Code File Classification
> Authoring agent: Codex / GPT-5
> Reason: the user clarified that the confusing part is not only code architecture, but the large pile of Markdown/coordination/design/archive files whose purpose is unclear.
> Safety note: this is a classification document only. No files were moved, deleted, renamed, or merged.

> Historical path note: this document was written before the numbered docs layout was applied. For current paths, see `docs/00_index/CURRENT_PATHS.md` and `docs/00_index/MOVE_LOG.md`.

## Plain-Language Summary

The non-code files are not just "design docs" and "assistant chats." They currently fall into about 9 categories:

1. Project rules and agent behavior rules.
2. Live coordination boards and task checklists.
3. Design documents.
4. Raw conversation/chat archives.
5. Implementation prompts and handoff documents.
6. Automated reports generated from tools.
7. Architecture/audit documents recently created by Codex.
8. Sub-agent memory/todo files.
9. Duplicate or older copies that need review before merging.

## Recommended Human-Friendly Folder Board

This is the mental model I recommend:

```text
01_rules_and_protocols
02_active_boards_and_tasks
03_design_docs
04_raw_conversations
05_handoffs_and_prompts
06_reports_and_generated_outputs
07_architecture_audits
08_subagent_memory
09_duplicates_to_review
```

Do not physically move files yet unless the user approves.

## Category 1: Rules And Protocols

These are "how agents must behave" files. They should be read before doing work.

| File | What it is | Keep? | Notes |
|---|---|---|---|
| `CLAUDE.md` | project environment and visual/coding guidelines | yes | root copy |
| `docs/CLAUDE.md` | duplicate/mirror of `CLAUDE.md` | review | appears duplicated |
| `agents_hub/FAIL_SAFE_RULES/GLOBAL_FAIL_SAFE_RULES.md` | permanent anti-regression rules | yes | highest-priority rule file |
| `agents_hub/PROJECT_CEO_INSTRUCTIONS.md` | CEO/Antigravity behavior protocol | yes | active agent protocol |
| `.agents/PROJECT_CEO_INSTRUCTIONS.md` | older/parallel CEO protocol | review | may be legacy or mirrored |
| `docs/agents_hub/PROJECT_CEO_INSTRUCTIONS.md` | docs copy of CEO protocol | review | duplicate candidate |

Verdict:

- The real active rule center should likely be `agents_hub/FAIL_SAFE_RULES/` plus `agents_hub/PROJECT_CEO_INSTRUCTIONS.md`.
- `CLAUDE.md` is also important but may be older-style guidance.

## Category 2: Active Boards And Task Lists

These are working boards, checklists, and heartbeat status files.

| File | What it is | Keep? | Notes |
|---|---|---|---|
| `CODEX_LIVE_STATUS.md` | current heartbeat/status card | yes | active, root-level by contract |
| `agents_hub/CODEX_BOARD.md` | current Codex board | yes | active coordination board |
| `COMMUNICATION_BOARD.md` | older/root communication board | review | may be legacy or duplicated |
| `docs/COMMUNICATION_BOARD.md` | docs copy of communication board | review | duplicate candidate |
| `agents_hub/todo_list.md` | extra subtask backlog | yes | active or semi-active |
| `docs/agents_hub/todo_list.md` | docs copy of todo list | review | duplicate candidate |
| `task.md` | root milestone task ledger | yes, but messy | currently has newer hotfix entry plus older history |
| `docs/task.md` | docs copy of milestone task ledger | review | duplicate candidate, not identical by first lines |

Verdict:

- `CODEX_LIVE_STATUS.md` and `agents_hub/CODEX_BOARD.md` are active.
- `task.md` is a long historical work log, not just today's task.
- `COMMUNICATION_BOARD.md` may be old-style coordination and should be compared before merging.

## Category 3: Design Documents

These explain the game design, UI/UX ideas, level/tutorial structure, and intended experience.

| File | What it is | Keep? | Notes |
|---|---|---|---|
| `DESIGN_BRIEF.md` | main design brief | yes | core design document |
| `docs/DESIGN_BRIEF.md` | duplicate/mirror of design brief | review | likely duplicate |
| `game_design_audit.md` | UX/game design audit proposal | yes/review | design audit, possibly older milestone |
| `docs/game_design_audit.md` | duplicate/mirror of design audit | review | likely duplicate |
| `docs/levels_and_tutorials_table.md` | L01-L40 story/tutorial table | yes | useful design reference |
| `docs/playtest_issue_tracker.md` | playtest feedback and iteration tracker | yes | important for design history |

Verdict:

- These are the files you probably meant by "设计文案."
- `DESIGN_BRIEF.md`, `levels_and_tutorials_table.md`, and `playtest_issue_tracker.md` are especially useful for understanding the game.

## Category 4: Raw Conversations / Chat Archives

These preserve original user/assistant discussions and should matter for college application evidence.

| File | What it is | Keep? | Notes |
|---|---|---|---|
| `docs/raw_chat_archives.md` | older raw conversation archive/index | yes | existing archive before this pass |
| `docs/session_transcripts/README.md` | rules for transcript storage | yes | created in structure pass |
| `docs/session_transcripts/2026-06-30_structure_clarity_raw.md` | raw conversation archive for this structure clarity phase | yes | includes current user instructions |

Verdict:

- This is the correct home for "你和 Gemini/Codex 的原对话."
- Future important user instructions should go into `docs/04_chats/raw/` or be indexed from `docs/04_chats/raw/raw_chat_archives.md`.

Current locations after physical organization:

- `docs/04_chats/raw/raw_chat_archives.md`
- `docs/04_chats/raw/README.md`
- `docs/04_chats/raw/2026-06-30_structure_clarity_raw.md`

## Category 5: Handoffs And Implementation Prompts

These tell another agent what to implement, or record a handoff after implementation.

| File | What it is | Keep? | Notes |
|---|---|---|---|
| `docs/gpt5_implementation_instructions.md` | prompt/spec for GPT-5.5 code implementation | yes | handoff/prompt artifact |
| `handover_report.md` | development handoff report | yes/review | root copy |
| `docs/handover_report.md` | docs copy of handoff report | review | likely duplicate |
| `implementation_plan.md` | milestone implementation plan | yes/review | root copy |
| `docs/implementation_plan.md` | docs copy of implementation plan | review | likely duplicate |

Verdict:

- These are not design docs exactly. They are "交接/执行说明."
- They are useful for reconstructing why code changed.

## Category 6: Reports And Generated Outputs

These are produced by audit/playtest/report tools or summarize tool output.

| File | What it is | Keep? | Notes |
|---|---|---|---|
| `difficulty_report.md` | generated difficulty curve report | maybe | generated by script |
| `docs/difficulty_report.md` | docs copy of difficulty report | review | duplicate candidate |
| `level_quality_report.md` | generated/automated level quality audit | maybe | generated by quality tool |
| `docs/level_quality_report.md` | docs copy of quality report | review | duplicate candidate |
| `walkthrough.md` | generated walkthrough from bot | maybe | root version appears current L01-L40 |
| `docs/walkthrough.md` | older walkthrough/milestone note | review | not same first lines as root |
| `project_pitch_report.md` | AI statement/project pitch | yes | useful for portfolio |
| `docs/project_pitch_report.md` | duplicate/mirror of pitch report | review | likely duplicate |

Verdict:

- Some are generated and can be regenerated.
- Before ignoring or archiving them, decide whether they are needed as portfolio evidence.

## Category 7: Architecture / Audit Documents

These are the new files Codex created during the structure clarity work.

| File | What it is | Keep? | Notes |
|---|---|---|---|
| `docs/architecture/2026-06-30_structure_clarity_report.md` | first high-level structure report | yes | created before this inventory |
| `docs/architecture/2026-06-30_safe_structure_audit_rules.md` | local safety rules for audit pass | yes | temporary but useful |
| `docs/architecture/2026-06-30_safe_structure_audit_thread_plan.md` | executable audit thread plan | yes | temporary but useful |
| `docs/architecture/2026-06-30_code_responsibility_audit.md` | runtime code responsibility map | yes | code-side architecture map |
| `docs/architecture/2026-06-30_physical_partition_plan.md` | proposed future folder organization | yes | no files moved |
| `docs/architecture/2026-06-30_non_code_file_inventory.md` | this file | yes | non-code file classification |

Verdict:

- These are meta-documents: they explain the current mess and how to safely clean it.

## Category 8: Sub-Agent Memory And Todo Files

These belong to individual assistant roles.

| File group | What it is | Keep? | Notes |
|---|---|---|---|
| `.agents/*/memory.md` | memory for older/parallel subagents | review | likely legacy or alternate system |
| `.agents/*/todo_list.md` | todo lists for older/parallel subagents | review | likely legacy or alternate system |
| `agents_hub/*/memory.md` | memory for active role agents | yes/review | active-looking copy |
| `agents_hub/*/todo_list.md` | todo lists for active role agents | yes/review | active-looking copy |

Roles seen:

- `art_producer`
- `product_manager`
- `qa_tester`
- `research_specialist`
- `sfx_producer`

Verdict:

- These are not game docs.
- They are "assistant workspace memory."
- `agents_hub/` looks like the newer active home; `.agents/` may be older or parallel. Do not delete until compared.

## Category 9: Duplicates / Mirrors To Review

These appear both in root and `docs/`.

Likely duplicate pairs:

| Root file | Docs copy | Risk |
|---|---|---|
| `CLAUDE.md` | `docs/CLAUDE.md` | likely same or near-same |
| `COMMUNICATION_BOARD.md` | `docs/COMMUNICATION_BOARD.md` | likely same or near-same |
| `DESIGN_BRIEF.md` | `docs/DESIGN_BRIEF.md` | likely same or near-same |
| `difficulty_report.md` | `docs/difficulty_report.md` | likely same or near-same |
| `game_design_audit.md` | `docs/game_design_audit.md` | likely same or near-same |
| `handover_report.md` | `docs/handover_report.md` | likely same or near-same |
| `implementation_plan.md` | `docs/implementation_plan.md` | likely same or near-same |
| `level_quality_report.md` | `docs/level_quality_report.md` | likely same or near-same |
| `project_pitch_report.md` | `docs/project_pitch_report.md` | likely same or near-same |

Not obviously identical:

| Root file | Docs copy | Note |
|---|---|---|
| `task.md` | `docs/task.md` | first lines differ; root has newer hotfix entry |
| `walkthrough.md` | `docs/walkthrough.md` | first lines differ; root appears generated L01-L40, docs is milestone walkthrough |

Verdict:

- Do not merge duplicates by filename only.
- Compare contents first.
- Root `task.md` and `walkthrough.md` should be treated carefully.

## Category 10: Non-Markdown Noise

These are not Markdown but contribute to visual mess.

| File | What it is | Action later |
|---|---|---|
| `.DS_Store` | macOS Finder metadata | add to `.gitignore`, do not manually delete yet |
| `.agents/.DS_Store` | macOS Finder metadata | same |
| `agents_hub/.DS_Store` | macOS Finder metadata | same |
| `.git/.DS_Store` | macOS Finder metadata inside git folder | ignore; do not touch `.git` |
| `docs/gpt5_system_prompt.txt` | large prompt/reference text | classify later as prompt/archive |
| `failure_log.json` | tool/runtime failure log | classify later as report/generated data |

## Current Best Answer To "What Are These?"

If you open the project and see many `.md` files, think:

```text
Rules:
  CLAUDE.md
  agents_hub/FAIL_SAFE_RULES/GLOBAL_FAIL_SAFE_RULES.md
  agents_hub/PROJECT_CEO_INSTRUCTIONS.md

Active boards:
  CODEX_LIVE_STATUS.md
  agents_hub/CODEX_BOARD.md
  task.md
  agents_hub/todo_list.md

Design:
  DESIGN_BRIEF.md
  docs/levels_and_tutorials_table.md
  docs/playtest_issue_tracker.md
  game_design_audit.md

Raw conversations:
  docs/raw_chat_archives.md
  docs/session_transcripts/*

Handoffs/prompts:
  docs/gpt5_implementation_instructions.md
  handover_report.md
  implementation_plan.md

Reports/generated:
  difficulty_report.md
  level_quality_report.md
  walkthrough.md
  project_pitch_report.md

Architecture cleanup:
  docs/architecture/*

Subagent memory:
  agents_hub/*/memory.md
  agents_hub/*/todo_list.md
  .agents/*
```

## Suggested Next Move

Before physically moving anything:

1. Compare duplicate root/docs pairs.
2. Choose source-of-truth for each pair.
3. Create a visible `docs/README.md` or update `docs/project_docs_portal.md` to reflect this simpler category model.
4. Only after that, move old duplicates into an archive folder.
