# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY public/ public/
COPY src/ src/
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY server/ ./

# Copy built frontend from stage 1
COPY --from=frontend-build /app/build ./public

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "server.js"]
