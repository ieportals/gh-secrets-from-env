#!/usr/bin/env bash

set -euo pipefail

ENV_FILE="${1:-.env.test}"
REPO="${2:-${GITHUB_REPO:-}}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is not installed." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: Env file not found: $ENV_FILE" >&2
  exit 1
fi

if [[ -n "$REPO" ]]; then
  echo "Uploading secrets from $ENV_FILE to $REPO..."
else
  echo "Uploading secrets from $ENV_FILE using gh default repo context..."
fi

count=0
while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  line="${raw_line%$'\r'}"

  if [[ -z "${line//[[:space:]]/}" ]]; then
    continue
  fi

  if [[ "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi

  line="${line#export }"

  if [[ "$line" != *"="* ]]; then
    continue
  fi

  key="${line%%=*}"
  value="${line#*=}"

  key="$(echo "$key" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
  value="$(echo "$value" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"

  if [[ -z "$key" ]]; then
    continue
  fi

  if [[ "$value" =~ ^\".*\"$ ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" =~ ^\'.*\'$ ]]; then
    value="${value:1:${#value}-2}"
  fi

  if [[ -n "$REPO" ]]; then
    gh secret set "$key" --body "$value" -R "$REPO"
  else
    gh secret set "$key" --body "$value"
  fi
  count=$((count + 1))
  echo "Set $key"
done < "$ENV_FILE"

if [[ -n "$REPO" ]]; then
  echo "Done. Uploaded $count secret(s) to $REPO."
else
  echo "Done. Uploaded $count secret(s)."
fi
