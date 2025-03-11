#!/bin/bash

# Create a shared directory
SHARED_DIR="shared"
mkdir -p "$SHARED_DIR"

# List of repositories to clone
REPOS=(
    "https://github.com/ReflectionsProjections/rp-api"
    "https://github.com/ReflectionsProjections/rp-web-2024"
)

# Clone each repository
for repo in "${REPOS[@]}"; do
    git clone "$repo" "$SHARED_DIR/$(basename "$repo" .git)"
done

echo "Repositories cloned successfully to $SHARED_DIR."
