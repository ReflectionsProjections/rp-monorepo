#!/bin/bash

cp /.env /shared/rp-api/
cp /.env /shared/rp-web-2024/
cp /.env /shared/rp-admin/

mkdir -p /shared/logs/

setsid bash -c "cd /shared/rp-api && yarn install && yarn start 2>&1 | tee /shared/logs/api.log"  &
setsid bash -c "cd /shared/rp-web-2024 && yarn install && yarn dev --host  2>&1 | tee /shared/logs/web.log" &
setsid bash -c "cd /shared/rp-admin && yarn install && yarn dev --host  2>&1 | tee /shared/logs/admin.log" &

echo "alias npm='echo DO NOT USE NPM COMMANDS'" > /tmp/temp_rc
echo "echo 'run commands here:'"  >> /tmp/temp_rc
exec bash --rcfile /tmp/temp_rc