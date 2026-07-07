#!/usr/bin/env bash
set -e

# Drift detection (I-2)
# Check that brand tokens in tailwind.config.ts stay in sync with brand.css
# Check that governance files exist and are non-empty

ERRORS=0

# 1. Verify governance files exist
for file in CLAUDE.md AGENTS.md; do
  if [ ! -f "$file" ]; then
    echo "DRIFT DETECTED: $file is missing"
    ERRORS=$((ERRORS + 1))
  elif [ ! -s "$file" ]; then
    echo "DRIFT DETECTED: $file is empty"
    ERRORS=$((ERRORS + 1))
  fi
done

# 2. Verify brand.css exists (SSOT for brand tokens)
if [ ! -f "src/styles/brand.css" ]; then
  echo "DRIFT DETECTED: src/styles/brand.css (brand token SSOT) is missing"
  ERRORS=$((ERRORS + 1))
fi

# 3. Verify tailwind.config.ts exists
if [ ! -f "tailwind.config.ts" ]; then
  echo "DRIFT DETECTED: tailwind.config.ts is missing"
  ERRORS=$((ERRORS + 1))
fi

# 4. Check that key brand variables are referenced in tailwind config
if [ -f "tailwind.config.ts" ] && [ -f "src/styles/brand.css" ]; then
  for var in bmj-black bmj-cream bmj-red bmj-amber bmj-brown; do
    if ! grep -q "$var" tailwind.config.ts 2>/dev/null; then
      echo "DRIFT DETECTED: $var not found in tailwind.config.ts (should mirror brand.css)"
      ERRORS=$((ERRORS + 1))
    fi
  done
fi

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "Found $ERRORS drift issue(s). Run /brand-check for full audit."
fi
