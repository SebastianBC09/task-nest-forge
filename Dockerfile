# Build stage
FROM node:lts-alpine3.22 AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json package-lock.json* ./
RUN npm ci --production=false
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Runtime
FROM node:lts-alpine3.22 AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --only=production --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
USER node
RUN rm -f .env
CMD ["sh", "/entrypoint.sh"]
