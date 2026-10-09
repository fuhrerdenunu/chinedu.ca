# chinedu.ca Security Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining Leaflet SRI and response-header findings, make security regression checks reliable, deploy directly to `main`, and verify the live Cloudflare-backed site without breaking its map or galleries.

**Architecture:** Repository changes pin external resource bytes with SRI and move security checks into testable scripts invoked by GitHub Actions. Cloudflare remains the edge in front of GitHub Pages: the apex A records become proxied, and a compatibility-safe response-header transform rule supplies the browser headers that GitHub Pages cannot set.

**Tech Stack:** Jekyll/GitHub Pages, HTML/Liquid/Markdown, Python 3, Bash, GitHub Actions, Cloudflare DNS and Response Header Transform Rules.

---

## File map

- Modify `photos/travel/index.md` for Leaflet SRI.
- Modify `_headers` to document the deployed edge policy.
- Create `scripts/check-external-integrity.py` and `tests/test_external_integrity.py`.
- Create `scripts/check-image-metadata.sh` and `tests/test_image_metadata.sh`.
- Modify `.github/workflows/security-checks.yml` to invoke tested checks.
- Update the security design and final Markdown report after live verification.

### Task 1: Add the external-resource integrity gate

**Files:**
- Create: `scripts/check-external-integrity.py`
- Create: `tests/test_external_integrity.py`

- [ ] **Step 1: Write failing tests**

Create unit tests that feed temporary HTML to the scanner and assert that an external script without SRI fails, a script with `sha384-*` plus `crossorigin="anonymous"` passes, and a Google Fonts stylesheet is an explicit exception because its response varies dynamically.

```python
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SCANNER = REPO / "scripts" / "check-external-integrity.py"

class ExternalIntegrityTests(unittest.TestCase):
    def run_scan(self, html: str):
        with tempfile.TemporaryDirectory() as directory:
            Path(directory, "index.html").write_text(html, encoding="utf-8")
            return subprocess.run(
                [sys.executable, str(SCANNER), directory],
                text=True, capture_output=True, check=False,
            )

    def test_external_script_without_integrity_fails(self):
        result = self.run_scan('<script src="https://unpkg.com/lib.js"></script>')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing integrity", result.stdout)

    def test_secured_external_script_passes(self):
        result = self.run_scan(
            '<script src="https://unpkg.com/lib.js" '
            'integrity="sha384-abc" crossorigin="anonymous"></script>'
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_google_fonts_stylesheet_is_an_exception(self):
        result = self.run_scan(
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne">'
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
```

- [ ] **Step 2: Run tests and observe the expected failure**

Run `python3 -m unittest tests/test_external_integrity.py -v`.

Expected: failure because the scanner does not exist.

- [ ] **Step 3: Implement the scanner**

Use `html.parser.HTMLParser` to scan generated `*.html` files. For every external `<script src>` and non-exempt external stylesheet, require a non-empty `integrity` value and `crossorigin="anonymous"`. Print each violation and return exit code 1; otherwise print a success message and return 0.

```python
#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import argparse

STYLESHEET_EXCEPTIONS = {"fonts.googleapis.com"}

class Scanner(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source
        self.errors = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "script" and self.external(values.get("src")):
            self.require("script", values.get("src", ""), values)
        if tag == "link" and "stylesheet" in (values.get("rel") or "").split():
            href = values.get("href")
            if self.external(href) and urlparse(href).hostname not in STYLESHEET_EXCEPTIONS:
                self.require("stylesheet", href, values)

    @staticmethod
    def external(url):
        return bool(url and urlparse(url).scheme in {"http", "https"})

    def require(self, kind, url, values):
        if not values.get("integrity"):
            self.errors.append(f"{self.source}: {kind} {url} missing integrity")
        if values.get("crossorigin") != "anonymous":
            self.errors.append(f"{self.source}: {kind} {url} missing crossorigin=anonymous")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    root = parser.parse_args().root
    errors = []
    for path in sorted(root.rglob("*.html")):
        scanner = Scanner(path)
        scanner.feed(path.read_text(encoding="utf-8"))
        errors.extend(scanner.errors)
    if errors:
        print("\n".join(errors))
        return 1
    print("All external executable resources satisfy the integrity policy.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run tests and commit**

Run `python3 -m unittest tests/test_external_integrity.py -v`; expect three passing tests.

Commit:

```bash
git add scripts/check-external-integrity.py tests/test_external_integrity.py
git commit -m "test: enforce integrity for external resources"
```

### Task 2: Secure Leaflet and document the edge policy

**Files:**
- Modify: `photos/travel/index.md:6-7`
- Modify: `_headers:1-7`

- [ ] **Step 1: Confirm the generated site currently fails**

Build the site and run `python3 scripts/check-external-integrity.py _site`.

Expected: Leaflet CSS and JavaScript are reported as missing integrity controls.

- [ ] **Step 2: Add verified Leaflet attributes**

```html
<link rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H"
  crossorigin="anonymous"
  referrerpolicy="no-referrer">
