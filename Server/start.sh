#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."

# Set PostgreSQL environment variables based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
  echo "Using production database configuration (Railway)"
  # Hardcode Railway production details
  export PGHOST="postgres.railway.internal"
  export PGPORT="5432"
  export PGUSER="postgres"
  export PGDATABASE="railway"
  # Rely on PGPASSWORD environment variable provided by Railway
  export PGPASSWORD="$PGPASSWORD"

else
  echo "Using non-production database configuration (local/test)"
  # Use individual variables (for local development/test)
  export PGHOST="$DB_HOST"
  export PGPORT="$DB_PORT"
  export PGUSER="$DB_USER"
  export PGPASSWORD="$DB_PASSWORD"
  export PGDATABASE="$DB_NAME"
fi

RETRY_COUNT=0
MAX_RETRIES=30

# pg_isready uses PGHOST, PGPORT, PGUSER, and PGPASSWORD environment variables
until pg_isready || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  echo "Waiting for PostgreSQL to be ready... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
  RETRY_COUNT=$((RETRY_COUNT+1))
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "ERROR: PostgreSQL did not become ready in time"
  exit 1
fi

echo "PostgreSQL is ready!"

# Create log directories
mkdir -p /app/logs

# Start backend with proper logging
echo "Starting backend..."
cd /app/server
PGPASSWORD="$PGPASSWORD" node src/server.js > /app/logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Give backend a moment to initialize
sleep 5

# Check if backend is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "ERROR: Backend failed to start properly. Logs:"
  cat /app/logs/backend.log
  exit 1
fi

echo "All services started successfully!"

# Function to handle graceful shutdown
graceful_shutdown() {
  echo "Shutting down services..."
  kill -TERM $BACKEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
  echo "Shutdown complete"
  exit 0
}

# Trap signals
trap graceful_shutdown SIGTERM SIGINT

echo "Monitoring service (logs at /app/logs/)"
echo "Press Ctrl+C to stop"

# Monitor backend process and display logs
tail -f /app/logs/backend.log &
TAIL_PID=$!

# Keep the container running and monitor processes
while true; do
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend process died unexpectedly"
    echo "Last backend logs:"
    tail -n 50 /app/logs/backend.log
    # Try to restart the backend
    echo "Attempting to restart backend..."
    cd /app/server
    PGPASSWORD="$PGPASSWORD" node src/server.js > /app/logs/backend.log 2>&1 &
    BACKEND_PID=$!
    sleep 5
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
      echo "Backend restart failed. Logs:"
      cat /app/logs/backend.log
      echo "Exiting..."
      exit 1
    fi
    echo "Backend restarted successfully"
  fi
  
  sleep 5
done 