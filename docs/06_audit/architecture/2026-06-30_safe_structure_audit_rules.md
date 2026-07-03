# Safe Structure Audit Rules

> Date: 2026-06-30 22:31 CST
> Phase: Safe Structure Audit
> Authoring agent: Codex / GPT-5
> Reason: user explicitly requested extreme caution before any project organization work. This file is the local rule set for this audit pass.

> Historical path note: this document was written before the numbered docs layout was applied. For current paths, see `docs/00_index/CURRENT_PATHS.md` and `docs/00_index/MOVE_LOG.md`.

## Non-Negotiable Rules

1. Do not delete files.
2. Do not move runtime files in this pass.
3. Do not rename runtime files in this pass.
4. Do not change gameplay logic during structure audit.
5. Do not edit `index.html` script paths unless a later plan explicitly approves a move.
6. Do not convert the project to Vite/ES modules in this pass.
7. Do not clean `.git` history.
8. Do not run destructive commands such as `rm`, `git reset`, or `git checkout --`.
9. Do not assume duplicate files are safe to remove. Mark them in a report first.
10. Do not let curiosity expand into a huge refactor. Each step must be small and reversible.

## Allowed In This Pass

1. Create audit documents under `docs/06_audit/`.
2. Create raw transcript files under `docs/04_chats/raw/`.
3. Read source files and summarize responsibilities.
4. Run non-mutating checks such as `git status --short`, `git diff --check`, `npm run check`, `wc -l`, `du`, `find`, and `rg`.
5. Propose file moves in a plan without performing them.
6. Add `.gitignore` recommendations in a report, but do not change `.gitignore` unless user approves.

## Audit Priority

1. Protect the current playable project.
2. Make ownership and responsibilities clear.
3. Preserve the user's design process and original words.
4. Prepare later cleanup steps that can be reviewed before execution.

## Stop Conditions

Stop and ask before continuing if:

1. A required action would move or delete runtime files.
2. A change would require updating many script paths.
3. A file appears duplicated but its source-of-truth is unclear.
4. A check fails after a documentation-only change.
5. The audit discovers a serious runtime risk that tempts immediate fixing. Record it first; fix only after approval unless the user explicitly asks.
