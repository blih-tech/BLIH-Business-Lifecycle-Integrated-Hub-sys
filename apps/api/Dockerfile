FROM node:22-alpine AS deps
WORKDIR /workspace

COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY apps/web/package*.json apps/web/
COPY packages/database/package*.json packages/database/
COPY packages/types/package*.json packages/types/
COPY packages/typescript-config/package*.json packages/typescript-config/
COPY packages/eslint-config/package*.json packages/eslint-config/
RUN npm ci --workspaces --include-workspace-root --include=dev --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm run build --workspace @repo/types
RUN npm run prisma:generate --workspace blih-system-backend
RUN npm run build --workspace blih-system-backend

FROM node:22-alpine AS prod-deps
WORKDIR /workspace

COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY apps/web/package*.json apps/web/
COPY packages/database/package*.json packages/database/
COPY packages/types/package*.json packages/types/
COPY packages/typescript-config/package*.json packages/typescript-config/
COPY packages/eslint-config/package*.json packages/eslint-config/
RUN npm ci --omit=dev --workspaces --include-workspace-root --ignore-scripts

FROM node:22-alpine AS runtime
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=prod-deps /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/api/package*.json ./apps/api/
COPY --from=builder /workspace/apps/api/dist ./apps/api/dist
COPY --from=builder /workspace/packages/database/package*.json ./packages/database/
COPY --from=builder /workspace/packages/database/dist ./packages/database/dist
COPY --from=builder /workspace/packages/types/package*.json ./packages/types/
COPY --from=builder /workspace/packages/types/dist ./packages/types/dist

WORKDIR /workspace/apps/api
EXPOSE 5000
CMD ["node", "dist/apps/api/src/main"]

FROM builder AS migrator
WORKDIR /workspace
ENV NODE_ENV=production
CMD ["npm", "run", "prisma:migrate:deploy", "--workspace", "@repo/database"]
