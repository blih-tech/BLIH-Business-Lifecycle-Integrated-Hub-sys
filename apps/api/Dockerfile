FROM node:22-alpine AS deps
WORKDIR /workspace

COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY packages/types/package*.json packages/types/
RUN npm ci --workspaces --include-workspace-root

FROM node:22-alpine AS builder
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate --workspace blih-system-backend
RUN npm run build --workspace blih-system-backend

FROM node:22-alpine AS runtime
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/packages/types ./packages/types
COPY --from=builder /workspace/apps/api/package*.json ./apps/api/
COPY --from=builder /workspace/apps/api/dist ./apps/api/dist
COPY --from=builder /workspace/apps/api/src/platform/prisma/schema.prisma ./apps/api/src/platform/prisma/schema.prisma

WORKDIR /workspace/apps/api
EXPOSE 5000
CMD ["node", "dist/apps/api/src/main"]

FROM builder AS migrator
WORKDIR /workspace/apps/api
ENV NODE_ENV=production
CMD ["npm", "run", "prisma:migrate:deploy"]
