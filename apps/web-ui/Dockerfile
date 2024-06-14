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
# RUN npm install -g pnpm
# Copy the package.json, pnpm-lock.yaml files
# RUN mkdir -p ./apps/web-ui/dist
# COPY package.json pnpm-lock.yaml ./apps/web-ui/dist/

# Install the dependencies
# WORKDIR /build/apps/web-ui/dist
COPY ./ ./
RUN pnpm install --frozen-lockfile

ARG VITE_TOSHI_MOTO_XPUB
ENV VITE_TOSHI_MOTO_XPUB=$VITE_TOSHI_MOTO_XPUB

RUN pnpm run build

# Production stage
FROM nginx as production
COPY --from=builder /build/apps/web-ui/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]