<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"></script>
```

- [ ] **Step 3: Update `_headers`**

```text
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000
  Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
```

- [ ] **Step 4: Recompute hashes and rerun the scanner**

```bash
curl -sS https://unpkg.com/leaflet@1.9.4/dist/leaflet.css | openssl dgst -sha384 -binary | openssl base64 -A
curl -sS https://unpkg.com/leaflet@1.9.4/dist/leaflet.js | openssl dgst -sha384 -binary | openssl base64 -A
python3 scripts/check-external-integrity.py _site
```

Expected hashes are `sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H` and `cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH`; scanner passes after rebuild.

- [ ] **Step 5: Commit**

```bash
git add photos/travel/index.md _headers
git commit -m "fix: secure Leaflet and document edge headers"
```

### Task 3: Make the metadata gate enforceable

**Files:**
- Create: `scripts/check-image-metadata.sh`
- Create: `tests/test_image_metadata.sh`
- Modify: `.github/workflows/security-checks.yml`

- [ ] **Step 1: Write the failing shell test**

Create a temporary `photos/test.jpg` and an `exiftool` stub. The first stub prints a GPS field and must make the scanner fail; the second prints nothing and must make it pass.

```bash
#!/usr/bin/env bash
set -euo pipefail
repo_dir=$(cd "$(dirname "$0")/.." && pwd)
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT
mkdir -p "$tmp_dir/photos" "$tmp_dir/bin"
: > "$tmp_dir/photos/test.jpg"
printf '#!/usr/bin/env bash\nprintf "GPS Latitude : 43 N\\n"\n' > "$tmp_dir/bin/exiftool"
chmod +x "$tmp_dir/bin/exiftool"
if EXIFTOOL_BIN="$tmp_dir/bin/exiftool" "$repo_dir/scripts/check-image-metadata.sh" "$tmp_dir/photos"; then
  echo "scanner accepted sensitive metadata" >&2
  exit 1
fi
printf '#!/usr/bin/env bash\nexit 0\n' > "$tmp_dir/bin/exiftool"
chmod +x "$tmp_dir/bin/exiftool"
EXIFTOOL_BIN="$tmp_dir/bin/exiftool" "$repo_dir/scripts/check-image-metadata.sh" "$tmp_dir/photos"
```

- [ ] **Step 2: Run the test and observe failure**

Run `bash tests/test_image_metadata.sh`.

Expected: failure because `scripts/check-image-metadata.sh` does not exist.

- [ ] **Step 3: Implement the scanner with process substitution**

```bash
#!/usr/bin/env bash
set -euo pipefail
photo_root=${1:-photos}
exiftool_bin=${EXIFTOOL_BIN:-exiftool}
sensitive_found=0
while IFS= read -r -d '' file; do
  output=$("$exiftool_bin" -GPSLatitude -GPSLongitude -GPSPosition \
    -SerialNumber -InternalSerialNumber -OwnerName -RawFileName "$file" 2>/dev/null)
  if [[ -n "$output" ]]; then
    printf 'Sensitive metadata found in %s\n%s\n' "$file" "$output" >&2
    sensitive_found=1
  fi
