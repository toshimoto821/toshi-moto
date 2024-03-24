# Nginx stage
FROM nginx:stable-alpine AS nginx
RUN mkdir -p /var/cache/nginx
COPY apps/umbrel-apps/toshi-moto/nginx.conf /etc/nginx/conf.d/default.conf

# Builder State
FROM node:20-buster-slim AS builder
WORKDIR /build
COPY . .
RUN apt-get update
RUN apt-get install -y git python3 build-essential
RUN npm install -g npm@10
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile=false
ENV VITE_COINGECKO_API_URL=/coingecko

RUN pnpm run build

# Production stage
FROM nginx as production
COPY --from=builder /build/apps/web-ui/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]