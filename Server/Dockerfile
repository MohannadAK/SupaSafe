FROM node:18-alpine

# Install PostgreSQL client for database wait script
RUN apk add --no-cache postgresql-client

WORKDIR /app/server

# Copy package files
COPY Server/package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g nodemon

# Copy the wait script
COPY <<EOF /app/wait-for-db.sh
#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."

# Parse DATABASE_URL if it exists
if [ -n "$DATABASE_URL" ]; then
  # This is a basic attempt to parse, might need refinement based on URL format
  DB_HOST=$(echo $DATABASE_URL | sed -e 's/.*@\(.*\):.*/\1/')
  DB_PORT=$(echo $DATABASE_URL | sed -e 's/.*:\(.*\)\/.*$/\1/')
  DB_USER=$(echo $DATABASE_URL | sed -e 's/.*\/\/\(.*\):.*/\1/')
  DB_NAME=$(echo $DATABASE_URL | sed -e 's/.*\/.*\/\(.*\)?.*$/\1/')
  # Note: pg_isready does not directly use the password
  # To check password, a different command or method might be needed if required
fi

until pg_isready -h "\$DB_HOST" -p "\$DB_PORT" -U "\$DB_USER"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - starting app"
exec "\$@"
EOF

RUN chmod +x /app/wait-for-db.sh

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

# The actual code will be mounted as a volume
CMD ["/app/wait-for-db.sh", "npm", "run", "dev"]
