# Multi-stage Dockerfile

# 1. Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# 2. Production stage
FROM node:18-alpine

# Install OpenSSL 1.1 for Prisma compatibility
RUN apk add --no-cache ca-certificates openssl openssl-dev

WORKDIR /app

# Copy artifacts from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "dist/main"]
