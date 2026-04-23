# --- Build stage ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Inject the API URL pointing to the api container
ENV NEXT_PUBLIC_API_URL=http://localhost:8080

RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only copy what next start needs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
