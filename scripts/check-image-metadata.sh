#!/usr/bin/env bash
set -euo pipefail

photo_root=${1:-photos}
exiftool_bin=${EXIFTOOL_BIN:-exiftool}
sensitive_found=0

while IFS= read -r -d '' file; do
  output=$(
    "$exiftool_bin" \
      -GPSLatitude -GPSLongitude -GPSPosition \
      -SerialNumber -InternalSerialNumber \
      -OwnerName -RawFileName \
      "$file" 2>/dev/null
  )

  if [[ -n "$output" ]]; then
    printf 'Sensitive metadata found in %s\n%s\n' "$file" "$output" >&2
    sensitive_found=1
  fi
done < <(
  find "$photo_root" -type f \
    \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \
       -o -iname '*.heic' -o -iname '*.webp' \) \
    -print0
)

if [[ $sensitive_found -ne 0 ]]; then
  exit 1
fi

echo "No sensitive image metadata found."
