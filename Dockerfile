FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p data && npm run prisma:push && npm run db:seed && npm run start -- -p 3000"]
