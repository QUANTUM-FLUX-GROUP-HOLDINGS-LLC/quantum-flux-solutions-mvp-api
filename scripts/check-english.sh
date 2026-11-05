#!/bin/bash
echo "Checking governance: Enforcing English-only code..."

# Revisar nombres de archivos
NON_ASCII_FILES=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | grep -P "[^\x00-\x7F]")
if [ ! -z "$NON_ASCII_FILES" ]; then
  echo "ERROR: Files with non-English characters found:"
  echo "$NON_ASCII_FILES"
  exit 1
fi

# Revisar contenido de código (incluyendo .sh ahora, pero omitiendo este script)
NON_ASCII_CODE=$(grep -rP "[^\x00-\x7F]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.sh" --exclude-dir=node_modules --exclude-dir=.git --exclude="en.json" --exclude="es.json" --exclude="check-english.sh" .)
if [ ! -z "$NON_ASCII_CODE" ]; then
  echo "ERROR: Accents or special characters found in source code."
  echo "$NON_ASCII_CODE"
  exit 1
fi

echo "SUCCESS: All code complies with English standard."
