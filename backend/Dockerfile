FROM node:22-slim AS base
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci

FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY . .
RUN npm run build

FROM node:22-slim AS production
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
