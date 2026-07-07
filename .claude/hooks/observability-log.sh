#!/usr/bin/env bash
set -e

# Observability log (I-3)
# Append commit metadata to session log

LOG_FILE="docs/operations/session-log.md"

# Parse arguments: support both positional and --log-to flag
while [[ $# -gt 0 ]]; do
  case $1 in
    --log-to)
      LOG_FILE="$2"
      shift 2
      ;;
    *)
      LOG_FILE="$1"
      shift
      ;;
  esac
done

timestamp=$(date '+%Y-%m-%d %H:%M')
commit_msg=$(git log -1 --pretty=%B)
file_count=$(git diff HEAD~1 --name-only | wc -l)
lines_changed=$(git diff HEAD~1 --numstat | awk '{sum+=$1+$2} END {print sum}')

# Append to session log
mkdir -p "$(dirname "$LOG_FILE")"
# Sanitize commit message (remove pipes to prevent markdown table corruption)
commit_msg=$(echo "$commit_msg" | tr '|' ' ')
echo "| $timestamp | $commit_msg | $file_count files | ~$lines_changed lines |" >> "$LOG_FILE"
