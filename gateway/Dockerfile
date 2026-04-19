FROM node:22-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

COPY packages/ ./packages
COPY gateway/ ./gateway

RUN pnpm install --frozen-lockfile

# RUN pnpm --filter @cab/events build
# RUN pnpm --filter @cab/messaging build
RUN pnpm --filter @cab/observability build

RUN pnpm --filter gateway build

FROM node:22-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

COPY packages/ ./packages
COPY gateway/ ./gateway

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/gateway/dist ./gateway/dist
# COPY --from=builder /app/packages/events/dist ./packages/events/dist
# COPY --from=builder /app/packages/messaging/dist ./packages/messaging/dist
COPY --from=builder /app/packages/observability/dist ./packages/observability/dist

WORKDIR /app/gateway

EXPOSE 4000

CMD ["node", "dist/index.js"]