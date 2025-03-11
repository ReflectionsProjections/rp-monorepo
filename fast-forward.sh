#!/bin/bash

REPOS=(
    "rp-api"
    "rp-web-2024"
    "rp-admin"
)

WORKING_DIR=$(pwd)

# Clone each repository
for repo in "${REPOS[@]}"; do
    cd $WORKING_DIR/dev/$repo && git reset --hard && git checkout main && git pull
done

cd $WORKING_DIR

wait

echo "Repositories fast-forwarded successfully to main branch."