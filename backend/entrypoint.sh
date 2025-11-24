#!/bin/bash
set -e

cd app/

echo "Running database migrations..."
alembic upgrade head

cd ..

echo "Starting application..."
exec "$@"