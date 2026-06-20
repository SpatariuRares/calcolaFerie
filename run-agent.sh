#!/usr/bin/env bash
# Launches Claude Code's native agents view (--clone mode).
# All issues in docs/issues/ are pre-loaded into .claude/AGENTS.md
# so claude dispatches one subagent per issue automatically.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ISSUES_DIR="$SCRIPT_DIR/docs/issues"
AGENTS_MD="$SCRIPT_DIR/.claude/AGENTS.md"
SANDBOX_NAME="calcolaferie-agents"

# ── build task list ────────────────────────────────────────────────────────────

cat >"$AGENTS_MD" <<'EOF'
# Orchestrator instructions

You are the orchestrator for the CalcolaFerie project.
Dispatch one subagent per issue using the agents view.
Respect the dependency waves — wait for each wave before starting the next.

## Dependency waves

| Wave | Issues (run in parallel within wave) |
|------|--------------------------------------|
| 1    | 01-project-setup                     |
| 2    | 02-engine-types, 05-input-form, 09-supabase-leads |
| 3    | 03-calculate-algorithm, 08-persistence |
| 4    | 04-engine-tests, 06-results-table    |
| 5    | 07-calendar-view                     |

Each subagent must:
- Complete ALL acceptance criteria in its assigned issue
- Commit changes with a clear message when done
- NOT touch files outside its issue scope

## Issues

EOF

for f in "$ISSUES_DIR"/[0-9]*.md; do
  printf -- '---\n### %s\n\n' "$(basename "$f")" >>"$AGENTS_MD"
  cat "$f" >>"$AGENTS_MD"
  echo "" >>"$AGENTS_MD"
done

echo "Task list → $AGENTS_MD"
echo ""

# ── launch ─────────────────────────────────────────────────────────────────────

echo "Sandbox: $SANDBOX_NAME (clone mode — host repo stays clean)"
echo "Review after: git fetch sandbox-$SANDBOX_NAME"
echo ""

sbx run --clone --name "$SANDBOX_NAME" claude "$SCRIPT_DIR" \
  -- --dangerously-skip-permissions agents
