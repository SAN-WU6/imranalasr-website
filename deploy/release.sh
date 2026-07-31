#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  Build locally, ship the standalone bundle, restart the service.
#
#  Usage:  SSH_TARGET=imran@1.2.3.4 ./deploy/release.sh
#
#  Requires key-based SSH to the server. It never asks for or
#  handles a password, and never touches DNS.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SSH_TARGET="${SSH_TARGET:?set SSH_TARGET=user@host}"
REMOTE_ROOT="${REMOTE_ROOT:-/var/www/imranalasr}"
SERVICE="${SERVICE:-imran-site}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

cd "$HERE"

echo "▸ preflight"
node scripts/preflight.mjs

echo "▸ build"
npm ci --omit=dev --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund
npm run build

RELEASE="$(date -u +%Y%m%d%H%M%S)"
STAGE="$REMOTE_ROOT/releases/$RELEASE"

echo "▸ ship  →  $SSH_TARGET:$STAGE"
ssh "$SSH_TARGET" "mkdir -p '$STAGE' '$REMOTE_ROOT/shared/data'"

# standalone server + the two asset trees it does not bundle
rsync -az --delete .next/standalone/ "$SSH_TARGET:$STAGE/"
rsync -az --delete .next/static/     "$SSH_TARGET:$STAGE/.next/static/"
rsync -az --delete public/           "$SSH_TARGET:$STAGE/public/"

echo "▸ link shared state and cut over"
ssh "$SSH_TARGET" "
  set -e
  ln -sfn '$REMOTE_ROOT/shared/data' '$STAGE/data'
  ln -sfn '$STAGE' '$REMOTE_ROOT/current'
  sudo systemctl restart '$SERVICE'
  # keep the last five releases so a rollback is one symlink away
  ls -1dt '$REMOTE_ROOT'/releases/*/ | tail -n +6 | xargs -r rm -rf
"

echo "▸ verify"
for i in 1 2 3 4 5 6 7 8 9 10; do
  code=$(ssh "$SSH_TARGET" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ar" || true)
  [ "$code" = "200" ] && { echo "✓ live — release $RELEASE"; exit 0; }
  sleep 2
done

echo "✗ the new release did not answer 200. Rolling back."
ssh "$SSH_TARGET" "
  prev=\$(ls -1dt '$REMOTE_ROOT'/releases/*/ | sed -n 2p)
  [ -n \"\$prev\" ] && ln -sfn \"\$prev\" '$REMOTE_ROOT/current' && sudo systemctl restart '$SERVICE'
"
exit 1
