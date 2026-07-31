#!/usr/bin/env bash
#
# Everything after the upload, in one run — ON THE SERVER.
#
#   ssh <cpanel-user>@imranalasr.sa
#   cd ~/public_html/imran-site && bash finish-on-server.sh
#
# Verifies the archive, extracts it, checks the runtime, initialises the
# database, creates the first admin, restarts Passenger and then verifies the
# live site — retrying and repairing the failures that are repairable.
#
# It is safe to run more than once. The previous release is kept until the new
# one answers, so a bad deploy can be rolled back with one move.

set -uo pipefail

APP_DIR="${APP_DIR:-$HOME/public_html/imran-site}"
DOMAIN="${DOMAIN:-imranalasr.sa}"
ARCHIVE="$APP_DIR/imran-site.tar.gz"
# Written by pack.sh and uploaded beside the archive. Kept in a sidecar rather
# than hard-coded here, because this script travels inside the archive it
# would otherwise be checksumming.
SHAFILE="$ARCHIVE.sha256"

ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m⚠\033[0m %s\n' "$*"; }
die()  { printf '  \033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }
step() { printf '\n\033[1m→ %s\033[0m\n' "$*"; }

# ── 1. the archive arrived intact ────────────────────────────────────────
step "1/8  verifying the upload"
[ -f "$ARCHIVE" ] || die "$ARCHIVE not found — the upload did not complete. Re-run ./deploy/upload-ftp.sh"
gzip -t "$ARCHIVE" 2>/dev/null || die "archive is corrupt — the transfer truncated. Re-upload; make sure the client used BINARY mode."
ok "archive present and not corrupt ($(du -h "$ARCHIVE" | cut -f1))"

if command -v sha256sum >/dev/null 2>&1; then GOT=$(sha256sum "$ARCHIVE" | cut -d' ' -f1)
elif command -v shasum >/dev/null 2>&1;   then GOT=$(shasum -a 256 "$ARCHIVE" | cut -d' ' -f1)
else GOT=""; fi
if [ -n "$GOT" ] && [ -f "$SHAFILE" ]; then
  WANT=$(cut -d' ' -f1 < "$SHAFILE")
  if [ "$GOT" = "$WANT" ]; then
    ok "checksum matches the build byte for byte"
  else
    die "checksum mismatch — the upload is not the archive that was built and tested.
     expected $WANT
     got      $GOT
     Re-upload. If it mismatches again, the FTP client is mangling the file: force BINARY mode."
  fi
elif [ -n "$GOT" ]; then
  warn "no .sha256 sidecar uploaded — skipping the byte-for-byte check (gzip integrity passed)"
fi

# ── 2. extract, keeping the previous release ─────────────────────────────
step "2/8  extracting"
cd "$APP_DIR" || die "cannot enter $APP_DIR"
if [ -f server.js ]; then
  PREV="$HOME/imran-site.previous.$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$PREV"
  # data/ is the live database — it must survive the swap, never be archived out.
  for f in server.js package.json .htaccess .next public node_modules scripts src; do
    [ -e "$f" ] && mv "$f" "$PREV/" 2>/dev/null
  done
  ok "previous release set aside in $PREV"
fi
tar xzf "$ARCHIVE" || die "extract failed — check disk quota with: quota -s"
rm -f "$ARCHIVE" "$SHAFILE"
ok "extracted"

for f in server.js .next public node_modules; do
  [ -e "$f" ] || die "$f missing after extract — the archive is not the expected one"
done
ok "tree looks right: server.js .next public node_modules scripts"

# the live database is never shipped; make sure its home exists and is writable
mkdir -p data tmp
chmod 700 data
[ -w data ] || die "data/ is not writable"
ok "data/ ready (0700)"

# ── 3. the runtime ───────────────────────────────────────────────────────
step "3/8  checking the Node runtime"
# Prefer the interpreter cPanel built for this application over the system one.
VENV=$(ls -d "$HOME"/nodevenv/"${APP_DIR#$HOME/}"/*/bin/activate 2>/dev/null | sort -V | tail -1)
if [ -n "$VENV" ]; then
  # shellcheck disable=SC1090
  source "$VENV" && ok "using the application's own Node environment"
else
  warn "no cPanel Node environment found for this path."
  warn "Create it first: cPanel → Setup Node.js App → Create Application"
  warn "  Application root       : ${APP_DIR#$HOME/}"
  warn "  Application startup file: server.js"
  warn "  Application mode       : Production"
  warn "Then run this script again."
fi

command -v node >/dev/null 2>&1 || die "no node on PATH"
NODE_V=$(node -p "process.versions.node")
MAJOR=${NODE_V%%.*}; REST=${NODE_V#*.}; MINOR=${REST%%.*}
ok "node $NODE_V"

SQLITE_OK=0
if [ "$MAJOR" -gt 22 ] || { [ "$MAJOR" -eq 22 ] && [ "$MINOR" -ge 5 ]; }; then
  if node -e "require('node:sqlite')" >/dev/null 2>&1; then
    SQLITE_OK=1; ok "node:sqlite available"
  elif NODE_OPTIONS=--experimental-sqlite node -e "require('node:sqlite')" >/dev/null 2>&1; then
    SQLITE_OK=1
    warn "node:sqlite needs a flag on this version."
    warn "Add this environment variable in Setup Node.js App:  NODE_OPTIONS = --experimental-sqlite"
    export NODE_OPTIONS=--experimental-sqlite
  fi
fi
if [ "$SQLITE_OK" -eq 0 ]; then
  warn "node:sqlite is NOT available on Node $NODE_V (it needs >= 22.5)."
  warn "Pick a newer Node in Setup Node.js App, or switch the database to Supabase:"
  warn "  DB_DRIVER=supabase  SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=..."
  warn "The site still boots either way — only the forms need the database."
fi

# ── 4. sharp — the one that silently breaks every photograph ─────────────
step "4/8  checking the image pipeline"
if [ -d node_modules/@img ]; then
  if ls node_modules/@img/ | grep -q "sharp-linux"; then
    ok "linux sharp binaries present ($(ls node_modules/@img | grep -c linux) packages)"
    node -e "require('sharp');console.log('  loaded')" 2>/dev/null \
      && ok "sharp loads" \
      || warn "sharp did not load — /_next/image will fail. See step 8."
  else
    warn "no linux sharp binary. Every photograph on the site will fail to render."
    warn "Fix from here:  npm install --os=linux --cpu=x64 sharp@0.34.4"
  fi
else
  warn "node_modules/@img is missing entirely"
fi

# ── 5. dependencies ──────────────────────────────────────────────────────
step "5/8  dependencies"
# The standalone bundle already carries every module the server reaches, so a
# reinstall is normally wrong here: cPanel's npm install replaces node_modules
# with a symlink into the virtualenv and takes the linux sharp binaries with it.
if node -e "require('next')" >/dev/null 2>&1; then
  ok "bundled dependencies resolve — no install needed"
else
  warn "next did not resolve; installing"
  npm install --omit=dev --no-audit --no-fund || die "npm install failed"
  npm install --os=linux --cpu=x64 --no-audit --no-fund sharp@0.34.4 || warn "sharp reinstall failed"
  ok "installed"
fi

# ── 6. database + first admin ────────────────────────────────────────────
step "6/8  database"
if [ "$SQLITE_OK" -eq 1 ] || [ "${DB_DRIVER:-sqlite}" = "supabase" ]; then
  if node scripts/db-init.mjs; then ok "schema ready"; else warn "db-init failed — see the message above"; fi

  if [ -f data/imran.db ] && node -e "
    const {DatabaseSync}=require('node:sqlite');
    const d=new DatabaseSync('data/imran.db');
    const r=d.prepare('select count(*) c from admins').get();
    process.exit(r.c>0?0:1)" 2>/dev/null; then
    ok "an admin account already exists — skipping creation"
  else
    step "6b/8  creating the first admin"
    printf '  admin email: '; read -r ADMIN_EMAIL
    printf '  admin password (hidden): '; read -rs ADMIN_PW; printf '\n'
    if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PW" ]; then
      node scripts/create-admin.mjs "$ADMIN_EMAIL" "$ADMIN_PW" && ok "admin created" \
        || warn "admin creation failed — run it again by hand: node scripts/create-admin.mjs <email> '<password>'"
      unset ADMIN_PW
    else
      warn "skipped — create it later: node scripts/create-admin.mjs <email> '<password>'"
    fi
  fi
else
  warn "skipped: no working database driver yet"
fi

# ── 6c. the secret the login depends on ──────────────────────────────────
# create-admin only warns about this in its own shell. The value that actually
# matters is the one Passenger hands the running app, which is set in
# Setup Node.js App — a different place entirely. An admin account with no
# AUTH_SECRET behind it looks fine here and then refuses every sign-in.
if [ -z "${AUTH_SECRET:-}" ] || [ "${#AUTH_SECRET}" -lt 24 ]; then
  warn "AUTH_SECRET is not set in THIS shell."
  warn "That is fine if you set it in cPanel → Setup Node.js App → Environment variables."
  warn "If you have not: generate one now and add it there, then restart —"
  warn "  openssl rand -base64 48"
  warn "Without it, /admin/login rejects every correct password."
else
  ok "AUTH_SECRET present (${#AUTH_SECRET} chars)"
fi

# ── 7. restart ───────────────────────────────────────────────────────────
step "7/8  restarting the application"
mkdir -p tmp && touch tmp/restart.txt
ok "Passenger restart requested (tmp/restart.txt)"
# Poll instead of sleeping blind: a warm app answers in seconds, and a dead one
# should not cost 40 seconds of waiting before the diagnosis starts.
printf '  waiting for the first response'
for _ in $(seq 1 15); do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 6 "https://$DOMAIN/ar" 2>/dev/null)
  [ "$code" = "200" ] && { printf ' up\n'; break; }
  printf '.'; sleep 2
done
printf '\n'

# ── 8. verify the live site, and say plainly what is wrong ───────────────
step "8/8  verifying https://$DOMAIN"
FAIL=0
check() { # check <label> <url> <expected-code>
  local label=$1 url=$2 want=$3 code
  for attempt in 1 2; do
    code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 12 "$url" 2>/dev/null)
    [ "$code" = "$want" ] && { ok "$label → $code"; return 0; }
    [ "$attempt" = 1 ] && sleep 3
  done
  warn "$label → ${code:-no response} (expected $want)"; FAIL=$((FAIL+1)); return 1
}

check "home redirect      /"        "https://$DOMAIN/"       307
check "arabic home        /ar"      "https://$DOMAIN/ar"     200
check "english home       /en"      "https://$DOMAIN/en"     200
check "projects           /ar/projects" "https://$DOMAIN/ar/projects" 200
check "admin is protected /admin"   "https://$DOMAIN/admin"  307
check "robots.txt"                  "https://$DOMAIN/robots.txt" 200

# The one that catches the sharp problem. If this fails, every photo is broken
# even though every page above returned 200.
IMG="https://$DOMAIN/_next/image?url=%2Fprojects%2Fbisha-project%2F12.webp&w=828&q=75"
if check "image pipeline     /_next/image" "$IMG" 200; then :; else
  warn "→ this is the sharp binary. Run:  npm install --os=linux --cpu=x64 sharp@0.34.4"
  warn "  then: touch tmp/restart.txt"
fi

# The database must never be reachable over HTTP.
DB_CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 12 "https://$DOMAIN/imran-site/data/imran.db" 2>/dev/null)
case "$DB_CODE" in
  403|404) ok "database is not exposed over HTTP ($DB_CODE)" ;;
  200) warn "THE DATABASE IS DOWNLOADABLE over HTTP. Move the application root out of public_html now."; FAIL=$((FAIL+1)) ;;
  000|"") warn "database exposure could not be tested — the host did not answer at all. Re-check once the site is up." ;;
  # Anything else is not a file being served, so the .htaccess is doing its job,
  # but say which code it was rather than pretending it was a clean pass.
  *)   ok "database not served as a file (HTTP $DB_CODE)" ;;
esac

printf '\n'
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32m✓ the site is live at https://%s\033[0m\n' "$DOMAIN"
  printf '  Next: cPanel → SSL/TLS Status → run AutoSSL for %s and www.%s\n' "$DOMAIN" "$DOMAIN"
  printf '  Then send a test quote request and confirm it appears in /admin/quotes\n'
else
  printf '\033[33m%d check(s) failed.\033[0m Application log:\n' "$FAIL"
  printf '  cPanel → Setup Node.js App → the app → "log file", or:\n'
  printf '    tail -50 ~/logs/*.log 2>/dev/null; tail -50 %s/stderr.log 2>/dev/null\n' "$APP_DIR"
  if [ -n "${PREV:-}" ]; then
    printf '  To roll back to the release that was working:\n'
    printf '    cd %s && rm -rf server.js .next public node_modules scripts src package.json \\\n' "$APP_DIR"
    printf '      && mv %s/* . && touch tmp/restart.txt\n' "$PREV"
    printf '  (data/ was never touched, so no submissions are lost either way.)\n'
  fi
fi
