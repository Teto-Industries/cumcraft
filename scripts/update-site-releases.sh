#!/usr/bin/env bash
set -euo pipefail

output=$(mktemp)
trap 'rm -f "$output"' EXIT
gh api --paginate --slurp "repos/$GH_REPO/releases?per_page=100" | jq -e '
  add // []
  | map(select(.draft | not) | {
      tag_name, name, body, published_at, draft, prerelease, html_url,
      assets: [.assets[] | {name, browser_download_url}]
    })
' > "$output"
cp "$output" site/releases.json
