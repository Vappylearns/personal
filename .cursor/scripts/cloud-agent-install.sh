#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

node --version
npm --version

if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    npm ci --ignore-scripts
  else
    npm install --ignore-scripts
  fi
fi
