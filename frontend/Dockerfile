FROM node:22-slim AS base
WORKDIR /app
COPY package-lock.json package.json .
RUN npm ci

FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

FROM base as builder
COPY . .
RUN npm run build

FROM nginx:1.27
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf