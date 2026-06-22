#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

SKILL_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}/.claude/skills/seo"
VENV_DIR="${SKILL_DIR}/.venv"
REQUIREMENTS="${SKILL_DIR}/requirements.txt"

# Install Python deps if venv doesn't exist or requirements changed
if [ ! -f "${VENV_DIR}/bin/pip" ]; then
  echo "→ Creando entorno virtual para Claude SEO..."
  python3 -m venv "${VENV_DIR}"
fi

echo "→ Instalando dependencias Python de Claude SEO..."
"${VENV_DIR}/bin/pip" install --quiet -r "${REQUIREMENTS}"

# Install Playwright chromium if not already installed
if ! "${VENV_DIR}/bin/python" -m playwright --version &>/dev/null 2>&1; then
  echo "→ Instalando Playwright chromium..."
  "${VENV_DIR}/bin/python" -m playwright install chromium
else
  # Check if chromium binary exists
  CHROMIUM_PATH=$("${VENV_DIR}/bin/python" -c "from playwright._impl._driver import compute_driver_executable; print(compute_driver_executable())" 2>/dev/null || echo "")
  if [ ! -f "${CHROMIUM_PATH}" ]; then
    echo "→ Instalando Playwright chromium..."
    "${VENV_DIR}/bin/python" -m playwright install chromium
  fi
fi

echo "✓ Claude SEO listo"
