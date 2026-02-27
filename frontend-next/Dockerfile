# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Next.js
# Note: libc6-compat removed as it's not available on ARM64 and not required for Next.js 14

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
# Using npm install instead of npm ci since package-lock.json may not exist
RUN npm install

# Copy source code (will be overridden by volume mount in docker-compose for dev)
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables for Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Default command (can be overridden in docker-compose.yml)
CMD ["npm", "run", "dev"]
