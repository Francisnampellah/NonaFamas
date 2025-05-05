#!/bin/sh
if [ -f .env ]; then
export $(grep -v '^#' .env | xargs)
fi

echo "NODE_ENV: $NODE_ENV"

if [ "$NODE_ENV" = "stg" ] || [ "$NODE_ENV" = "prd" ]; then
echo "building: $NODE_ENV"
npm run build
npm run start
else
echo "building: $NODE_ENV"
npx prisma migrate deploy
npx prisma generate
npm run dev
fi