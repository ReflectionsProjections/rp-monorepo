#!/bin/bash

declare -A WORKSPACES=(
    ["web"]="$BUILD_WEB"
    ["admin"]="$BUILD_ADMIN"
)

cp /.env /shared/rp-api/
cp /.env /shared/rp-web/

mkdir -p /shared/logs/

setsid bash -c "cd /shared/rp-api && yarn install && yarn start 2>&1 | tee /shared/logs/api.log"  &
setsid bash -c "cd /shared/rp-web && yarn && yarn prepare | tee /shared/logs/web.log"  &

for workspace in "${!WORKSPACES[@]}"; do
    if [[ "${WORKSPACES[$workspace]}" == "true" ]]; then
        echo "Building @rp/$workspace"
        pwd
        mkdir -p "/shared/logs/$workspace"
        setsid bash -c "cd /shared/rp-web && yarn workspace @rp/$workspace dev --host 2>&1 | tee /shared/logs/$workspace/$workspace.log" &
    fi
done

echo "alias npm='echo DO NOT USE NPM COMMANDS'" > /tmp/temp_rc
echo "echo 'run commands here:'"  >> /tmp/temp_rc
exec bash --rcfile /tmp/temp_rc