#!/usr/bin/env bash
#
# Uploads the release tarball to the hosting account over FTP.
#
#   ./deploy/upload-ftp.sh
#
# The password is never stored in this file, never passed on the command line
# (where `ps` would show it) and never written to shell history. It is read
# from the FTP_PASSWORD environment variable if set, otherwise prompted for
# with echo disabled.
#
# Only ONE file goes over the wire. FTP negotiates a fresh data connection per
# file, so uploading ~30,000 unpacked node_modules files takes hours; a single
# ~90 MB archive takes minutes. Unpacking happens on the server.

set -euo pipefail

HOST="${FTP_HOST:-ftp.imranalasr.sa}"
USER="${FTP_USER:-deploy@imranalasr.sa}"
PORT="${FTP_PORT:-21}"
REMOTE_DIR="${FTP_REMOTE_DIR:-public_html/imran-site}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE="$HERE/imran-site.tar.gz"

[ -f "$ARCHIVE" ] || { echo "✗ $ARCHIVE not found — run ./deploy/pack.sh first" >&2; exit 1; }

if [ -z "${FTP_PASSWORD:-}" ]; then
  printf 'FTP password for %s: ' "$USER" >&2
  read -rs FTP_PASSWORD
  printf '\n' >&2
fi
[ -n "$FTP_PASSWORD" ] || { echo "✗ no password given" >&2; exit 1; }

SIZE=$(du -h "$ARCHIVE" | cut -f1)
echo "→ uploading $SIZE to ftp://$HOST/$REMOTE_DIR/"

# ftp.imranalasr.sa runs Pure-FTPd and advertises AUTH TLS, so --ssl-reqd
# succeeds and the password never crosses the network in clear text. The plain
# fallback exists only in case the host changes that, and it asks first.
TLS=1
put() { # put <local> <remote-name>
  local extra=()
  [ "$TLS" -eq 1 ] && extra=(--ssl-reqd)
  curl "${extra[@]}" --ftp-create-dirs -# -T "$1" \
       --user "$USER:$FTP_PASSWORD" \
       "ftp://$HOST:$PORT/$REMOTE_DIR/$2"
}

if ! put "$ARCHIVE" "imran-site.tar.gz"; then
  echo "⚠ FTPS failed. Plain FTP sends your password in clear text." >&2
  printf '  Continue over unencrypted FTP? [y/N] ' >&2
  read -r reply
  case "$reply" in
    [yY]*) TLS=0 ;;
    *) echo "aborted — use SFTP on port 22 instead (it is open on this host)" >&2; exit 1 ;;
  esac
  put "$ARCHIVE" "imran-site.tar.gz" || { echo "✗ upload failed" >&2; exit 1; }
fi

# The checksum sidecar and the finisher are a few KB each; upload both so the
# server can prove the archive arrived intact and then finish the job unaided.
[ -f "$ARCHIVE.sha256" ] && put "$ARCHIVE.sha256" "imran-site.tar.gz.sha256" >/dev/null
put "$HERE/finish-on-server.sh" "finish-on-server.sh" >/dev/null

echo "✓ uploaded$([ "$TLS" -eq 1 ] && echo ' over FTPS (encrypted)' || echo ' over plain FTP')"

cat <<'NEXT'

Now finish it on the server. Port 22 is open on this host, so one command does
the rest — verify, extract, check the runtime, initialise the database, create
the admin, restart Passenger, then test the live site and report what failed:

    ssh <cpanel-user>@imranalasr.sa
    cd ~/public_html/imran-site && bash finish-on-server.sh

If the cPanel Node.js application does not exist yet, the script says so and
tells you exactly which three fields to fill in; create it, then run it again.

No SSH on the account? cPanel → Terminal runs the same command. Failing that,
extract via File Manager and follow DEPLOY.md step by step.
NEXT
