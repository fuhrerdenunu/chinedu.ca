# chinedu.ca Security Remediation Design

**Date:** 2026-10-09  
**Status:** Approved design, pending implementation  
**Target:** `https://chinedu.ca`  
**Repository:** `fuhrerdenunu/chinedu.ca`

## Context

Three owner-authorized ARTEX remediation scans were rerun sequentially against the live site with one worker and low request rates. They produced the same remediation outcome:

- Image EXIF/XMP disclosure: fixed.
- Jekyll configuration/template disclosure: fixed.
- Third-party SRI: partially fixed; jQuery and Lightbox pass, but Leaflet 1.9.4 on `/photos/travel/` lacks SRI.
- HTTP security headers and effective clickjacking protection: not fixed on the apex hostname.
- No injection, traversal, open redirect, exploitable credentialed CORS, cache poisoning, or new known-CVE issue was confirmed.

The repository already contains an `_headers` file, but GitHub Pages does not apply it. Cloudflare inspection showed that `www.chinedu.ca` is proxied and receives some response headers, while the four apex A records for `chinedu.ca` are DNS-only. Because the public site redirects visitors to the apex, Cloudflare currently cannot add headers to the primary hostname.

## Goals

1. Close the remaining Leaflet SRI gap without removing the travel map.
2. Prevent CI from silently accepting image metadata or future third-party resources without SRI.
3. Route the apex site through Cloudflare without changing its GitHub Pages origin.
4. Add effective browser security headers at the Cloudflare edge.
5. Avoid breaking galleries, fonts, maps, static assets, canonical redirects, or GitHub Pages deployment.
6. Retain a fast rollback path for every live delivery change.

## Non-goals

- Migrating the site from GitHub Pages to Cloudflare Pages.
- Removing the Leaflet map.
- Self-hosting CARTO/OpenStreetMap tiles.
- Refactoring unrelated site content or styling.
- Adding authentication, forms, or other application functionality.

## Chosen approach

Use a minimal repository patch plus Cloudflare edge enforcement.

### Repository changes

1. Add verified SRI hashes and `crossorigin="anonymous"` to the Leaflet 1.9.4 CSS and JavaScript references in `photos/travel/index.md`.
2. Add an explicit referrer policy to the Leaflet resource tags.
3. Update `_headers` so it remains accurate documentation of the intended edge policy. It must allow the map's required resource origins if a broader CSP is later enforced.
4. Fix `.github/workflows/security-checks.yml` so metadata detection cannot lose its failure flag in a pipeline subshell.
5. Add a CI check that fails when an external executable script or stylesheet is introduced without a non-empty SRI value and required CORS mode, with documented exceptions for resources where SRI is not technically applicable (for example, Google Fonts' dynamically generated stylesheet).

### Cloudflare changes

1. Record the existing apex DNS records, proxy states, SSL mode, and response-header rules before modification.
2. Confirm Cloudflare SSL/TLS mode is `Full (strict)` while GitHub Pages presents a valid certificate for `chinedu.ca`.
3. Change only the four apex GitHub Pages A records from DNS-only to proxied. Do not proxy or otherwise modify mail, Microsoft 365, verification, or unrelated service records.
4. Reuse or update the existing response-header transform rule so it applies to the proxied apex and `www` hostnames.
5. Add these response headers:

   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
   - `Strict-Transport-Security: max-age=31536000`
   - `Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests`

The initial enforced CSP is deliberately narrow and compatibility-safe. It closes the demonstrated anti-framing and baseline CSP gap without using `default-src` or `script-src` directives that could unexpectedly block Jekyll SEO JSON-LD, inline map initialization, Google Fonts, cdnjs, unpkg, or CARTO tiles. A stricter allowlist CSP should be introduced later through report-only observation and page-specific hash work.

6. Leave `Access-Control-Allow-Origin: *` unchanged because it is supplied by the public static origin and did not produce a credentialed CORS vulnerability.

## Data and request flow

After the change:

1. A visitor resolves `chinedu.ca` to Cloudflare instead of directly to GitHub Pages.
2. Cloudflare establishes an authenticated HTTPS connection to the GitHub Pages origin under Full (strict) mode.
3. GitHub Pages returns the static site.
4. Cloudflare adds the approved response headers and serves the response to the visitor.
5. Browser SRI validation verifies the pinned Leaflet, jQuery, and Lightbox bytes before execution.

## Safety and rollback

### DNS/proxy rollback

If the apex returns TLS errors, redirect loops, 5xx responses, or broken assets after proxying, immediately restore the four apex A records to DNS-only. No origin record values will be changed.

### Header rollback

If a Cloudflare header causes site breakage, disable only the new/updated response-header transform rule. DNS proxying can remain enabled while the rule is corrected, unless the proxy itself is the source of the failure.

### Repository rollback

The repository change will be a focused commit on `main`. It can be reverted with a normal Git revert without rewriting history.

## Verification plan

### Repository verification

- Validate the computed Leaflet hashes against the exact pinned unpkg URLs.
- Run the security workflow logic locally where possible.
- Build the Jekyll site successfully.
- Confirm generated travel HTML contains the expected Leaflet SRI and CORS attributes.
- Confirm no published source/configuration artifact is reintroduced.
- Scan representative and repository-wide images for sensitive metadata.

### Pre-proxy live baseline

- Capture apex and `www` DNS answers, status codes, redirect behavior, certificate chain, and current headers.

### Post-proxy live verification

- Confirm `https://chinedu.ca/` returns `200` through Cloudflare.
- Confirm `https://www.chinedu.ca/` retains its expected canonical redirect.
- Confirm all six required security header families are present on the apex.
- Confirm a cross-origin iframe is blocked by CSP/XFO.
- Confirm home, about, blog, gallery, 404, CSS, JavaScript, images, and feed remain reachable.
- Confirm the travel map loads Leaflet, CARTO tiles, markers, popups, and attribution.
- Confirm Lightbox, navigation, fonts, and responsive controls still work.
- Confirm source/configuration paths remain non-success responses.
- Confirm representative images remain free of EXIF/XMP identifiers.

### Final security verification

Run focused header/SRI checks after deployment. If these pass, update the remediation report to mark:

- CHI-01 closed.
- CHI-02 closed.
- CHI-03 closed by Cloudflare edge policy.
- CHI-04 closed after Leaflet SRI deployment.

## Deployment sequence

1. Implement and verify repository changes locally.
2. Commit and push the focused change directly to `main`, as explicitly requested by the owner.
3. Wait for GitHub Pages deployment and verify the new travel-page markup.
4. Confirm Cloudflare Full (strict) mode.
5. Proxy the four apex A records.
6. Apply/update the response-header rule.
7. Perform immediate smoke and security tests.
8. Roll back the narrow failing layer if any blocking regression appears.

