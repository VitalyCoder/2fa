FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma/schema.prisma /app/prisma
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package.json for production install
COPY package*.json ./

# Install production dependencies and Prisma CLI
RUN npm ci --only=production --frozen-lockfile && \
    npm install prisma@latest && \
    npm cache clean --force

# Copy built application and generated Prisma client
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER nestjs

EXPOSE 4200

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
