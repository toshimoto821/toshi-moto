ARG VITE_TOSHI_MOTO_XPUB
ARG VERSION

# Nginx stage
FROM nginx:stable-alpine AS nginx

RUN mkdir -p /var/cache/nginx
COPY apps/web-ui/config/nginx.conf /etc/nginx/conf.d/default.conf

# Builder State
# this needs to be updated to build externally and copy into here
FROM node:18-alpine AS builder
ARG VITE_TOSHI_MOTO_XPUB
ARG VERSION
WORKDIR /build
RUN apk add --no-cache git python3 build-base
# Install pnpm
RUN npm install -g pnpm

COPY ./ ./
RUN pnpm install --frozen-lockfile

run echo "VERSON_COPY=${VERSION}"
# create a .env file in /apps/web-ui
RUN echo "VITE_TOSHI_MOTO_XPUB=${VITE_TOSHI_MOTO_XPUB}" >> apps/web-ui/.env
RUN echo "NODE_ENV=production" >> apps/web-ui/.env
RUN echo "VITE_REST_TIME_BETWEEN_REQUESTS=0" >> apps/web-ui/.env
RUN echo "VITE_MAX_CONCURRENT_REQUESTS=8" >> apps/web-ui/.env
RUN echo "VITE_BITCOIN_NETWORK=mainnet" >> apps/web-ui/.env
RUN echo "VITE_BITCOIN_NODE_URL=http://umbrel.local:3006" >> apps/web-ui/.env
RUN echo "VITE_IS_UMBREL=true" >> apps/web-ui/.env

RUN pnpm run build:umbrel

# Production stage
FROM nginx as production
COPY --from=builder /build/apps/web-ui/dist /usr/share/nginx/html

# Create nginx cache directories and set permissions for non-root user
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/scgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/log/nginx \
    /var/run \
    /var/lib/nginx/body \
    /var/lib/nginx/fastcgi \
    /var/lib/nginx/proxy \
    /var/lib/nginx/scgi \
    /var/lib/nginx/uwsgi

# Set ownership to user 1000:1000
RUN chown -R 1000:1000 /var/cache/nginx \
    /var/log/nginx \
    /var/run \
    /var/lib/nginx \
    /usr/share/nginx/html \
    /etc/nginx/conf.d \
    /run

# Switch to user 1000:1000
USER 1000:1000

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]