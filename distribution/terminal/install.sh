#!/usr/bin/env bash
# Antiporn terminal installer — copy-paste when drag-and-drop is unavailable.
# Live files: this host (https://antiporn.devoutshaman.com) serves zip + install.sh.
# Source: https://github.com/atla-o/antiporn
set -euo pipefail

ORIGIN="${ANTIPORN_ORIGIN:-https://antiporn.devoutshaman.com}"
ORIGIN="${ORIGIN%/}"
DEST="${ANTIPORN_HOME:-$HOME/.local/share/antiporn}"
mkdir -p "$DEST"

if [ -n "${ANTIPORN_CLOUD_URL:-}" ]; then
  ZIP="${ANTIPORN_CLOUD_URL%/}/antiporn-extension.zip"
else
  ZIP="${ORIGIN}/downloads/antiporn-extension.zip"
fi

echo "Antiporn → $DEST"
echo "Fetching extension zip from $ZIP"

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$ZIP" -o "$DEST/antiporn-extension.zip"
elif command -v wget >/dev/null 2>&1; then
  wget -q "$ZIP" -O "$DEST/antiporn-extension.zip"
else
  echo "Need curl or wget." >&2
  exit 1
fi

if command -v unzip >/dev/null 2>&1; then
  rm -rf "$DEST/extension"
  unzip -q -o "$DEST/antiporn-extension.zip" -d "$DEST/extension"
else
  echo "unzip missing; zip saved at $DEST/antiporn-extension.zip" >&2
fi

cat <<EOF

Installed files: $DEST

Load the extension:
  1. Open chrome://extensions
  2. Enable Developer mode
  3. Load unpacked → $DEST/extension

If this machine blocks drag-and-drop, Load unpacked is the fallback.

Source: https://github.com/atla-o/antiporn
EOF
