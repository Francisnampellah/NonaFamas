FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache build-base python3

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Build application
COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]