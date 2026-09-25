#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker-compose.prod.yml"
HEALTH_URL="https://bicikl-kocevar.com/signin"
MAX_ATTEMPTS=30

if [ -z "${GIT_SSH_COMMAND:-}" ] && [ -f "$HOME/.ssh/bike-shop-deploy" ]; then
    export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/bike-shop-deploy -o IdentitiesOnly=yes"
fi

cd "$REPO_DIR"

echo "==> pulling main"
git pull --ff-only

echo "==> building images"
docker compose -f "$COMPOSE" build

echo "==> applying migrations and restarting"
docker compose -f "$COMPOSE" up -d

echo "==> waiting for $HEALTH_URL"
for _ in $(seq "$MAX_ATTEMPTS"); do
    code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$HEALTH_URL" || true)"

    if [ "$code" = "200" ]; then
        echo "==> deploy OK ($HEALTH_URL -> 200)"
        exit 0
    fi

    sleep 3
done

echo "==> deploy finished but health check is failing (last: ${code:-none})" >&2
exit 1
