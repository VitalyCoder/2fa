FROM node:22-alpine AS build
WORKDIR /source

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=build --chown=nestjs:nodejs /source/dist ./dist
COPY --from=build --chown=nestjs:nodejs /source/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /source/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nestjs

EXPOSE 4200

# Use node directly instead of shell
CMD ["sh", "-c", "npx prisma migrate dev && node dist/src/main"]
