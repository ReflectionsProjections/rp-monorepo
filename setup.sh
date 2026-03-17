#!/bin/bash

# Create a shared directory
SHARED_DIR="dev"
mkdir -p "$SHARED_DIR"

# List of repositories to clone
REPOS=(
    "git@github.com:ReflectionsProjections/rp-api.git"
    "git@github.com:ReflectionsProjections/rp-web.git"
    "git@github.com:ReflectionsProjections/rp-mobile.git"
)

# Clone each repository only if it doesn't already exist
for repo in "${REPOS[@]}"; do
    repo_name=$(basename "$repo" .git)
    repo_path="$SHARED_DIR/$repo_name"
    
    if [ -d "$repo_path" ]; then
        echo "Repository $repo_name already exists at $repo_path, skipping..."
    else
        echo "Cloning $repo_name..."
        git clone "$repo" "$repo_path" &
    fi
done

wait

echo "Repository setup complete in $SHARED_DIR."

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

# Function to copy .env file to local repo directories when present
update_env() {
    local main_env=".env"
    local api_env="dev/rp-api/.env"
    local web_env="dev/rp-web/.env"
    local mobile_env="dev/rp-mobile/.env"
    
    # Check if main .env exists
    if [ ! -f "$main_env" ]; then
        echo "⚠️  Warning: Main .env file not found. Services may not start correctly."
        return 1
    fi
    
    sync_env() {
        local target="$1"

        if [ -d "$(dirname "$target")" ]; then
            rm -f "$target"
            cp "$main_env" "$target"
        fi
    }

    sync_env "$api_env"
    sync_env "$web_env"
    sync_env "$mobile_env"
    echo "✅ Copied main .env to any available API, Web, and Mobile directories"
}

