# Development stage
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./

# Use npm install for development
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

# Use install instead of ci to handle lockfile version differences
RUN npm install --production=false

COPY . .

RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Use install with omit=dev instead of ci for compatibility
RUN npm install --omit=dev

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]

