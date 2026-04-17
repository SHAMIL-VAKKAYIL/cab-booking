# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app


# copy workspace config first
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy full source ─────────────────────────────────────────────────────
COPY packages/ ./packages/
COPY auth-service/ ./auth-service/

# install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages (install devDeps like typescript to compile) ───
RUN pnpm --filter @cab/events build
RUN pnpm --filter @cab/messaging build
RUN pnpm --filter @cab/observability build


# Install auth-service deps and build ──────────────────────────────────
RUN pnpm --filter auth-service build

# ─── Stage 2: Production image ───────────────────────────────────────────────
FROM node:22-alpine AS production


RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./


COPY packages/ ./packages/
COPY auth-service/ ./auth-service/

# install production dependencies only
RUN pnpm install --frozen-lockfile --prod


# Copy compiled package output from builder ─────────────────────────────
COPY --from=builder /app/auth-service/dist ./auth-service/dist
COPY --from=builder /app/packages/events/dist ./packages/events/dist
COPY --from=builder /app/packages/messaging/dist ./packages/messaging/dist
COPY --from=builder /app/packages/observability/dist ./packages/observability/dist


WORKDIR /app/auth-service

EXPOSE 4001

CMD ["node", "dist/server.js"]
