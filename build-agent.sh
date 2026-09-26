#!/bin/bash

set -e

PROJECT_DIR="$HOME/projects/ai-content-writer"

cd "$PROJECT_DIR"

echo "=========================================="
echo " AI CONTENT WRITER - AUTONOMOUS BUILDER"
echo "=========================================="
echo
echo "Project: $PROJECT_DIR"
echo "Model: Ollama / Devstral"
echo
echo "Starting autonomous build..."
echo

PROMPT='
You are the autonomous coding agent for this project.

Your working directory is the current project directory.

FIRST:
1. Read PROJECT_SPEC.md completely.
2. Read AGENT_INSTRUCTIONS.md completely.
3. Inspect the existing project files.
4. Understand what has already been implemented.

THEN BUILD THE ENTIRE PROJECT AUTONOMOUSLY.

Rules:
- Do NOT stop for normal phase confirmations.
- Do NOT ask me to type "continue".
- Do NOT wait for approval between normal development phases.
- Create and edit files directly using your tools.
- Run the required terminal commands yourself.
- Install project dependencies when necessary.
- Build the backend.
- Build the frontend.
- Run tests.
- Start applications when useful for testing.
- Inspect errors carefully.
- Fix errors yourself.
- Re-run the failed command after fixing it.
- Continue until the requirements in PROJECT_SPEC.md are implemented.
- Preserve working code.
- Do not delete existing functionality unless the specification requires it.
- Keep going through all project phases automatically.

ONLY stop if:
1. A password, API key, credential, or secret is required.
2. A destructive operation requires explicit confirmation.
3. A major architectural decision is required that is not covered by PROJECT_SPEC.md.
4. You genuinely cannot resolve an error after reasonable attempts.

At the end:
- Run the appropriate build/test commands.
- Report what was completed.
- Report any remaining errors.
- Report the commands needed to run the finished application.
'

echo "$PROMPT"

echo
echo "=========================================="
echo " Starting OpenCode..."
echo "=========================================="
echo

opencode run \
  --auto \
  --model ollama/devstral:latest \
  "$PROMPT"
