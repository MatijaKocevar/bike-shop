#!/usr/bin/env bash
set -euo pipefail

HOST="${BIKE_SHOP_HOST:-server@192.168.0.10}"
REPO_DIR="${BIKE_SHOP_DIR:-/home/server/Projects/bike-shop}"

echo "==> deploying on $HOST"
ssh -o BatchMode=yes -o ConnectTimeout=10 "$HOST" "cd $REPO_DIR && ./scripts/deploy.sh"
