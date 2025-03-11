#!/bin/bash

# Create a shared directory
SHARED_DIR="dev"
mkdir -p "$SHARED_DIR"

# List of repositories to clone
REPOS=(
    "git@github.com:ReflectionsProjections/rp-api.git"
    "git@github.com:ReflectionsProjections/rp-web-2024.git"
    "git@github.com:ReflectionsProjections/rp-admin.git"
)

# Clone each repository
for repo in "${REPOS[@]}"; do
    git clone "$repo" "$SHARED_DIR/$(basename "$repo" .git)" &
done

wait

echo "Repositories cloned successfully to $SHARED_DIR."
