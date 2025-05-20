# Build stage for the frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/client
COPY Client/package*.json ./
COPY Client/yarn.lock ./
RUN yarn install
COPY Client/ .
ENV PORT=3001
RUN yarn build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache postgresql-client
COPY --from=frontend-build /app/client/build ./client/build
WORKDIR /app/server
COPY Server/package*.json ./
RUN npm install
COPY Server/ .
ENV NODE_ENV=production
ENV PORT=3000
ENV CLIENT_PORT=3001
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_NAME=supasafe
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
EXPOSE 3000
WORKDIR /app

# Create the startup script as a separate file
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Add timeout to prevent infinite waiting' >> /app/start.sh && \
    echo 'echo "Waiting for PostgreSQL..."' >> /app/start.sh && \
    echo 'RETRY_COUNT=0' >> /app/start.sh && \
    echo 'MAX_RETRIES=30' >> /app/start.sh && \
    echo 'until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do' >> /app/start.sh && \
    echo '  echo "Waiting for PostgreSQL to be ready... (Attempt $RETRY_COUNT/$MAX_RETRIES)"' >> /app/start.sh && \
    echo '  RETRY_COUNT=$((RETRY_COUNT+1))' >> /app/start.sh && \
    echo '  sleep 2' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then' >> /app/start.sh && \
    echo '  echo "ERROR: PostgreSQL did not become ready in time"' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "PostgreSQL is ready!"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Create log directories' >> /app/start.sh && \
    echo 'mkdir -p /app/logs' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start backend with proper logging' >> /app/start.sh && \
    echo 'echo "Starting backend..."' >> /app/start.sh && \
    echo 'cd /app/server' >> /app/start.sh && \
    echo 'node src/server.js > /app/logs/backend.log 2>&1 &' >> /app/start.sh && \
    echo 'BACKEND_PID=$!' >> /app/start.sh && \
    echo 'echo "Backend started with PID: $BACKEND_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Give backend a moment to initialize' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Check if backend is still running' >> /app/start.sh && \
    echo 'if ! kill -0 $BACKEND_PID 2>/dev/null; then' >> /app/start.sh && \
    echo '  echo "ERROR: Backend failed to start properly. Logs:"' >> /app/start.sh && \
    echo '  cat /app/logs/backend.log' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start frontend with proper logging' >> /app/start.sh && \
    echo 'echo "Starting frontend..."' >> /app/start.sh && \
    echo 'cd /app/client' >> /app/start.sh && \
    echo 'FRONTEND_PID=$!' >> /app/start.sh && \
    echo 'echo "Frontend started with PID: $FRONTEND_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Give frontend a moment to initialize' >> /app/start.sh && \
    echo 'sleep 3' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Check if frontend is still running' >> /app/start.sh && \
    echo 'if ! kill -0 $FRONTEND_PID 2>/dev/null; then' >> /app/start.sh && \
    echo '  echo "ERROR: Frontend failed to start properly. Logs:"' >> /app/start.sh && \
    echo '  cat /app/logs/frontend.log' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "All services started successfully!"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Function to handle graceful shutdown' >> /app/start.sh && \
    echo 'graceful_shutdown() {' >> /app/start.sh && \
    echo '  echo "Shutting down services..."' >> /app/start.sh && \
    echo '  kill -TERM $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' >> /app/start.sh && \
    echo '  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' >> /app/start.sh && \
    echo '  echo "Shutdown complete"' >> /app/start.sh && \
    echo '  exit 0' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Trap signals' >> /app/start.sh && \
    echo 'trap graceful_shutdown SIGTERM SIGINT' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Monitoring services (logs at /app/logs/)"' >> /app/start.sh && \
    echo 'echo "Press Ctrl+C to stop"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Monitor both processes and display logs' >> /app/start.sh && \
    echo 'tail -f /app/logs/backend.log /app/logs/frontend.log &' >> /app/start.sh && \
    echo 'TAIL_PID=$!' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Keep the container running and monitor processes' >> /app/start.sh && \
    echo 'while true; do' >> /app/start.sh && \
    echo '  if ! kill -0 $BACKEND_PID 2>/dev/null; then' >> /app/start.sh && \
    echo '    echo "ERROR: Backend process died unexpectedly"' >> /app/start.sh && \
    echo '    echo "Last backend logs:"' >> /app/start.sh && \
    echo '    tail -n 50 /app/logs/backend.log' >> /app/start.sh && \
    echo '    # Try to restart the backend' >> /app/start.sh && \
    echo '    echo "Attempting to restart backend..."' >> /app/start.sh && \
    echo '    cd /app/server' >> /app/start.sh && \
    echo '    node src/server.js > /app/logs/backend.log 2>&1 &' >> /app/start.sh && \
    echo '    BACKEND_PID=$!' >> /app/start.sh && \
    echo '    sleep 5' >> /app/start.sh && \
    echo '    if ! kill -0 $BACKEND_PID 2>/dev/null; then' >> /app/start.sh && \
    echo '      echo "Backend restart failed. Logs:"' >> /app/start.sh && \
    echo '      cat /app/logs/backend.log' >> /app/start.sh && \
    echo '      echo "Exiting..."' >> /app/start.sh && \
    echo '      exit 1' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '    echo "Backend restarted successfully"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  ' >> /app/start.sh && \
    echo '  if ! kill -0 $FRONTEND_PID 2>/dev/null; then' >> /app/start.sh && \
    echo '    echo "ERROR: Frontend process died unexpectedly"' >> /app/start.sh && \
    echo '    echo "Last frontend logs:"' >> /app/start.sh && \
    echo '    tail -n 50 /app/logs/frontend.log' >> /app/start.sh && \
    echo '    # Try to restart the frontend' >> /app/start.sh && \
    echo '    echo "Attempting to restart frontend..."' >> /app/start.sh && \
    echo '    cd /app/client' >> /app/start.sh && \
    echo '    serve -s build -l 3001 > /app/logs/frontend.log 2>&1 &' >> /app/start.sh && \
    echo '    FRONTEND_PID=$!' >> /app/start.sh && \
    echo '    sleep 3' >> /app/start.sh && \
    echo '    if ! kill -0 $FRONTEND_PID 2>/dev/null; then' >> /app/start.sh && \
    echo '      echo "Frontend restart failed. Logs:"' >> /app/start.sh && \
    echo '      cat /app/logs/frontend.log' >> /app/start.sh && \
    echo '      echo "Exiting..."' >> /app/start.sh && \
    echo '      exit 1' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '    echo "Frontend restarted successfully"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  ' >> /app/start.sh && \
    echo '  sleep 5' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    chmod +x /app/start.sh

# # Start both services
CMD ["/bin/sh", "/app/start.sh"]
