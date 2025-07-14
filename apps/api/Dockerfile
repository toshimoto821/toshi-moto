# Use a Node.js base image for building the app
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Install Git, Python3, and build-essential
RUN apk add --no-cache git python3 build-base

# Install pnpm
RUN npm install -g pnpm

# Copy the rest of the application files
COPY . .

# Install the dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build:api

# Use a lightweight image for running the app
FROM node:18-alpine

# Create non-root user with UID 1000 and GID 1000
RUN addgroup -g 1000 -S appuser && \
    adduser -u 1000 -S appuser -G appuser

# Set the working directory
WORKDIR /app

# Copy only the build artifacts and node_modules from the previous stage
COPY --from=build /app/dist/apps/api/ .
COPY --from=build /app/node_modules ./node_modules

# Ensure the user 1000 has write permissions to the /app directory
RUN chown -R appuser:appuser /app

# Use user ID 1000
USER appuser

# Set the necessary environment variables
ENV MONGODB_URI="mongodb://toshi-moto_mongodb_1:27021/toshi-moto"
ENV PORT=8121
ENV BITCOIN_NODE_URL=${BITCOIN_NODE_URL}
ENV NEW_RELIC_APP_NAME='toshi-moto-api'
ENV NEW_RELIC_LOG_LEVEL='info'
# env NEW_RELIC_LICENSE_KEY=<key here>
ENV NEW_RELIC_LOG=newrelic_agent.log

# Expose port 8121
EXPOSE 8121

# Start the application
CMD ["node", "-r", "newrelic", "main.js"]
