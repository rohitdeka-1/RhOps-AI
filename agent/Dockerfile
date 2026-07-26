FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Run as non-root user for security
RUN addgroup -S rhops && adduser -S rhops -G rhops
USER rhops

CMD ["node", "dist/index.js"]
