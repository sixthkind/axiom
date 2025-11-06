# Multi-stage build for Nuxt app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install since no lock file in monorepo)
RUN npm install

# Copy all files
COPY . .

# Build the app (generates static files)
RUN npm run generate

# Production stage
FROM node:20-alpine

# Install http-server globally for serving static files
RUN npm install -g http-server

# Set working directory
WORKDIR /app

# Copy the generated static files from builder stage
COPY --from=builder /app/dist ./public

# Expose port (EasyPanel will use the PORT env variable)
EXPOSE 3000

# Set default PORT if not provided
ENV PORT=3000

# Start the server
CMD ["sh", "-c", "http-server ./public -p ${PORT} --proxy http://localhost:${PORT}?"]

