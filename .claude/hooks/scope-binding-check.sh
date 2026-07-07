#!/usr/bin/env bash
set -e

# Scope binding check (I-4)
# Warn if git commit touches >3 files for a single-sentence task

warn_only=${1:-false}

file_count=$(git diff --cached --name-only | wc -l)

if [ "$file_count" -gt 3 ]; then
  msg="WARNING: About to commit changes to $file_count files. Verify this is one logical unit, not scope creep (I-4)."
  if [ "$warn_only" = "--warn-only" ]; then
    echo "$msg"
  else
    echo "ERROR: $msg"
    exit 1
  fi
fi
