#!/bin/bash

# Create a shared directory
SHARED_DIR="dev"
mkdir -p "$SHARED_DIR"

# List of repositories to clone
REPOS=(
    "git@github.com:ReflectionsProjections/rp-api.git"
    "git@github.com:ReflectionsProjections/rp-web.git"
)

# Clone each repository
for repo in "${REPOS[@]}"; do
    git clone "$repo" "$SHARED_DIR/$(basename "$repo" .git)" &
done

wait

echo "Repositories cloned successfully to $SHARED_DIR."

# Use ANSI escape codes for formatting
GREEN="\033[32m"
YELLOW="\033[33m"
BOLD="\033[1m"
RESET="\033[0m"

# Install custom 'rp' command
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

cat > "$BIN_DIR/rp" << 'EOF'
#!/bin/bash

case "$1" in
  start)
    docker compose up --build
    ;;
  start-detached)
    docker compose up --build -d
    ;;
  status)
    docker compose ps
    ;;
  start-rp)
    docker compose up --build rp
    ;;
  enter)
    docker compose exec rp bash
    ;;
  stop)
    docker compose down
    ;;
  clean)
    docker compose down -v
    ;;
  logs)
    docker compose logs
    ;;
  logs-rp)
    docker compose logs -f rp
    ;;
  logs-db)
    docker compose logs -f db
    ;;
  db)
    docker compose exec db psql -U postgres
    ;;
  help|--help|-h|*)
    echo "   ${BOLD}rp start${RESET}             - Start all services"
    echo "   ${BOLD}rp start-detached${RESET}    - Start all services in detached mode"
    echo "   ${BOLD}rp status${RESET}            - Show status of all services"
    echo "   ${BOLD}rp start-rp${RESET}          - Start just the RP Web and API services"
    echo "   ${BOLD}rp enter${RESET}             - Enter the RP container"
    echo "   ${BOLD}rp stop${RESET}              - Stop all services"
    echo "   ${BOLD}rp clean${RESET}             - Stop and remove volumes"
    echo "   ${BOLD}rp logs${RESET}              - View logs for all services"
    echo "   ${BOLD}rp logs-rp${RESET}           - Tail RP service logs"
    echo "   ${BOLD}rp logs-db${RESET}           - Tail DB service logs"
    echo "   ${BOLD}rp db${RESET}                - Open a psql prompt inside the DB container"
    ;;
esac
EOF

chmod +x "$BIN_DIR/rp"

# Ensure the bin directory is in PATH
SHELL_NAME=$(basename "$SHELL")
if [[ "$SHELL_NAME" == "zsh" ]]; then
  SHELL_RC="$HOME/.zshrc"
else
  SHELL_RC="$HOME/.bashrc"
fi

if ! grep -q "$BIN_DIR" "$SHELL_RC"; then
  echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$SHELL_RC"
  echo "Added $BIN_DIR to PATH in $SHELL_RC"
fi

# Add tab completion for 'rp'
COMPLETION_SNIPPET=$(cat << 'EOF'

# ---- RP CLI tab completion ----
_rp_completions() {
  local cur opts
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  opts="start start-detached status start-rp enter stop clean logs logs-rp logs-db db help --help -h"

  COMPREPLY=( $(compgen -W "${opts}" -- "$cur") )
}
complete -F _rp_completions rp
# ---- End RP CLI tab completion ----

EOF
)

if ! grep -q "_rp_completions" "$SHELL_RC"; then
  echo "$COMPLETION_SNIPPET" >> "$SHELL_RC"
  echo "✅ Tab completion for 'rp' added to $SHELL_RC"
fi

echo "${GREEN}${BOLD}✅ 'rp' command installed.${RESET}\n"

echo "${BOLD}➡️  Base commands:${RESET}"
echo "   ${BOLD}rp start${RESET}             - Start all services"
echo "   ${BOLD}rp start-detached${RESET}    - Start all services in detached mode"
echo "   ${BOLD}rp stop${RESET}              - Stop all services"
echo "   ${BOLD}rp status${RESET}            - Show status of all services"
echo "   ${BOLD}rp enter${RESET}             - Enter the RP container"
echo "   ${BOLD}rp clean${RESET}             - Stop and remove volumes"
echo "   ${BOLD}rp logs${RESET}              - View logs for all services"
echo

echo "${YELLOW}💡 Tip:${RESET} Just type '${BOLD}rp --help${RESET}' to see all available commands."
echo "${GREEN}${BOLD}Run 'source $SHELL_RC' or restart your terminal to use the 'rp' command.${RESET}"