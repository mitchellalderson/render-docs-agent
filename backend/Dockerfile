# Development stage
FROM node:22-alpine AS development

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files (from backend/ since build context is root for Render)
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY backend/ .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]

# Build stage
FROM node:22-alpine AS build

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files (from backend/ since build context is root)
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Use install instead of ci to handle lockfile version differences
RUN npm install --production=false

# Copy source code
COPY backend/ .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and prisma schema from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client for production
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]

