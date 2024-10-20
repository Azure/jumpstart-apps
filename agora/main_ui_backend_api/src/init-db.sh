#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h $DATABASE_HOST -p 5432 -U $DATABASE_USER; do
  sleep 2
done

echo "Running initdb.sql..."
export PGPASSWORD=$DATABASE_PASSWORD
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -f initdb.sql

echo "Initialization complete."

echo "Starting Python application..."
exec /usr/bin/python3 app.py