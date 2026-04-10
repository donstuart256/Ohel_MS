#!/bin/bash
set -e

# Run standard Django migrations
echo "Running database migrations..."
python manage.py migrate_schemas --shared
python manage.py migrate_schemas

# Automatically create a default admin user if it doesn't exist
echo "Creating default superuser..."
export DJANGO_SUPERUSER_PASSWORD=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
python manage.py createsuperuser --noinput --email $DJANGO_SUPERUSER_EMAIL || echo "Superuser already exists."

# Start the web server
echo "Starting gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 core.wsgi:application
