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
COPY Server/ ./
ENV NODE_ENV=production
ENV PORT=3000
ENV CLIENT_PORT=3001

# Install serve globally to serve the frontend build
RUN npm install -g serve

EXPOSE 3000

# Copy the startup script and make it executable
COPY Server/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# # Start both services
CMD ["/bin/sh", "/app/start.sh"]
