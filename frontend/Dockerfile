# Development stage
FROM node:22-alpine AS development

WORKDIR /app

# Copy package files (from frontend/ since build context is root for Render)
COPY frontend/package*.json ./

# Use npm install for development
RUN npm install

# Copy source code
COPY frontend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files (from frontend/ since build context is root)
COPY frontend/package*.json ./

# Use install instead of ci to handle lockfile version differences
RUN npm install --production=false

# Copy source code
COPY frontend/ .

RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files from build stage
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built application from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]

