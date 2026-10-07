#!/bin/bash

echo "=== SYSEN 5151 Environment Check ==="

echo ""
echo "[Git]"
git --version || echo "Git missing"

echo ""
echo "[Git Repository]"
git status --short || echo "Not inside Git repository"

echo ""
echo "[GitHub Remote]"
git remote -v || echo "Remote not configured"

echo ""
echo "[Python]"
python3.12 --version || echo "Python 3.12 missing"

echo ""
echo "[Backend Virtual Environment]"
if [ -d "walking_skeleton/backend/.venv" ]; then
    echo "walking_skeleton/backend/.venv OK"
else
    echo "walking_skeleton/backend/.venv MISSING"
fi

echo ""
echo "[Codex]"
codex --version || echo "Codex missing"

echo ""
echo "[Project Instructions]"
test -f AGENTS.md && echo "AGENTS.md OK" || echo "AGENTS.md MISSING"

echo ""
echo "[Specification]"
test -f SPEC.md && echo "SPEC.md OK" || echo "SPEC.md MISSING"

echo ""
echo "[Requirements]"
test -f requirements/TEMPLATE.md && echo "Requirement template OK" || echo "Requirement template MISSING"
test -f requirements/TRACEABILITY.md && echo "Traceability matrix OK" || echo "Traceability matrix MISSING"

echo ""
echo "[Workflow]"
test -f .codex/5151-workflow.md && echo "5151 workflow OK" || echo "Workflow MISSING"

echo ""
echo "=== Check Complete ==="