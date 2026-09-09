# Production image for Cloud Run service antiporn-web.
# Next.js standalone listens on 0.0.0.0:$PORT (Cloud Run default 8080).
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json ./
# Pinned package.json + npm ci. A committed package-lock.json is used locally;
# the image writes one then runs npm ci so Cloud Run still gets a lockfile install.
RUN npm install --package-lock-only --no-audit --no-fund \
  && npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends zip \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run pack:extension
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV HOST=0.0.0.0

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

EXPOSE 8080
USER node
CMD ["node", "server.js"]
