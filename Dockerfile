# ==============================================================================
# Multi-Stage Production Dockerfile for Zen Internal Super-App (PWA & React SPA)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached if package files unchanged)
COPY package*.json ./
RUN npm ci --no-audit --prefer-offline || npm install

# Build Arguments (provided by Coolify or CI/CD)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_NAME="Zen Internal Super-App"
ARG VITE_APP_SHORT_NAME="ZenInternal"
ARG VITE_APP_VERSION="1.0.0"
ARG VITE_NAVBAR_TITLE="ZEN OPERATIONAL"
ARG VITE_GOOGLE_CLIENT_ID="120918753452-rpp1v3qu3am70ocmvdt4pojlemct1kf6.apps.googleusercontent.com"

# Expose build arguments as environment variables for Vite bundle compilation
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_SHORT_NAME=$VITE_APP_SHORT_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_NAVBAR_TITLE=$VITE_NAVBAR_TITLE
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy project source code
COPY . .

# Compile production bundle to /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Web Server (Nginx Alpine)
# ------------------------------------------------------------------------------
FROM nginx:alpine

# Install curl and wget to ensure all container health checks succeed reliably
RUN apk add --no-cache curl wget

# Remove default Nginx HTML content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA routing, PWA headers & compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Production Healthcheck using explicit IPv4 loopback (127.0.0.1:80)
HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD curl -fs http://127.0.0.1:80/healthz || wget -q -O - http://127.0.0.1:80/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
