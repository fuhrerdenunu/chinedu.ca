#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ruby - "$repo_root/_config.yml" <<'RUBY'
require "yaml"

config = YAML.load_file(ARGV.fetch(0))
excluded = Array(config["exclude"])
required = %w[.github docs scripts tests]
missing = required - excluded

abort "Missing source-only Jekyll exclusions: #{missing.join(', ')}" unless missing.empty?
puts "All source-only paths are excluded from Jekyll output."
RUBY
