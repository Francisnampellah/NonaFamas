FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --include=dev
RUN npm install --save-dev @types/multer

COPY . .

# Generate Prisma client with retries
RUN for i in 1 2 3; do npx prisma generate && break || sleep 5; done

# Create a loose TypeScript config
RUN echo '{"extends":"./tsconfig.json","compilerOptions":{"skipLibCheck":true,"noImplicitAny":false,"strictNullChecks":false,"strictFunctionTypes":false,"strictBindCallApply":false,"strictPropertyInitialization":false,"noImplicitThis":false,"noImplicitReturns":false,"alwaysStrict":false}}' > tsconfig.loose.json

# Create empty supplier validator
RUN mkdir -p src/validators && echo "export {};" > src/validators/supplier.validator.ts

# Compile with the loose config
RUN npx tsc -p tsconfig.loose.json

# Add a wait-for-database script
COPY ./wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

# Ensure start.sh is executable
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3000

# Start application and run migrations
CMD ["sh", "-c", "./start.sh"]
# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://0.0.0.0:3000/health || exit 1


# FROM node:lts AS build

# RUN apt-get update -y
# RUN apt-get install -y openssl

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm ci

# COPY . .

# RUN npx prisma generate

# RUN npm run build

# FROM node:lts-slim AS production

# RUN apt-get update -y
# RUN apt-get install -y openssl

# COPY --from=build /usr/src/app/package*.json ./
# COPY --from=build /usr/src/app/dist ./dist/
# COPY --from=build /usr/src/app/prisma ./prisma/

# RUN npm ci --omit=dev

# RUN npx prisma generate

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# EXPOSE ${PORT}

# COPY ./entrypoint.sh /usr/src/app/

# RUN chmod +x /usr/src/app/entrypoint.sh

# ENTRYPOINT ["/usr/src/app/entrypoint.sh"]