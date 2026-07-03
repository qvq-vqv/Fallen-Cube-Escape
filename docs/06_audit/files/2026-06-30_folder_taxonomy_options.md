# Folder Taxonomy Options

> Date: 2026-06-30 23:12 CST
> Phase: Folder Taxonomy Discussion
> Authoring agent: Codex / GPT-5
> Reason: user prefers a Finder-style hierarchy with short folder names and fine-grained levels, similar to their study folder organization.
> Safety note: this file proposes classification only. No existing files were moved, deleted, renamed, or merged.

> Historical path note: this document was written before the numbered docs layout was applied. For current paths, see `docs/00_index/CURRENT_PATHS.md` and `docs/00_index/MOVE_LOG.md`.

## What I Learned From The Screenshot

The user's style:

1. Use short names.
2. Make each level answer one question.
3. Avoid giant mixed folders.
4. Separate "topic" from "resource type."
5. Keep Finder scanning comfortable.

Example pattern:

```text
study
  ACCP
    statics
      manga
      other textbook
      统计作业1
      统计期中
```

For `escape`, the equivalent should be:

```text
escape
  docs
    design
      core
      levels
      ui
    logs
      raw
      boards
      handoff
    reports
      playtest
      quality
      difficulty
```

## Option A: Minimal And Safe

This only organizes non-code files. Runtime code stays where it is.

```text
docs
  design
    core
    ui
    levels
    story
  logs
    raw
    boards
    handoff
  rules
    global
    agents
  reports
    quality
    difficulty
    playtest
  audits
    architecture
    code
  portfolio
    pitch
    process
```

Good for:

- making the Markdown pile readable;
- lowest risk;
- your current request.

Weakness:

- code remains in root.

## Option B: Portfolio First

This makes the project easy to show to colleges.

```text
docs
  portfolio
    00_overview
    01_design
    02_process
    03_feedback
    04_ai_use
    05_tech
  work
    rules
    boards
    handoff
    reports
  raw
    chats
    prompts
```

Good for:

- application evidence;
- explaining your role;
- separating polished portfolio from messy work logs.

Weakness:

- not as convenient for day-to-day coding.

## Option C: Engineering First

This is closer to a professional software project.

```text
docs
  product
    design
    levels
    story
  engineering
    architecture
    audits
    reports
  operations
    rules
    boards
    handoff
  archive
    raw_chats
    old_docs
    generated
```

Good for:

- future code refactor;
- clean separation of product vs engineering vs operations.

Weakness:

- terms like `operations` may feel abstract.

## Recommended Option: Short Hybrid

This is my recommendation because it matches your Finder style and keeps names short.

```text
docs
  00_index
  01_rules
    global
    agent
  02_boards
    live
    tasks
    old
  03_design
    core
    ui
    levels
    story
  04_chats
    raw
    prompts
    handoff
  05_reports
    playtest
    quality
    difficulty
    generated
  06_audit
    architecture
    code
    files
  07_portfolio
    overview
    process
    ai_statement
  99_archive
    duplicates
    legacy_agents
```

Why this works:

- Numbers keep folders in stable order.
- Names are short.
- It separates "working files" from "portfolio files."
- It has a safe place for duplicates instead of deleting them.
- It keeps raw chats visible and protected.

## What Goes Where

### `01_rules`

For files agents must obey.

Examples:

- `CLAUDE.md`
- `agents_hub/FAIL_SAFE_RULES/GLOBAL_FAIL_SAFE_RULES.md`
- `agents_hub/PROJECT_CEO_INSTRUCTIONS.md`

### `02_boards`

For current or old task boards.

Examples:

- `CODEX_LIVE_STATUS.md`
- `agents_hub/CODEX_BOARD.md`
- `task.md`
- `agents_hub/todo_list.md`
- `COMMUNICATION_BOARD.md`

### `03_design`

For actual design thinking and game content.

Examples:

- `DESIGN_BRIEF.md`
- `game_design_audit.md`
- `docs/levels_and_tutorials_table.md`
- `docs/playtest_issue_tracker.md`

Possible subfolders:

```text
03_design
  core
  ui
  levels
  story
```

### `04_chats`

For original conversations, AI prompts, and handoff messages.

Examples:

- `docs/raw_chat_archives.md`
- `docs/session_transcripts/*`
- `docs/gpt5_implementation_instructions.md`
- `handover_report.md`
- `implementation_plan.md`

Possible subfolders:

```text
04_chats
  raw
  prompts
  handoff
```

### `05_reports`

For generated or semi-generated reports.

Examples:

- `difficulty_report.md`
- `level_quality_report.md`
- `walkthrough.md`
- `project_pitch_report.md`

Possible subfolders:

```text
05_reports
  playtest
  quality
  difficulty
  generated
```

### `06_audit`

For meta-analysis about the project itself.

Examples:

- `docs/architecture/*`
- future code structure audits
- future performance audits

Possible subfolders:

```text
06_audit
  architecture
  code
  files
  performance
```

### `07_portfolio`

For polished college-application-facing material.

Examples:

- `project_pitch_report.md`
- future `design_evolution.md`
- future `ai_collaboration_statement.md`

Possible subfolders:

```text
07_portfolio
  overview
  process
  ai_statement
  screenshots
```

### `99_archive`

For things not deleted, only retired.

Examples:

- duplicate root/docs pairs after comparison;
- `.agents/` if confirmed legacy;
- old board snapshots;
- stale generated reports.

Possible subfolders:

```text
99_archive
  duplicates
  legacy_agents
  old_boards
```

## Two Decisions Needed Before Moving Files

Decision 1:

Should numbered folders be used?

Example:

```text
01_rules
02_boards
03_design
```

Pros: stable order in Finder.  
Cons: a little more formal.

Decision 2:

Should portfolio be separated from work docs?

Example:

```text
docs/07_portfolio
```

Pros: very useful for college applications.  
Cons: some files may need short polished copies instead of raw work logs.

## My Suggested Answer

Use the short hybrid option:

```text
docs
  00_index
  01_rules
  02_boards
  03_design
  04_chats
  05_reports
  06_audit
  07_portfolio
  99_archive
```

Then do the move in this order:

1. Compare duplicates.
2. Create folders.
3. Move only non-runtime files.
4. Leave root runtime files untouched.
5. Run checks.
6. Stop for review.
