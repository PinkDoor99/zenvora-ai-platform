# Zenvora AI Platform - Production Docker Image
# Multi-stage build for optimized production deployment

# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S zenvora -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=zenvora:nodejs /app/dist ./dist
COPY --from=builder --chown=zenvora:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=zenvora:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R zenvora:nodejs /app

# Switch to non-root user
USER zenvora

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Expose port
EXPOSE 3001

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
