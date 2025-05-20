#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."

# Set PostgreSQL environment variables based on DATABASE_URL or individual variables
if [ -n "$DATABASE_URL" ]; then
  # Parse DATABASE_URL using awk
  # Expected format: postgres://user:password@host:port/dbname
  # Split by ://, @, :, and /
  PG_DETAILS=$(echo "$DATABASE_URL" | awk -F'://|@|:' '{print $3, $5, $4}' | awk -F'/' '{print $1, $2}')
  
  # Use echo and read instead of bash-specific here string
  echo "$PG_DETAILS" | {
    read PGUSER PGHOST PGPORT PGDATABASE
    # Export variables from the subshell
    export PGUSER
    export PGHOST
    export PGPORT
    export PGDATABASE
  }
  # Note: PGPASSWORD is not needed for pg_isready, but could be exported if needed elsewhere
  # export PGPASSWORD="$(echo "$DATABASE_URL" | awk -F'://|@|:' '{print $4}')"
else
  # Use individual variables if DATABASE_URL is not set (for local development)
  export PGHOST="$DB_HOST"
  export PGPORT="$DB_PORT"
  export PGUSER="$DB_USER"
  # Note: PGPASSWORD is not needed for pg_isready
  # export PGPASSWORD="$DB_PASSWORD"
fi

# Export variables so pg_isready can use them
export PGHOST
export PGPORT
export PGUSER

RETRY_COUNT=0
MAX_RETRIES=30

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
node src/server.js > /app/logs/backend.log 2>&1 &
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

# Start frontend with proper logging
echo "Starting frontend..."
cd /app/client
serve -s build -l 3001 > /app/logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Give frontend a moment to initialize
sleep 3

# Check if frontend is still running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
  echo "ERROR: Frontend failed to start properly. Logs:"
  cat /app/logs/frontend.log
  exit 1
fi

echo "All services started successfully!"

# Function to handle graceful shutdown
graceful_shutdown() {
  echo "Shutting down services..."
  kill -TERM $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  echo "Shutdown complete"
  exit 0
}

# Trap signals
trap graceful_shutdown SIGTERM SIGINT

echo "Monitoring services (logs at /app/logs/)"
echo "Press Ctrl+C to stop"

# Monitor both processes and display logs
tail -f /app/logs/backend.log /app/logs/frontend.log &
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
    node src/server.js > /app/logs/backend.log 2>&1 &
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
  
  if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "ERROR: Frontend process died unexpectedly"
    echo "Last frontend logs:"
    tail -n 50 /app/logs/frontend.log
    # Try to restart the frontend
    echo "Attempting to restart frontend..."
    cd /app/client
    serve -s build -l 3001 > /app/logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    sleep 3
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
      echo "Frontend restart failed. Logs:"
      cat /app/logs/frontend.log
      echo "Exiting..."
      exit 1
    fi
    echo "Frontend restarted successfully"
  fi
  
  sleep 5
done 