#!/bin/bash
cd /home/ubuntu/rp-api
sudo pm2 reload ecosystem.config.cjs
# Persist the process list so pm2-root resurrects the API after a reboot.
sudo pm2 save

