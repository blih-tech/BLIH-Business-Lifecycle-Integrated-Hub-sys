FROM node:22-alpine AS deps
WORKDIR /workspace

# Copy package files
COPY package*.json ./
COPY apps/rag-service/package*.json apps/rag-service/
COPY packages/types/package*.json packages/types/

# Install dependencies
RUN npm ci --workspaces --include-workspace-root --include=dev --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /workspace

# Copy dependencies
COPY --from=deps /workspace/node_modules ./node_modules

# Copy source code
COPY . .

# Build types
RUN npm run build --workspace @repo/types

# Build RAG service
RUN npm run build --workspace rag-service

FROM node:22-alpine AS runtime
WORKDIR /workspace

# Copy package files
COPY package*.json ./
COPY apps/rag-service/package*.json apps/rag-service/
COPY packages/types/package*.json packages/types/

# Install only production dependencies
RUN npm ci --workspaces --include-workspace-root --ignore-scripts --only=production

# Copy built application
COPY --from=builder /workspace/apps/rag-service/dist ./apps/rag-service/dist
COPY --from=builder /workspace/packages/types/dist ./packages/types/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S raguser -u 1001

# Change ownership of the app directory
RUN chown -R raguser:nodejs /workspace
USER raguser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "apps/rag-service/dist/main"]
