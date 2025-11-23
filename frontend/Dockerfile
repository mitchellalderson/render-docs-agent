# Development stage
FROM node:22-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use npm install for development
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use install instead of ci to handle lockfile version differences
RUN npm install --production=false

# Copy source code
COPY . .

# Build-time environment variables for Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

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
COPY --from=build /app/next.config.js ./
# Note: public directory doesn't exist in this project

EXPOSE 3000

CMD ["npm", "start"]

