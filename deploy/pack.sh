#!/usr/bin/env bash
#
# Builds the site and packs exactly what the server needs into one archive.
#
#   ./deploy/pack.sh
#
# What ends up in the archive and why:
#   server.js  .next/  node_modules/   the standalone output — self-contained,
#                                      only the modules actually reached
#   .next/static/  public/             assets the standalone step leaves behind
#   scripts/                           db-init and create-admin, run once on the
#                                      server after the first boot
#   data/                              empty, for the SQLite file; the .htaccess
#                                      inside it stops Apache serving the db
#
# Deliberately NOT included: .env / .env.production (secrets belong in the
# cPanel Node.js App environment, not on the wire), src/ TypeScript, tests.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE="$(dirname "$HERE")"
DIST="$HERE/dist"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://imranalasr.sa}"

cd "$SITE"

echo "→ typecheck + tests"
npm run typecheck
npm test

echo "→ build (NEXT_PUBLIC_SITE_URL=$SITE_URL)"
NEXT_PUBLIC_SITE_URL="$SITE_URL" npm run build

echo "→ assembling $DIST"
rm -rf "$DIST"
mkdir -p "$DIST/.next" "$DIST/data" "$DIST/scripts"
cp -R .next/standalone/. "$DIST/"
cp -R .next/static "$DIST/.next/static"
cp -R public "$DIST/public"
cp scripts/db-init.mjs scripts/create-admin.mjs scripts/env.mjs scripts/preflight.mjs "$DIST/scripts/"

# db-init.mjs reads the DDL straight out of src/lib/db/schema.ts at run time.
# The standalone trace does not carry it (nothing imports it as a *file*), so
# without this the database is never created on the server and every form
# submission fails — with the site otherwise looking perfectly healthy.
mkdir -p "$DIST/src/lib/db"
cp src/lib/db/schema.ts "$DIST/src/lib/db/schema.ts"
mkdir -p "$DIST/supabase"
[ -f supabase/schema.sql ] && cp supabase/schema.sql "$DIST/supabase/schema.sql"

# The standalone trace picks the host's own sharp binary. The server is Linux;
# shipping the build machine's macOS/ARM binary means every /_next/image
# request fails there and every photograph on the site breaks. Replace it.
if [ -d "$DIST/node_modules/@img" ]; then
  echo "→ swapping sharp binaries for linux-x64"
  rm -rf "$DIST/node_modules/@img"/*darwin* "$DIST/node_modules/@img"/*win32*
  TMP=$(mktemp -d)
  ( cd "$TMP" && npm init -y >/dev/null 2>&1 \
    && npm install --os=linux --libc=glibc --cpu=x64 --no-audit --no-fund sharp@0.34.4 >/dev/null 2>&1 \
    && npm install --os=linux --libc=musl  --cpu=x64 --no-audit --no-fund sharp@0.34.4 >/dev/null 2>&1 )
  cp -R "$TMP/node_modules/@img/"* "$DIST/node_modules/@img/"
  rm -rf "$TMP"
fi

echo "→ Apache deny rules (the app root is inside public_html)"
cp "$HERE/htaccess-app-root" "$DIST/.htaccess"
for d in data scripts src node_modules .next; do
  [ -d "$DIST/$d" ] && printf 'Require all denied\n' > "$DIST/$d/.htaccess"
done

# Ships inside the bundle too, so re-running a deploy needs no second upload.
cp "$HERE/finish-on-server.sh" "$DIST/finish-on-server.sh"
chmod +x "$DIST/finish-on-server.sh"

echo "→ packing"
rm -f "$HERE/imran-site.tar.gz" "$HERE/imran-site.tar.gz.sha256"
tar --disable-copyfile -czf "$HERE/imran-site.tar.gz" -C "$DIST" .

# The sidecar lets the server prove the upload arrived byte for byte. It cannot
# live inside the archive: adding it would change the very hash it records.
( cd "$HERE" && shasum -a 256 imran-site.tar.gz > imran-site.tar.gz.sha256 )

echo "✓ $HERE/imran-site.tar.gz  ($(du -h "$HERE/imran-site.tar.gz" | cut -f1))"
echo "  sha256:   $(cut -d' ' -f1 < "$HERE/imran-site.tar.gz.sha256")"
echo "  unpacked: $(du -sh "$DIST" | cut -f1)"
