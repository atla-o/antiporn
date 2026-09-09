#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/package-lock.json"
parts=(
  "$root/docker/lockfile/part00"
  "$root/docker/lockfile/part01"
  "$root/docker/lockfile/part02"
  "$root/docker/lockfile/part03"
  "$root/docker/lockfile/part04"
)
cat "${parts[@]}" > "$dest"
echo "Wrote $dest"
