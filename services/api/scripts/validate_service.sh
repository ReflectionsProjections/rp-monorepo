#!/bin/bash
# CodeDeploy ValidateService hook: wait until the API answers on /status.
set -euo pipefail

URL="http://127.0.0.1:3000/status"

for _ in $(seq 1 30); do
    if curl -sf -o /dev/null "$URL"; then
        echo "API is healthy at $URL"
        exit 0
    fi
    sleep 2
done

echo "API did not respond at $URL within 60 seconds" >&2
exit 1
