#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$HOME/.local/bin"
TARGET="$BIN_DIR/rp"

mkdir -p "$BIN_DIR"
ln -sfn "$ROOT_DIR/scripts/rp" "$TARGET"

SHELL_NAME="$(basename "${SHELL:-bash}")"
if [[ "$SHELL_NAME" == "zsh" ]]; then
  SHELL_RC="$HOME/.zshrc"
else
  SHELL_RC="$HOME/.bashrc"
fi

if ! grep -q "$BIN_DIR" "$SHELL_RC" 2>/dev/null; then
  echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$SHELL_RC"
fi

if ! grep -q "_rp_completions" "$SHELL_RC" 2>/dev/null; then
  cat >> "$SHELL_RC" <<'EOF'

# ---- RP CLI tab completion ----
_rp_completions() {
  local cur opts
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  opts="start start-verbose start-v start-detached start-d status stop clean logs logs-infra db help --help -h"
  COMPREPLY=( $(compgen -W "${opts}" -- "$cur") )
}
complete -F _rp_completions rp
# ---- End RP CLI tab completion ----
EOF
fi

echo "Installed rp -> $TARGET"
echo "Run 'source $SHELL_RC' or open a new shell if rp is not on PATH yet."
echo "Next steps:"
echo "  1. Add the root .env file"
echo "  2. Install dependencies in the app directories with yarn"
echo "  3. Run rp start"
echo "  4. Start the API, web, and mobile apps locally with yarn"

echo "${YELLOW}💡 Tip:${RESET} Just type '${BOLD}rp --help${RESET}' to see all available commands."
echo "${GREEN}${BOLD}Run 'source $SHELL_RC' or restart your terminal to use the 'rp' command.${RESET}"
