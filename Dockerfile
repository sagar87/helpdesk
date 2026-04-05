FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY core/package.json core/
COPY client/package.json client/
COPY server/package.json server/
RUN bun install --frozen-lockfile

# Build client
FROM deps AS build
COPY . .
RUN bun run build

# Production
FROM base AS production
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/core ./core
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server ./server
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["bun", "server/src/index.ts"]
