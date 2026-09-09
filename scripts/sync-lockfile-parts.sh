#!/usr/bin/env bash
# Split package-lock.json into docker/lockfile/part* (62 KiB chunks) for GitHub Contents uploads.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/package-lock.json"
out="$root/docker/lockfile"
test -f "$src"
mkdir -p "$out"
rm -f "$out"/part*
python3 - "$src" "$out" <<'PY'
import sys
from pathlib import Path
src = Path(sys.argv[1]).read_bytes()
out = Path(sys.argv[2])
size = 62000
for i, start in enumerate(range(0, len(src), size)):
    (out / f"part{i:02d}").write_bytes(src[start:start + size])
print(f"wrote {(len(src) + size - 1) // size} parts")
PY
