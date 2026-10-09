#!/usr/bin/env bash
set -euo pipefail

repo_dir=$(cd "$(dirname "$0")/.." && pwd)
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$tmp_dir/photos" "$tmp_dir/bin"
: > "$tmp_dir/photos/test.jpg"

printf '#!/usr/bin/env bash\nprintf "GPS Latitude : 43 N\\n"\n' \
  > "$tmp_dir/bin/exiftool"
chmod +x "$tmp_dir/bin/exiftool"

if EXIFTOOL_BIN="$tmp_dir/bin/exiftool" \
  "$repo_dir/scripts/check-image-metadata.sh" "$tmp_dir/photos"; then
  echo "scanner accepted sensitive metadata" >&2
  exit 1
fi

printf '#!/usr/bin/env bash\nexit 0\n' > "$tmp_dir/bin/exiftool"
chmod +x "$tmp_dir/bin/exiftool"

EXIFTOOL_BIN="$tmp_dir/bin/exiftool" \
  "$repo_dir/scripts/check-image-metadata.sh" "$tmp_dir/photos"
