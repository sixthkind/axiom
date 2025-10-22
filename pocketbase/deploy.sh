#!/bin/bash

# Set up systemd
# https://pocketbase.io/docs/going-to-production/
# nano /lib/systemd/system/pocketbase.service

# Load environment variables
set -a  # automatically export all variables
source ../.env
set +a  # stop automatically exporting

ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
  cd ${APP_PATH}
  sudo systemctl stop pocketbase
  echo "rm package-lock.json"
  git pull
  sudo systemctl start pocketbase
  sudo systemctl daemon-reload
ENDSSH
