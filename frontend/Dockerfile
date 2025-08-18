# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - use lightweight nginx
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3000

# Health check (simplified)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
