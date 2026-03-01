# ─────────────────────────────────────────────────────────────────────────────
# frontend/Dockerfile
# Multi-stage build: Node 20 → Nginx 1.25
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (layer-cached until package.json changes)
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine AS serve

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our SPA config
COPY nginx.conf /etc/nginx/conf.d/spa.conf

# Copy built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 internally
EXPOSE 80

# Nginx runs in foreground
CMD ["nginx", "-g", "daemon off;"]
