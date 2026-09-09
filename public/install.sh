#!/usr/bin/env bash
# Antiporn terminal installer — copy-paste when drag-and-drop is unavailable.
# Distro: https://storage.googleapis.com/antiporn-releases/latest/
# Source: https://github.com/atla-o/antiporn
set -euo pipefail

CLOUD="${ANTIPORN_CLOUD_URL:-https://storage.googleapis.com/antiporn-releases/latest/}"
DEST="${ANTIPORN_HOME:-$HOME/.local/share/antiporn}"
mkdir -p "$DEST"

echo "Antiporn → $DEST"
echo "Fetching extension zip from $CLOUD"

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "${CLOUD}antiporn-extension.zip" -o "$DEST/antiporn-extension.zip"
elif command -v wget >/dev/null 2>&1; then
  wget -q "${CLOUD}antiporn-extension.zip" -O "$DEST/antiporn-extension.zip"
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
