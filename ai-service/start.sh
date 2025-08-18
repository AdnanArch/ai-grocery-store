#!/bin/bash

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
until curl -f http://backend:8080/api/auth/health > /dev/null 2>&1; do
    echo "Backend not ready yet, waiting..."
    sleep 5
done

echo "Backend is ready! Starting AI service..."

# Start the application
exec gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 60 --preload app:app
