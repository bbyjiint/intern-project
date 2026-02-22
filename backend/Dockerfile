# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client will be done at runtime
# RUN npx prisma generate

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads/certificates /app/uploads/resumes

# Expose port
EXPOSE 5000

# Default command (can be overridden in docker-compose.yml)
CMD ["npm", "run", "dev"]
