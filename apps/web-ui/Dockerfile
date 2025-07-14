ARG VITE_TOSHI_MOTO_XPUB
ARG VERSION

# Nginx stage
FROM nginx:stable-alpine AS nginx

# Create non-root user with UID 1000 and GID 1000
RUN addgroup -g 1000 -S nginx && \
    adduser -u 1000 -S nginx -G nginx

RUN mkdir -p /var/cache/nginx
COPY apps/web-ui/config/nginx.conf /etc/nginx/conf.d/default.conf

# Set proper ownership for nginx directories
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx && \
    chown -R nginx:nginx /var/run && \
    chown -R nginx:nginx /var/lib/nginx

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

# Create non-root user with UID 1000 and GID 1000
RUN addgroup -g 1000 -S nginx && \
    adduser -u 1000 -S nginx -G nginx

COPY --from=builder /build/apps/web-ui/dist /usr/share/nginx/html

# Set proper ownership for all nginx directories and files
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx && \
    chown -R nginx:nginx /var/run && \
    chown -R nginx:nginx /var/lib/nginx

# Switch to non-root user
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]