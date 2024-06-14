# Nginx stage
FROM nginx:stable-alpine AS nginx
RUN mkdir -p /var/cache/nginx
COPY apps/web-ui/config/nginx.conf /etc/nginx/conf.d/default.conf

# Builder State
# this needs to be updated to build externally and copy into here
FROM node:18-alpine AS builder
WORKDIR /build
RUN apk add --no-cache git python3 build-base
# Install pnpm
RUN npm install -g pnpm
# Copy the package.json, pnpm-lock.yaml files
# RUN mkdir -p ./apps/web-ui/dist
# COPY package.json pnpm-lock.yaml ./apps/web-ui/dist/

# Install the dependencies
# WORKDIR /build/apps/web-ui/dist
COPY ./ ./
RUN pnpm install --frozen-lockfile

run echo "VERSON_COPY=${VERSION}"
# create a .env file in /apps/web-ui
RUN echo "VITE_TOSHI_MOTO_XPUB=${VITE_TOSHI_MOTO_XPUB}" >> apps/web-ui/.env
RUN echo "VITE_COINGECKO_PRICE_API_URL=/api/prices/simple" >> apps/web-ui/.env
RUN echo "VITE_COINGECKO_API_URL=/api/prices/range" >> apps/web-ui/.env
RUN echo "NODE_ENV=production" >> apps/web-ui/.env
RUN echo "VITE_REST_TIME_BETWEEN_REQUESTS=0" >> apps/web-ui/.env
RUN echo "VITE_MAX_CONCURRENT_REQUESTS=8" >> apps/web-ui/.env
RUN echo "VITE_BITCOIN_NETWORK=mainnet" >> apps/web-ui/.env
RUN echo "VITE_BITCOIN_NODE_URL=http://umbrel.local:3006" >> apps/web-ui/.env

RUN cat apps/web-ui/.env

RUN pnpm run build:umbrel

# Production stage
FROM nginx as production
COPY --from=builder /build/apps/web-ui/dist /usr/share/nginx/html
EXPOSE 8080



CMD ["nginx", "-g", "daemon off;"]