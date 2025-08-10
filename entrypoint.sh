#!/bin/sh
set -e

echo "Starting container - running migrations if any..."

if command -v npx >/dev/null 2>&1; then
  if ! npx prisma migrate deploy; then
    echo "⚠️ Warning: Prisma migrations failed, continuing without them..."
  fi
else
  echo "npx not found — migrations skipped"
fi

echo "Starting NestJS app..."
exec node dist/main