done < <(find "$photo_root" -type f \
  \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.heic' -o -iname '*.webp' \) -print0)
if [[ $sensitive_found -ne 0 ]]; then exit 1; fi
echo "No sensitive image metadata found."
```

- [ ] **Step 4: Update GitHub Actions**

Add `scripts/**`, `tests/**`, and `_headers` to push and pull-request path filters. Replace the inline metadata loop with `scripts/check-image-metadata.sh photos`. Build Jekyll, run both test files, and scan generated `_site` HTML with `scripts/check-external-integrity.py _site`.

- [ ] **Step 5: Run tests and commit**

```bash
chmod +x scripts/check-image-metadata.sh tests/test_image_metadata.sh
bash tests/test_image_metadata.sh
scripts/check-image-metadata.sh photos
python3 -m unittest tests/test_external_integrity.py -v
git add scripts/check-image-metadata.sh tests/test_image_metadata.sh .github/workflows/security-checks.yml
git commit -m "fix: make security regression checks enforceable"
```

Expected: both test suites and the repository-wide metadata scan pass.

### Task 4: Run the repository verification gate

**Files:** Verify all planned files.

- [ ] **Step 1: Run syntax and whitespace checks**

```bash
python3 -m py_compile scripts/check-external-integrity.py tests/test_external_integrity.py
bash -n scripts/check-image-metadata.sh tests/test_image_metadata.sh
git diff --check main...HEAD
```

Expected: zero errors.

- [ ] **Step 2: Run all regression checks**

```bash
python3 -m unittest discover -s tests -p 'test_*.py' -v
bash tests/test_image_metadata.sh
scripts/check-image-metadata.sh photos
```

Expected: every test passes and no sensitive image metadata is reported.

- [ ] **Step 3: Build in Ruby 3.1**

Run the Jekyll build in an isolated Ruby 3.1 container copy, then assert:

```bash
test -f _site/index.html
test -f _site/photos/travel/index.html
test ! -e _site/_config.yml
test ! -e _site/_layouts/default.html
test ! -e _site/README.md
python3 scripts/check-external-integrity.py _site
```

Expected: all assertions pass.

- [ ] **Step 4: Review the final branch**

```bash
git status --short --branch
git diff --stat main...HEAD
git log --oneline main..HEAD
```

Expected: only planned files and focused commits are present.

### Task 5: Integrate and deploy directly to main

**Files:** Git history only.

- [ ] **Step 1: Fast-forward local main**

From the primary checkout run `git merge --ff-only codex/security-remediation`.

- [ ] **Step 2: Push**

Run `git push origin main` and verify the remote accepts the push.

- [ ] **Step 3: Wait for GitHub Pages**

Poll `https://chinedu.ca/photos/travel/` until both exact Leaflet SHA-384 hashes and `crossorigin="anonymous"` appear, using a bounded timeout.

### Task 6: Apply Cloudflare edge headers

**Files:** Cloudflare configuration only.

- [ ] **Step 1: Capture rollback state**

Record all four apex A values, proxy states, SSL mode, current transform rules, apex response headers, and the `www` redirect.

- [ ] **Step 2: Verify Full (strict)**

Do not proxy the apex if Cloudflare SSL/TLS mode is Flexible. Set or retain `Full (strict)` because GitHub Pages presents a valid certificate for the custom domain.

- [ ] **Step 3: Proxy only apex GitHub Pages records**

Change these four `chinedu.ca` A records from DNS-only to Proxied:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Do not alter mail, Microsoft 365, validation, or unrelated records.

- [ ] **Step 4: Health-check the proxy**

Verify apex `200`, `www` redirect, valid TLS, and successful static assets. If any fail, restore the four A records to DNS-only.

- [ ] **Step 5: Apply the transform rule**

Apply the six values in `_headers` to `chinedu.ca` and `www.chinedu.ca`.

- [ ] **Step 6: Verify and roll back narrowly if required**

Check homepage, about, blog, travel map, gallery, 404, feed, scripts, styles, images, and redirects. Disable the transform rule for header-caused breakage; restore DNS-only only for proxy/TLS/origin failures.

### Task 7: Close the final report

**Files:**
- Modify: `docs/superpowers/specs/2026-10-09-security-remediation-design.md`
- Modify: `/Users/chinedu/Documents/Codex/2026-10-08/this/outputs/chinedu-ca-security-assessment-2026-10-08.md`

- [ ] **Step 1: Run focused live security checks**

Verify security headers, Leaflet SRI, source/configuration 404s, representative image metadata, TLS, map behavior, and canonical redirects.

- [ ] **Step 2: Record exact closure evidence**

Append a dated remediation section with pass/fail evidence for CHI-01 through CHI-04. Leave any failing item open.

- [ ] **Step 3: Scan the report for credentials**

```bash
rg -n 'OPENAI_API_KEY=|DEEPSEEK_API_KEY=|sk-[A-Za-z0-9_-]{12,}|Authorization: Bearer' \
  /Users/chinedu/Documents/Codex/2026-10-08/this/outputs/chinedu-ca-security-assessment-2026-10-08.md
```

Expected: no matches.

- [ ] **Step 4: Commit the repository status update and push**

Commit only the repository design-status update if changed, fast-forward `main`, and push. Keep the external report in the Codex outputs directory.