case "$1" in
  start)
    # Copy .env files before starting
    update_env
    # Start all services but only show API, Web, and Mobile logs
    docker compose up --build --attach api --attach web --attach mobile
    ;;
  start-verbose|start-v)
    # Copy .env files before starting
    update_env
    # Start all services and show all logs
    docker compose up --build
    ;;
  start-detached|start-d)
    # Copy .env files before starting
    update_env
    # Start all services in detached mode
    docker compose up --build -d
    ;;
  start-api)
    # Copy .env files before starting
    update_env
    # Start just API service (shows only API logs)
    docker compose up --build --attach api api db studio kong rest meta
    ;;
  start-api-v)
    # Copy .env files before starting
    update_env
    # Start just API service (shows all logs)
    docker compose up --build api db studio kong rest meta
    ;;
  start-web)
    # Copy .env files before starting
    update_env
    # Start just Web service (requires API/infrastructure to be running)
    docker compose up --build web
    ;;
  start-mobile)
    # Copy .env files before starting
    update_env
    docker compose up --build mobile
    ;;
  start-mobile-clear)
    # Copy .env files before starting
    update_env
    MOBILE_COMMAND=start-clear docker compose up --build mobile
    ;;
  start-mobile-web)
    # Copy .env files before starting
    update_env
    MOBILE_COMMAND=start-web docker compose up --build mobile
    ;;
  update)
    # Manually copy .env files
    update_env
    ;;
  status)
    docker compose ps
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
  logs-api)
    docker compose logs -f api
    ;;
  logs-web)
    docker compose logs -f web
    ;;
  logs-mobile)
    docker compose logs -f mobile
    ;;
  logs-infra)
    docker compose logs -f db studio kong rest meta
    ;;
  db)
    docker compose exec db psql -U postgres
    ;;
  enter|enter-api)
    # Enter the API container by default
    docker compose exec api bash
    ;;
  enter-web)
    docker compose exec web bash
    ;;
  enter-mobile)
    docker compose run --rm mobile bash
    ;;
  help|--help|-h|*)
    echo "   ${BOLD}rp start${RESET}             - Start all services (shows only API + Web + Mobile logs)"
    echo "   ${BOLD}rp start-verbose${RESET}     - Start all services (shows all logs)"
    echo "   ${BOLD}rp start-v${RESET}           - Short form of start-verbose"
    echo "   ${BOLD}rp start-detached${RESET}    - Start all services in detached mode"
    echo "   ${BOLD}rp start-d${RESET}           - Short form of start-detached"
    echo "   ${BOLD}rp start-api${RESET}         - Start just API service (shows only API logs)"
    echo "   ${BOLD}rp start-api-v${RESET}       - Start just API service (shows all logs)"
    echo "   ${BOLD}rp start-web${RESET}         - Start just Web service"
    echo "   ${BOLD}rp start-mobile${RESET}      - Start the mobile Expo container"
    echo "   ${BOLD}rp start-mobile-clear${RESET} - Start the mobile Expo container with a cleared cache"
    echo "   ${BOLD}rp start-mobile-web${RESET}  - Start the mobile app in web mode via Docker"
    echo "   ${BOLD}rp update${RESET}            - Copy main .env to available API, Web, and Mobile directories"
    echo "   ${BOLD}rp status${RESET}            - Show status of all services"
    echo "   ${BOLD}rp stop${RESET}              - Stop all services"
    echo "   ${BOLD}rp clean${RESET}             - Stop and remove volumes"
    echo "   ${BOLD}rp logs${RESET}              - View logs for all services"
    echo "   ${BOLD}rp logs-api${RESET}          - Tail API service logs"
    echo "   ${BOLD}rp logs-web${RESET}          - Tail Web service logs"
    echo "   ${BOLD}rp logs-mobile${RESET}       - Tail Mobile service logs"
    echo "   ${BOLD}rp logs-infra${RESET}        - Tail infrastructure service logs"
    echo "   ${BOLD}rp db${RESET}                - Open a psql prompt inside the DB container"
    echo "   ${BOLD}rp enter${RESET}             - Enter the API container"
    echo "   ${BOLD}rp enter-api${RESET}         - Enter the API container (same as enter)"
    echo "   ${BOLD}rp enter-web${RESET}         - Enter the Web container"
    echo "   ${BOLD}rp enter-mobile${RESET}      - Open a shell in the mobile Docker image"
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
  opts="start start-verbose start-v start-detached start-d start-api start-api-v start-web start-mobile start-mobile-clear start-mobile-web start-mobile-ios start-mobile-android update status stop clean logs logs-api logs-web logs-mobile logs-infra db enter enter-api enter-web enter-mobile help --help -h"

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
echo "   ${BOLD}rp start${RESET}             - Start all services (shows only API + Web + Mobile logs)"
echo "   ${BOLD}rp start-verbose${RESET}     - Start all services (shows all logs)"
echo "   ${BOLD}rp start-v${RESET}           - Short form of start-verbose"
echo "   ${BOLD}rp start-detached${RESET}    - Start all services in detached mode"
echo "   ${BOLD}rp start-d${RESET}           - Short form of start-detached"
echo "   ${BOLD}rp start-api${RESET}         - Start just API service (shows only API logs)"
echo "   ${BOLD}rp start-api-v${RESET}       - Start just API service (shows all logs)"
echo "   ${BOLD}rp start-web${RESET}         - Start just Web service"
echo "   ${BOLD}rp start-mobile${RESET}      - Start the mobile Expo container"
echo "   ${BOLD}rp start-mobile-clear${RESET} - Start the mobile Expo container with a cleared cache"
echo "   ${BOLD}rp start-mobile-web${RESET}  - Start the mobile app in web mode via Docker"
echo "   ${BOLD}rp start-mobile-ios${RESET}  - iOS builds are not supported in Docker"
echo "   ${BOLD}rp start-mobile-android${RESET} - Android builds are not supported in Docker"
echo "   ${BOLD}rp stop${RESET}              - Stop all services"
echo "   ${BOLD}rp status${RESET}            - Show status of all services"
echo "   ${BOLD}rp clean${RESET}             - Stop and remove volumes"
echo "   ${BOLD}rp logs${RESET}              - View logs for all services"
echo

echo "${YELLOW}💡 Environment Configuration:${RESET}"
echo "   Main .env file is automatically copied to any available API, Web, and Mobile directories before starting"
echo "   Edit the main .env file and restart services to apply changes"
echo "   Use ${BOLD}rp update${RESET} to manually copy .env files"
echo

echo "${YELLOW}💡 Tip:${RESET} Just type '${BOLD}rp --help${RESET}' to see all available commands."
echo "${GREEN}${BOLD}Run 'source $SHELL_RC' or restart your terminal to use the 'rp' command.${RESET}"
