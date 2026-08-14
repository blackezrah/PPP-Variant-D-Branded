#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FONT_DIR="$PROJECT_DIR/assets/fonts"
DEFAULT_ZIP="$PROJECT_DIR/../Best Lawyers - Buy Side Fonts(2).zip"
FONT_ZIP="${1:-$DEFAULT_ZIP}"

if [[ ! -f "$FONT_ZIP" ]]; then
  echo "Font ZIP not found: $FONT_ZIP" >&2
  echo "Usage: ./setup-fonts.sh '/absolute/path/to/Best Lawyers - Buy Side Fonts(2).zip'" >&2
  exit 1
fi

mkdir -p "$FONT_DIR"
unzip -j -o "$FONT_ZIP" '*.otf' -d "$FONT_DIR" >/dev/null

echo "Installed approved Best Lawyers fonts into: $FONT_DIR"
